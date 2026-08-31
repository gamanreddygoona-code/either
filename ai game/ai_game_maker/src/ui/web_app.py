"""
Web UI for AI Game Maker
=======================

Flask-based web application with white minimal UI and right-side tabs.
"""

from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import json
import threading
import time
from pathlib import Path
from typing import Optional, Dict, Any
try: from ..core.config import has_token, token_preview, auth_headers
except Exception: has_token=lambda: False; token_preview=lambda: "missing"; auth_headers=lambda: {}

from ..core.ai_game_maker import AIGameMaker, GenerationConfig, get_game_maker, reset_game_maker
from ..core.project_manager import ProjectManager


app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Global game maker instance
_game_maker: Optional[AIGameMaker] = None
_generation_thread: Optional[threading.Thread] = None


def get_app_game_maker() -> AIGameMaker:
    """Get or create the game maker instance for the web app."""
    global _game_maker
    if _game_maker is None:
        config = GenerationConfig(
            video_source=0,  # Webcam
            target_fps=10.0,
            frame_skip=1,
            resolution=(640, 480),
            creativity=0.7,
            num_levels=3
        )
        _game_maker = AIGameMaker(config)
    return _game_maker


@app.route('/')
def index():
    """Main page."""
    return render_template('index.html')


@app.route('/api/status')
def api_status():
    """Get system status."""
    game_maker = get_app_game_maker()
    
    status = {
        'system': 'running',
        'has_game': game_maker.current_game is not None,
        'is_generating': _generation_thread is not None and _generation_thread.is_alive(),
        'generation_results': len(game_maker.generation_results),
        'video_source': game_maker.config.video_source,
        'target_fps': game_maker.config.target_fps
    }
    
    if game_maker.current_game:
        status['current_game'] = {
            'title': game_maker.current_game.title,
            'genre': game_maker.current_game.genre.value,
            'theme': game_maker.current_game.theme,
            'levels': len(game_maker.current_game.levels)
        }
    
    return jsonify(status)


@app.route('/api/config', methods=['GET', 'POST'])
def api_config():
    """Get or update configuration."""
    game_maker = get_app_game_maker()
    
    if request.method == 'POST':
        data = request.json
        
        # Update config
        if 'video_source' in data:
            game_maker.config.video_source = data['video_source']
        if 'target_fps' in data:
            game_maker.config.target_fps = float(data['target_fps'])
        if 'frame_skip' in data:
            game_maker.config.frame_skip = int(data['frame_skip'])
        if 'creativity' in data:
            game_maker.config.creativity = float(data['creativity'])
        if 'num_levels' in data:
            game_maker.config.num_levels = int(data['num_levels'])
            
        return jsonify({'status': 'success', 'config': game_maker.config.to_dict()})
    
    return jsonify(game_maker.config.to_dict())


@app.route('/api/projects/generate', methods=['POST'])
def api_projects_generate():
    """ProjectGen: Create a new project strictly from video generation."""
    global _generation_thread
    game_maker = get_app_game_maker()
    data = request.json or {}
    duration = float(data.get('duration', 5.0))
    project_name = data.get('project_name')
    source_path = data.get('source_path')  # optional video file on server

    # If video file uploaded via multipart, handle separately via /api/projects/upload
    if game_maker.is_running:
        return jsonify({'error': 'Generation already in progress'}), 429

    def generation_task():
        bundle = game_maker.generate_project_from_video(duration=duration, project_name=project_name, source_path=source_path)
        # store last generation for polling
        game_maker.last_generation = bundle["result"]
        return bundle

    _generation_thread = threading.Thread(target=generation_task)
    _generation_thread.start()
    return jsonify({'status': 'started', 'message': 'ProjectGen started from video', 'duration': duration, 'project_name': project_name})


@app.route('/api/projects/upload', methods=['POST'])
def api_projects_upload():
    """Upload video file and generate project from it (ProjectGen)."""
    global _generation_thread
    game_maker = get_app_game_maker()
    if 'file' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    file = request.files['file']
    project_name = request.form.get('project_name')
    duration = float(request.form.get('duration', 5.0))
    upload_dir = os.path.join('projects', '_uploads')
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, file.filename)
    file.save(filepath)

    # Configure video processor to use file
    game_maker.config.video_source = filepath

    def generation_task():
        bundle = game_maker.generate_project_from_video(duration=duration, project_name=project_name, source_path=filepath)
        game_maker.last_generation = bundle["result"]
        # reset to webcam after
        game_maker.config.video_source = 0
        return bundle

    _generation_thread = threading.Thread(target=generation_task)
    _generation_thread.start()
    return jsonify({'status': 'started', 'filepath': filepath, 'project_name': project_name})


@app.route('/api/projects', methods=['GET'])
def api_projects_list():
    pm = get_app_game_maker().project_manager
    projects = [p.to_dict() for p in pm.list_projects()]
    return jsonify({'projects': projects, 'stats': pm.stats()})


@app.route('/api/projects/<project_id>', methods=['GET'])
def api_project_get(project_id):
    pm = get_app_game_maker().project_manager
    bundle = pm.get_project(project_id)
    if not bundle:
        return jsonify({'error': 'Project not found'}), 404
    return jsonify(bundle)


@app.route('/api/projects/<project_id>/load', methods=['POST'])
def api_project_load(project_id):
    game_maker = get_app_game_maker()
    success = game_maker.load_project(project_id)
    if success:
        return jsonify({'status': 'success', 'project_id': project_id, 'game': game_maker.current_game.to_dict() if game_maker.current_game else None})
    return jsonify({'error': 'Failed to load project'}), 500


@app.route('/api/projects/<project_id>/world', methods=['GET'])
def api_project_world(project_id):
    pm = get_app_game_maker().project_manager
    bundle = pm.get_project(project_id)
    if not bundle: return jsonify({'error':'Project not found'}),404
    # world stored as world.json or in game_design metadata
    p = Path(f"projects/{project_id}/world.json")
    if p.exists():
        return jsonify(json.load(open(p)))
    gd = bundle.get('game_design',{})
    if 'world' in gd: return jsonify(gd['world'])
    if 'metadata' in gd and 'world' in gd['metadata']: return jsonify(gd['metadata']['world'])
    return jsonify({'error':'world not found — world code now required, regenerate project'}),404

@app.route('/api/projects/<project_id>', methods=['DELETE'])
def api_project_delete(project_id):
    pm = get_app_game_maker().project_manager
    ok = pm.delete_project(project_id)
    if ok:
        return jsonify({'status': 'deleted', 'project_id': project_id})
    return jsonify({'error': 'not found'}), 404


@app.route('/api/generate', methods=['POST'])
def api_generate():
    """Legacy: redirect to ProjectGen."""
    global _generation_thread
    
    game_maker = get_app_game_maker()
    data = request.json or {}
    
    duration = float(data.get('duration', 5.0))
    project_name = data.get('project_name')
    
    def generation_task():
        bundle = game_maker.generate_project_from_video(duration=duration, project_name=project_name)
        return bundle["result"].to_dict() if bundle["result"] else {}
    
    # Run generation in background
    _generation_thread = threading.Thread(target=generation_task)
    _generation_thread.start()
    
    return jsonify({'status': 'started', 'message': 'Generation started via ProjectGen (video)', 'project_gen': True})


@app.route('/api/generation/status')
def api_generation_status():
    """Get generation status."""
    global _generation_thread
    
    game_maker = get_app_game_maker()
    
    status = {
        'is_generating': _generation_thread is not None and _generation_thread.is_alive(),
        'last_generation': game_maker.last_generation.to_dict() if game_maker.last_generation else None
    }
    
    return jsonify(status)


@app.route('/api/game')
def api_game():
    """Get current game design."""
    game_maker = get_app_game_maker()
    
    if game_maker.current_game:
        return jsonify(game_maker.current_game.to_dict())
    else:
        return jsonify({'error': 'No game generated yet'}), 404


@app.route('/api/game/level/<int:level_index>')
def api_game_level(level_index: int):
    """Get a specific level from the current game."""
    game_maker = get_app_game_maker()
    
    if not game_maker.current_game:
        return jsonify({'error': 'No game generated yet'}), 404
    
    if level_index < 0 or level_index >= len(game_maker.current_game.levels):
        return jsonify({'error': 'Invalid level index'}), 400
    
    level = game_maker.current_game.levels[level_index]
    return jsonify(level.to_dict())


@app.route('/api/game/save', methods=['POST'])
def api_game_save():
    """Save current game."""
    game_maker = get_app_game_maker()
    data = request.json
    
    if not game_maker.current_game:
        return jsonify({'error': 'No game to save'}), 400
    
    filename = data.get('filename', 'game_design.json')
    filepath = os.path.join('generated_games', filename)
    
    # Create directory if it doesn't exist
    os.makedirs('generated_games', exist_ok=True)
    
    game_maker.save_current_game(filepath)
    
    return jsonify({'status': 'success', 'filepath': filepath})


@app.route('/api/game/load', methods=['POST'])
def api_game_load():
    """Load a game from file."""
    game_maker = get_app_game_maker()
    data = request.json
    
    filepath = data.get('filepath')
    if not filepath:
        return jsonify({'error': 'No filepath provided'}), 400
    
    # For security, only allow loading from generated_games directory
    if not filepath.startswith('generated_games'):
        filepath = os.path.join('generated_games', filepath)
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    success = game_maker.load_game(filepath)
    
    if success:
        return jsonify({'status': 'success'})
    else:
        return jsonify({'error': 'Failed to load game'}), 500


@app.route('/api/motion')
def api_motion():
    """Get motion analysis data."""
    game_maker = get_app_game_maker()
    return jsonify(game_maker.get_motion_analysis())


@app.route('/api/research/export', methods=['POST'])
def api_research_export():
    """Export research data."""
    game_maker = get_app_game_maker()
    data = request.json
    
    filename = data.get('filename', f'research_data_{time.time()}.json')
    filepath = os.path.join('research_data', filename)
    
    # Create directory if it doesn't exist
    os.makedirs('research_data', exist_ok=True)
    
    game_maker.export_research_data(filepath)
    
    return jsonify({'status': 'success', 'filepath': filepath})


@app.route('/api/frame', methods=['POST'])
def api_frame():
    """
    ProjectGen: Single frame treated as 1-frame video -> creates a Project.
    """
    game_maker = get_app_game_maker()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save temporarily
    temp_path = os.path.join('temp', file.filename)
    os.makedirs('temp', exist_ok=True)
    file.save(temp_path)
    
    # Generate PROJECT from image (1-frame video)
    bundle = game_maker.generate_project_from_image(temp_path, project_name=request.form.get('project_name'))
    result = bundle["result"]
    project = bundle["project"]
    
    # Clean up temp (keep project copy via video_meta)
    if os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except: pass
    
    if result.success:
        return jsonify({**result.to_dict(), "project": project.to_dict() if project else None, "project_gen": True})
    else:
        return jsonify({'error': result.error}), 500


@app.route('/static/<path:path>')
def serve_static(path):
    """Serve static files."""
    return send_from_directory('static', path)


@app.route('/generated_games/<path:path>')
def serve_generated_games(path):
    """Serve generated game files."""
    return send_from_directory('generated_games', path)


@app.route('/api/backend/status')
def api_backend_status():
    return jsonify({"backend_token": "set" if has_token() else "missing", "preview": token_preview() if has_token() else None, "note": "Token only at backend; never exposed to frontend"})

@app.route('/research_data/<path:path>')
def serve_research_data(path):
    """Serve research data files."""
    return send_from_directory('research_data', path)


@app.teardown_appcontext
def teardown_appcontext(exception):
    """Clean up on app teardown."""
    global _game_maker, _generation_thread
    
    if _game_maker:
        _game_maker.cleanup()
        _game_maker = None
    
    if _generation_thread and _generation_thread.is_alive():
        _generation_thread.join(timeout=1.0)


if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('static', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    os.makedirs('generated_games', exist_ok=True)
    os.makedirs('research_data', exist_ok=True)
    os.makedirs('temp', exist_ok=True)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
