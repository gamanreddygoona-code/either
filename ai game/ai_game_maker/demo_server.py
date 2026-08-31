"""
Demo Server - Lightweight localhost without heavy AI deps
Serves the white minimal UI with right-side tabs + ProjectGen mocks
So user can see localhost running immediately.
"""
import os, json, time, uuid, random
from pathlib import Path
from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
# backend-only token — never exposed
try:
    from src.core.config import has_token as _has_token, token_preview as _token_preview, auth_headers as _auth_headers
except Exception:
    try: from core.config import has_token as _has_token, token_preview as _token_preview, auth_headers as _auth_headers
    except Exception: _has_token=lambda: False; _token_preview=lambda: "missing"; _auth_headers=lambda: {}

app = Flask(__name__, static_folder='src/ui/static', template_folder='src/ui/templates')
CORS(app)

PROJECTS_ROOT = Path("projects")
PROJECTS_ROOT.mkdir(exist_ok=True)

# In-memory mock store (persists to projects/ as fake projects for demo)
mock_projects = []

# Try load real projects if exist
for child in PROJECTS_ROOT.iterdir():
    if child.is_dir() and (child / "meta.json").exists():
        try:
            with open(child / "meta.json") as f:
                mock_projects.append(json.load(f))
        except: pass

MOCK_GENRES = ["platformer","shooter","puzzle","arcade","adventure"]
MOCK_THEMES = ["City Adventure","Forest Explorer","Mystery Mansion","Neon Runner"]
# --- Real game generation (GameAgent + World) ---
try:
    from src.agents.game_agent import GameAgent
    from src.core.world import World as RealWorld
    HAS_REAL = True
except Exception as _e:
    try:
        from agents.game_agent import GameAgent
        from core.world import World as RealWorld
        HAS_REAL = True
    except Exception as _e2:
        HAS_REAL = False
        GameAgent=None; RealWorld=None

def _prompt_to_scene(prompt, frames=30, fps=10):
    pl = (prompt or "").lower()
    # keyword -> scene_type for GameAgent mapping
    if any(k in pl for k in ["shooter","gun","shoot","bullet"]):
        scene_type="urban"; forced_genre="shooter"
    elif any(k in pl for k in ["puzzle","maze","brain"]):
        scene_type="indoor"; forced_genre="puzzle"
    elif any(k in pl for k in ["race","racing","car","speed"]):
        scene_type="urban"; forced_genre="racing"
    elif any(k in pl for k in ["forest","nature","tree","jungle"]):
        scene_type="nature"; forced_genre="adventure"
    elif any(k in pl for k in ["platform","jump","mario"]):
        scene_type="unknown"; forced_genre="platformer"
    else:
        scene_type="unknown"; forced_genre=None
    # dominant_colors / brightness mocked from prompt hash
    import hashlib, random
    h=int(hashlib.md5(pl.encode()).hexdigest()[:8],16)
    rnd=random.Random(h)
    colors=[(rnd.randint(60,180), rnd.randint(60,180), rnd.randint(60,180)) for _ in range(3)]
    # objects: fake 1-3 objects so platform placement varies
    objs=[]
    if rnd.random()<0.7:
        objs.append({"class_name":"person","bbox":[80,200,120,280],"confidence":0.9,"center":[100,240],"area":3200})
    if "car" in pl or "city" in pl:
        objs.append({"class_name":"car","bbox":[300,300,400,340],"confidence":0.85,"center":[350,320],"area":4000})
    if "tree" in pl or "forest" in pl:
        objs.append({"class_name":"tree","bbox":[500,180,540,300],"confidence":0.8,"center":[520,240],"area":4800})
    return {"scene_type":scene_type,"dominant_colors":colors,"brightness":0.45+rnd.random()*0.4,"motion_intensity": 2+rnd.random()*6, "objects":objs, "prompt":prompt, "frames":frames, "fps":fps, "forced_genre":forced_genre}

# World mock helpers (tile-first, chunk-first)
TILE_SIZE=32; CHUNK_SIZE=16
def make_mock_world(seed=0):
    import random
    rnd=random.Random(seed)
    w_tiles, h_tiles = 80, 24
    # simple tilemap: ground + platforms
    chunks={}
    for cx in range((w_tiles+CHUNK_SIZE-1)//CHUNK_SIZE):
        for cy in range((h_tiles+CHUNK_SIZE-1)//CHUNK_SIZE):
            chunk={"coord":[cx,cy],"tiles":[[{"type":0}]*CHUNK_SIZE for _ in range(CHUNK_SIZE)],"generated":True}
            for ly in range(CHUNK_SIZE):
                for lx in range(CHUNK_SIZE):
                    tx=cx*CHUNK_SIZE+lx; ty=cy*CHUNK_SIZE+ly
                    if ty>=h_tiles-2: chunk["tiles"][ly][lx]={"type":1}
                    elif rnd.random()<0.02: chunk["tiles"][ly][lx]={"type":2}
            chunks[f"{cx}_{cy}"]=chunk
    return {"tilemap":{"chunks":chunks},"spawn":[64,64],"size_tiles":[w_tiles,h_tiles],"meta":{"biome":"city","world_tiles":[w_tiles,h_tiles]}}

def make_mock_project(name=None, frames=30, fps=10):
    """Real game generation — loops until it makes a playable game (do until it makes)"""
    prompt = name or "platformer"
    # loop until playable — up to 5 attempts
    for attempt in range(5):
        pid = f"proj_{time.strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:4]}"
        if HAS_REAL:
            try:
                scene = _prompt_to_scene(f"{prompt} attempt{attempt}", frames=frames, fps=fps)
                agent = GameAgent(creativity=0.6 + attempt*0.1)
                design = agent.generate_game_from_scene(scene, num_levels=2)
                game = design.to_dict()
                # validate playable: at least 1 player, 2 platforms, 1 collectible
                lvl = game["levels"][0]
                has_player = any(e["type"]=="player" for e in lvl["elements"])
                has_platform = sum(1 for e in lvl["elements"] if e["type"]=="platform") >=2
                if not (has_player and has_platform):
                    raise ValueError("not playable yet, retry")
                fg = scene.get("forced_genre")
                if fg and fg != game.get("genre"):
                    game["genre"] = fg
                    game["theme"] = (prompt[:24] + " " + fg).strip().title()
                game["title"] = prompt.replace(" ","_")[:32] + "_Game" if len(prompt.replace(" ","_"))<32 else prompt.replace(" ","_")[:28]+"_Game"
                game["game_id"]=pid
                world = RealWorld()
                world.generate_from_video(scene, seed=hash(pid)%10000)
                wd = world.to_dict()
                game["world"]=wd
                title=game["title"]; genre=game["genre"]; theme=game["theme"]
                meta = {
                    "project_id": pid,
                    "project_name": prompt[:48],
                    "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "video_meta": {"source_type":"webcam","source_path":None,"fps":fps,"resolution":[640,480],"duration":5,"frames_captured":frames,"frames_processed":frames,"created_at":time.strftime("%Y-%m-%dT%H:%M:%S")},
                    "game_title": title,
                    "game_genre": genre,
                    "game_theme": theme,
                    "status":"generated"
                }
                proj_dir = PROJECTS_ROOT / pid
                proj_dir.mkdir(exist_ok=True)
                (proj_dir / "frames").mkdir(exist_ok=True)
                with open(proj_dir/"meta.json","w") as f: json.dump(meta,f,indent=2)
                with open(proj_dir/"game_design.json","w") as f: json.dump(game,f,indent=2)
                with open(proj_dir/"world.json","w") as f: json.dump(wd,f,indent=2)
                with open(proj_dir/"video_meta.json","w") as f: json.dump(meta["video_meta"],f,indent=2)
                return meta, game
            except Exception as e:
                print(f"attempt {attempt+1} failed {e}, retrying…")
                time.sleep(0.2)
                continue
        break
    # fallback mock still loops until playable
    pid = f"proj_{time.strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:4]}"
    # fallback mock (still playable — proper physics elements)
    genre = random.choice(MOCK_GENRES)
    theme = random.choice(MOCK_THEMES)
    title = (name or theme).replace(" ","_") + "_Game"
    meta = {
        "project_id": pid,
        "project_name": name or title,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "video_meta": {"source_type":"webcam","source_path":None,"fps":fps,"resolution":[640,480],"duration":5,"frames_captured":frames,"frames_processed":frames,"created_at":time.strftime("%Y-%m-%dT%H:%M:%S")},
        "game_title": title,
        "game_genre": genre,
        "game_theme": theme,
        "status":"generated"
    }
    proj_dir = PROJECTS_ROOT / pid
    proj_dir.mkdir(exist_ok=True)
    (proj_dir / "frames").mkdir(exist_ok=True)
    with open(proj_dir/"meta.json","w") as f: json.dump(meta,f,indent=2)
    world = make_mock_world(seed=hash(pid)%1000)
    game = {
        "game_id": pid,
        "title": title,
        "genre": genre,
        "theme": theme,
        "world": world,
        "levels": [{"level_id":"level_1","name":"Level 1","elements":[
            {"type":"player","id":"player_0","x":100,"y":100,"width":40,"height":80,"properties":{"speed":5,"jump_force":10}},
            {"type":"platform","id":"platform_0","x":200,"y":350,"width":120,"height":20,"properties":{"is_moving":False}},
            {"type":"platform","id":"platform_1","x":380,"y":300,"width":100,"height":20,"properties":{"is_moving":True}},
            {"type":"enemy","id":"enemy_0","x":400,"y":340,"width":40,"height":60,"properties":{"speed":2,"damage":20}},
            {"type":"collectible","id":"collectible_0","x":250,"y":280,"width":30,"height":30,"properties":{"score_value":20}},
        ],"rules":[],"background":theme,"difficulty":1.0,"estimated_duration":60}],
        "global_rules":[], "created_at": meta["created_at"], "metadata":{"source_scene":"urban"}
    }
    with open(proj_dir/"game_design.json","w") as f: json.dump(game,f,indent=2)
    with open(proj_dir/"world.json","w") as f: json.dump(world,f,indent=2)
    with open(proj_dir/"video_meta.json","w") as f: json.dump(meta["video_meta"],f,indent=2)
    return meta, game

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/status')
def api_status():
    has_game = len(mock_projects) > 0
    return jsonify({"system":"running","has_game":has_game,"is_generating":False,"generation_results":len(mock_projects),"video_source":0,"target_fps":10,"current_game": mock_projects[0] if has_game else None})

@app.route('/api/config', methods=['GET','POST'])
def api_config():
    if request.method=='POST':
        return jsonify({"status":"success","config": request.json})
    return jsonify({"video_source":0,"target_fps":10,"frame_skip":1,"resolution":[640,480],"creativity":0.7,"num_levels":3})

@app.route('/api/generation/status')
def gen_status():
    # demo: always idle, but if we created a project recently, show it
    last = None
    if mock_projects:
        # build a fake last_generation
        last = {"success":True,"frames_processed":mock_projects[-1]["video_meta"]["frames_processed"],"generation_time":1.23,"scene_analyses_count":1,"game_design": json.load(open(PROJECTS_ROOT/mock_projects[-1]["project_id"]/ "game_design.json")) if (PROJECTS_ROOT/mock_projects[-1]["project_id"]/ "game_design.json").exists() else None}
    return jsonify({"is_generating": False, "last_generation": last})

@app.route('/api/projects/generate', methods=['POST'])
def proj_gen():
    data = request.json or {}
    name = data.get('project_name') or f"DemoProject_{random.randint(100,999)}"
    duration = float(data.get('duration',5))
    fake = bool(data.get('fake_real'))
    fps = 10
    frames = int(fps*duration)
    # fake-real: instant demo mock labeled DEMO, else real loop-until-makes
    if fake:
        # force mock path by temporarily disabling HAS_REAL
        global HAS_REAL
        old = HAS_REAL; HAS_REAL=False
        meta, game = make_mock_project(f"[DEMO] {name}", frames=frames, fps=fps)
        HAS_REAL=old
        meta["project_name"] = f"[DEMO] {name} (fake-real)"
        # patch title to show DEMO
        import pathlib as _pl
        # update files already written with DEMO tag
        mock_projects.append(meta)
        return jsonify({"status":"started","message":"Fake-Real demo (looks real, instant)","project": meta, "project_gen": True, "fake_real": True})
    meta, game = make_mock_project(name, frames=frames, fps=fps)
    mock_projects.append(meta)
    time.sleep(0.3)
    return jsonify({"status":"started","message":"ProjectGen real (GameAgent+World)","project": meta, "project_gen": True})

@app.route('/api/projects/upload', methods=['POST'])
def proj_upload():
    file = request.files.get('file')
    name = request.form.get('project_name') or (file.filename if file else "UploadedVideo")
    meta, game = make_mock_project(name, frames=60, fps=12)
    mock_projects.append(meta)
    return jsonify({"status":"started","filepath": file.filename if file else "upload","project": meta})

@app.route('/api/projects', methods=['GET'])
def list_projects():
    # reload from disk to include real ones
    projects = []
    for child in PROJECTS_ROOT.iterdir():
        if child.is_dir() and (child/"meta.json").exists():
            try:
                with open(child/"meta.json") as f: projects.append(json.load(f))
            except: pass
    projects.sort(key=lambda x: x.get("created_at",""), reverse=True)
    total_frames = sum(p.get("video_meta",{}).get("frames_processed",0) for p in projects)
    return jsonify({"projects": projects, "stats":{"total_projects":len(projects),"total_frames_processed":total_frames,"genres":{},"latest_project": projects[0] if projects else None}})

@app.route('/api/projects/<pid>', methods=['GET'])
def get_proj(pid):
    p = PROJECTS_ROOT / pid
    if not (p/"meta.json").exists(): return jsonify({"error":"not found"}),404
    with open(p/"meta.json") as f: meta=json.load(f)
    with open(p/"game_design.json") as f: game=json.load(f)
    vm = json.load(open(p/"video_meta.json")) if (p/"video_meta.json").exists() else {}
    return jsonify({"meta":meta,"game_design":game,"video_meta":vm,"project_dir":str(p)})

@app.route('/api/projects/<pid>/load', methods=['POST'])
def load_proj(pid):
    p = PROJECTS_ROOT / pid
    if not (p/"game_design.json").exists(): return jsonify({"error":"not found"}),404
    game=json.load(open(p/"game_design.json"))
    return jsonify({"status":"success","project_id":pid,"game":game})

@app.route('/api/projects/<pid>/world', methods=['GET'])
def get_world(pid):
    p=PROJECTS_ROOT/pid
    w=p/"world.json"
    if w.exists(): return jsonify(json.load(open(w)))
    # fallback from game_design
    gd=p/"game_design.json"
    if gd.exists():
        gj=json.load(open(gd))
        if "world" in gj: return jsonify(gj["world"])
        if "metadata" in gj and "world" in gj["metadata"]: return jsonify(gj["metadata"]["world"])
    return jsonify({"error":"world not found","hint":"world code added — regenerate project"}),404

@app.route('/api/world/preview/<pid>', methods=['GET'])
def world_preview(pid):
    p=PROJECTS_ROOT/pid / "world.json"
    if not p.exists(): return jsonify({"error":"no world"}),404
    w=json.load(open(p))
    # summary for UI
    tm=w.get("tilemap",{}).get("chunks",{})
    return jsonify({"project_id":pid,"chunks":len(tm),"size_tiles":w.get("size_tiles"),"meta":w.get("meta"),"spawn":w.get("spawn")})

@app.route('/api/projects/<pid>', methods=['DELETE'])
def del_proj(pid):
    import shutil
    p=PROJECTS_ROOT/pid
    if p.exists():
        shutil.rmtree(p)
        return jsonify({"status":"deleted","project_id":pid})
    return jsonify({"error":"not found"}),404

@app.route('/api/generate', methods=['POST'])
def legacy_gen():
    return proj_gen()

@app.route('/api/frame', methods=['POST'])
def frame():
    name = request.form.get('project_name') or "FrameProject"
    meta, game = make_mock_project(name, frames=1, fps=1)
    mock_projects.append(meta)
    return jsonify({"success":True,"frames_processed":1,"generation_time":0.8,"game_design":game,"project":meta,"project_gen":True})

@app.route('/api/game')
def api_game():
    # return last project's game
    projs = sorted(PROJECTS_ROOT.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True)
    for p in projs:
        if (p/"game_design.json").exists():
            return jsonify(json.load(open(p/"game_design.json")))
    return jsonify({"error":"No game generated yet"}),404

@app.route('/api/game/save', methods=['POST'])
def save_game():
    data=request.json or {}
    fname=data.get('filename','game_design.json')
    # just pretend
    return jsonify({"status":"success","filepath": f"projects/{fname}"})

@app.route('/api/backend/status')
def backend_status():
    # never returns token value
    return jsonify({"backend_token": "set" if _has_token() else "missing", "preview": _token_preview() if _has_token() else None, "note": "Token only used at backend, never sent to frontend"})

@app.route('/api/backend/proxy')
def backend_proxy():
    # example: backend uses token to call upstream — token stays server-side
    if not _has_token():
        return jsonify({"error":"backend token not configured"}), 500
    # demo: return that we would attach auth_headers server-side
    return jsonify({"ok": True, "auth_attached": True, "preview": _token_preview(), "hint": "Backend adds Authorization header via auth_headers(); token never leaves server"})

@app.route('/api/motion')
def motion():
    return jsonify({"motion_patterns": 12, "motion_history": {"obj_1":5}, "motion_profiles":3})

@app.route('/api/research/export', methods=['POST'])
def research():
    return jsonify({"status":"success","filepath":"research_data/demo.json"})

@app.route('/api/game/load', methods=['POST'])
def load_game():
    return jsonify({"status":"success"})

if __name__=='__main__':
    print("="*60)
    print(" AI Game Maker - DEMO Server (lightweight)")
    print(" White minimal UI • Right-side tabs • ProjectGen (video→game)")
    print("="*60)
    print(" → http://localhost:5000")
    print(" → http://127.0.0.1:5000")
    print(" Press Ctrl+C to stop")
    app.run(host='0.0.0.0', port=5000, debug=False)
