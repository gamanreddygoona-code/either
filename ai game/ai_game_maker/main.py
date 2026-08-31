#!/usr/bin/env python3
"""
AI Game Maker - Main Entry Point
===============================

This is the main entry point for the AI Game Maker application.

Usage:
    python main.py [command] [options]

Commands:
    web         Start the web interface
    generate    Generate a game from video/image
    run         Run a generated game
    research    Run in research mode
    help        Show this help message

Examples:
    python main.py web
    python main.py generate --video input.mp4 --duration 10
    python main.py generate --image frame.jpg
    python main.py run --game game_design.json
"""

import argparse
import sys
import os
import json
import time

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from core.ai_game_maker import AIGameMaker, GenerationConfig
from core.video_processor import VideoProcessor
from core.ai_vision import AIVision
from agents.game_agent import GameAgent
from agents.motion_agent import MotionAgent
from core.game_engine import GameEngine


def print_header():
    """Print application header."""
    print("""
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     ██╗ █████╗ ██████╗ ███╗   ██╗                ██████╗    ║
║     ██║██╔══██╗██╔══██╗████╗  ██║               ██╔════╝    ║
║     ██║███████║██████╔╝██╔██╗ ██║               ██║  ███╗    ║
║██   ██║██╔══██║██╔══██╗██║╚██╗██║               ██║   ██║    ║
║╚█████╔╝██║  ██║██║  ██║██║ ╚████║    ███████╗╚██████╔╝    ║
║ ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚══════╝ ╚═════╝     ║
║                                                               ║
║          AI Game Maker - Video to Game Generation               ║
║                    Research & Development Tool                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    """)


def print_help():
    """Print help message."""
    print_header()
    print("\nProjectGen: Every game MUST be generated from video (multi-fps live motion).")
    print("\nUsage:")
    print("    python main.py [command] [options]")
    print("\nCommands:")
    print("    web             Start the web interface (ProjectGen)")
    print("    project create  Create a ProjectGen project from video (enforced)")
    print("    project list    List all video-generated projects")
    print("    project run     Run a project by ID")
    print("    generate        (legacy) Generate + auto-create project from video/image")
    print("    run             Run a generated game file")
    print("    research        Run in research mode (creates projects)")
    print("    help            Show this help message")
    print("\nOptions for 'project create' / 'generate' command:")
    print("    --video VIDEO    Video file to process")
    print("    --image IMAGE    Image file (treated as 1-frame video)")
    print("    --name NAME      Project name")
    print("    --duration D     Duration in seconds (default: 5)")
    print("    --fps FPS        Target FPS (default: 10)")
    print("    --creativity C  Creativity level (0-1, default: 0.7)")
    print("    --levels N      Number of levels (default: 3)")
    print("\nOptions for 'run' command:")
    print("    --project ID    Project ID to run (preferred)")
    print("    --game FILE     Game design file to run (legacy)")
    print("\nExamples:")
    print("    python main.py web")
    print("    python main.py project create --video input.mp4 --name my_project --duration 10")
    print("    python main.py project list")
    print("    python main.py project run --project proj_20250101_123456_abc123")


def cmd_web(args):
    """Start the web interface."""
    print_header()
    print("Starting web interface...")
    print("Open your browser and navigate to: http://localhost:5000")
    print("\nPress Ctrl+C to stop the server.\n")
    
    # Change to the ui directory and run the web app
    os.chdir(os.path.join(os.path.dirname(__file__), 'src', 'ui'))
    
    # Create necessary directories
    for dirname in ['static', 'templates', 'generated_games', 'research_data', 'temp']:
        os.makedirs(dirname, exist_ok=True)
    
    # Run the Flask app
    from ui.web_app import app
    app.run(host='0.0.0.0', port=5000, debug=True)


def cmd_project_create(args):
    """ProjectGen: create project strictly from video."""
    print_header()
    print("📦 ProjectGen — every game from video generation")
    config = GenerationConfig(
        video_source=args.video if args.video else 0,
        target_fps=float(args.fps) if args.fps else 10.0,
        frame_skip=int(args.skip) if args.skip else 1,
        creativity=float(args.creativity) if args.creativity else 0.7,
        num_levels=int(args.levels) if args.levels else 3
    )
    game_maker = AIGameMaker(config)
    try:
        if args.image:
            print(f"Generating PROJECT from image (1-frame video): {args.image}")
            bundle = game_maker.generate_project_from_image(args.image, project_name=args.name)
        else:
            duration = float(args.duration) if args.duration else 5.0
            print(f"Generating PROJECT from video for {duration}s @ {config.target_fps}fps...")
            if args.video:
                game_maker.config.video_source = args.video
            bundle = game_maker.generate_project_from_video(duration=duration, project_name=args.name, source_path=args.video)
        result = bundle["result"]
        project = bundle["project"]
        if result.success and project:
            print(f"\n✅ Project created: {project.project_id}")
            print(f"   Name: {project.project_name}")
            print(f"   Title: {result.game_design.title}")
            print(f"   Genre: {result.game_design.genre.value} | Theme: {result.game_design.theme}")
            print(f"   Frames: {result.frames_processed} | Time: {result.generation_time:.2f}s")
            print(f"   Location: projects/{project.project_id}/game_design.json")
            # also save legacy output if requested
            if args.output:
                game_maker.save_current_game(args.output)
                print(f"   Legacy copy: {args.output}")
        else:
            print(f"\n❌ Failed: {result.error if result else 'unknown'}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        game_maker.cleanup()

def cmd_project_list(args):
    print_header()
    from core.project_manager import ProjectManager
    pm = ProjectManager(projects_root="projects")
    projects = pm.list_projects()
    stats = pm.stats()
    print(f"\n📦 Projects: {stats['total_projects']} | Total frames: {stats['total_frames_processed']}")
    for p in projects[:20]:
        print(f" - {p.project_id} | {p.project_name} | {p.game_title} [{p.game_genre}] | {p.video_meta.frames_processed} frames @ {p.video_meta.fps}fps | {p.created_at}")
    if not projects:
        print("  (no projects yet — create one with: python main.py project create --video <file>)")

def cmd_project_run(args):
    print_header()
    project_id = getattr(args, 'project', None) or getattr(args, 'project_id', None)
    if not project_id:
        print("❌ --project <project_id> required. Use: python main.py project list")
        return
    width = int(args.width) if hasattr(args,'width') and args.width else 800
    height = int(args.height) if hasattr(args,'height') and args.height else 600
    game_maker = AIGameMaker()
    if not game_maker.load_project(project_id):
        print(f"❌ Could not load project {project_id}")
        return
    print(f"Running project {project_id}: {game_maker.current_game.title}")
    from core.game_engine import GameEngine
    engine = GameEngine(width, height)
    engine.create_from_game_design(game_maker.current_game.to_dict())
    engine.run()

def cmd_generate(args):
    """Legacy generate now delegates to ProjectGen."""
    # map to project create for enforcement
    cmd_project_create(args)


def cmd_run(args):
    """Run a generated game. Prefers --project, falls back to --game file."""
    print_header()
    width = int(args.width) if args.width else 800
    height = int(args.height) if args.height else 600
    try:
        game_maker = AIGameMaker()
        # prefer project
        project_id = getattr(args, 'project', None)
        if project_id:
            if not game_maker.load_project(project_id):
                print(f"❌ Error: Could not load project {project_id}")
                return
        else:
            game_file = args.game if args.game else 'game_design.json'
            if not game_maker.load_game(game_file):
                print(f"❌ Error: Could not load game from {game_file}")
                print("   Tip: use ProjectGen: python main.py project list")
                return
        
        print(f"Running game: {game_maker.current_game.title}")
        print(f"Genre: {game_maker.current_game.genre.value}")
        print(f"Theme: {game_maker.current_game.theme}")
        print(f"Levels: {len(game_maker.current_game.levels)}")
        print("\nControls:")
        print("  Arrow keys - Move")
        print("  Space - Jump/Shoot")
        print("  R - Restart")
        print("  ESC - Quit")
        print("\nPress any key in the game window to start...")
        
        # Create and run game engine
        game_engine = GameEngine(width, height)
        game_engine.create_from_game_design(game_maker.current_game.to_dict())
        game_engine.run()
        
    except Exception as e:
        print(f"❌ Error: {e}")


def cmd_research(args):
    """Run in research mode."""
    print_header()
    print("Research Mode - Continuous game generation and data collection")
    print("-" * 60)
    
    # Setup configuration
    config = GenerationConfig(
        video_source=args.video if args.video else 0,
        target_fps=float(args.fps) if args.fps else 10.0,
        creativity=float(args.creativity) if args.creativity else 0.7,
        num_levels=int(args.levels) if args.levels else 3
    )
    
    # Create game maker
    game_maker = AIGameMaker(config)
    
    duration = float(args.duration) if args.duration else 10.0
    output_dir = args.output if args.output else 'research_output'
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"\nConfiguration:")
    print(f"  Video Source: {config.video_source}")
    print(f"  Target FPS: {config.target_fps}")
    print(f"  Creativity: {config.creativity}")
    print(f"  Levels per game: {config.num_levels}")
    print(f"  Duration per game: {duration}s")
    print(f"  Output directory: {output_dir}")
    print("\nStarting research session...")
    print("Press Ctrl+C to stop.\n")
    
    try:
        generation_count = 0
        
        while True:
            generation_count += 1
            print(f"Generation #{generation_count} - {time.strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Generate a game
            result = game_maker.generate_game_from_video(duration)
            
            if result.success:
                timestamp = time.strftime('%Y%m%d_%H%M%S')
                game_file = os.path.join(output_dir, f'game_{timestamp}.json')
                research_file = os.path.join(output_dir, f'research_{timestamp}.json')
                
                # Save game
                game_maker.save_current_game(game_file)
                
                # Export research data
                game_maker.export_research_data(research_file)
                
                print(f"  ✅ Generated: {result.game_design.title}")
                print(f"     Genre: {result.game_design.genre.value}")
                print(f"     Theme: {result.game_design.theme}")
                print(f"     Time: {result.generation_time:.2f}s")
                print(f"     Saved to: {game_file}")
                
                # Save generation info
                with open(os.path.join(output_dir, 'generations.log'), 'a') as f:
                    f.write(f"{timestamp}, {result.game_design.title}, {result.generation_time:.2f}, {result.frames_processed}\n")
                    
            else:
                print(f"  ❌ Failed: {result.error}")
            
            print()
            
            # Wait before next generation
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\nResearch session stopped.")
        print(f"Total generations: {generation_count}")
    finally:
        game_maker.cleanup()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='AI Game Maker - ProjectGen (Every game from video)',
        add_help=False
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Web command
    subparsers.add_parser('web', help='Start the web interface')

    # Project command with sub-actions
    project_parser = subparsers.add_parser('project', help='ProjectGen operations')
    project_sub = project_parser.add_subparsers(dest='project_action')
    p_create = project_sub.add_parser('create', help='Create project from video')
    p_create.add_argument('--video', type=str, help='Video file')
    p_create.add_argument('--image', type=str, help='Image file (1-frame video)')
    p_create.add_argument('--name', type=str, help='Project name')
    p_create.add_argument('--duration', type=float, default=5.0)
    p_create.add_argument('--output', type=str, help='Legacy output file')
    p_create.add_argument('--fps', type=float, default=10.0)
    p_create.add_argument('--skip', type=int, default=1)
    p_create.add_argument('--creativity', type=float, default=0.7)
    p_create.add_argument('--levels', type=int, default=3)
    project_sub.add_parser('list', help='List projects')
    p_run = project_sub.add_parser('run', help='Run project')
    p_run.add_argument('--project', type=str, required=True, help='Project ID')
    p_run.add_argument('--width', type=int, default=800)
    p_run.add_argument('--height', type=int, default=600)
    
    # Generate command (legacy, enforces ProjectGen)
    generate_parser = subparsers.add_parser('generate', help='Generate a game from video/image (creates ProjectGen project)')
    generate_parser.add_argument('--video', type=str, help='Video file to process')
    generate_parser.add_argument('--image', type=str, help='Image file to process')
    generate_parser.add_argument('--name', type=str, help='Project name')
    generate_parser.add_argument('--duration', type=float, default=5.0, help='Duration in seconds (default: 5)')
    generate_parser.add_argument('--output', type=str, default=None, help='Output file (default: none, uses projects/)')
    generate_parser.add_argument('--fps', type=float, default=10.0, help='Target FPS (default: 10)')
    generate_parser.add_argument('--skip', type=int, default=1, help='Frame skip (default: 1)')
    generate_parser.add_argument('--creativity', type=float, default=0.7, help='Creativity level (0-1, default: 0.7)')
    generate_parser.add_argument('--levels', type=int, default=3, help='Number of levels (default: 3)')
    
    # Run command
    run_parser = subparsers.add_parser('run', help='Run a generated game/project')
    run_parser.add_argument('--project', type=str, help='Project ID (preferred)')
    run_parser.add_argument('--game', type=str, default='game_design.json', help='Game design file to run (legacy)')
    run_parser.add_argument('--width', type=int, default=800, help='Screen width (default: 800)')
    run_parser.add_argument('--height', type=int, default=600, help='Screen height (default: 600)')
    
    # Research command
    research_parser = subparsers.add_parser('research', help='Run in research mode')
    research_parser.add_argument('--video', type=str, help='Video file to process')
    research_parser.add_argument('--duration', type=float, default=10.0, help='Duration per game in seconds (default: 10)')
    research_parser.add_argument('--output', type=str, default='research_output', help='Output directory (default: research_output)')
    research_parser.add_argument('--fps', type=float, default=10.0, help='Target FPS (default: 10)')
    research_parser.add_argument('--creativity', type=float, default=0.7, help='Creativity level (0-1, default: 0.7)')
    research_parser.add_argument('--levels', type=int, default=3, help='Number of levels (default: 3)')
    
    # Help command
    subparsers.add_parser('help', help='Show help message')
    
    # Parse arguments
    args = parser.parse_args()
    
    if not args.command or args.command == 'help':
        print_help()
    elif args.command == 'web':
        cmd_web(args)
    elif args.command == 'project':
        if args.project_action == 'create':
            cmd_project_create(args)
        elif args.project_action == 'list':
            cmd_project_list(args)
        elif args.project_action == 'run':
            cmd_project_run(args)
        else:
            print_help()
    elif args.command == 'generate':
        cmd_generate(args)
    elif args.command == 'run':
        cmd_run(args)
    elif args.command == 'research':
        cmd_research(args)
    else:
        print_help()


if __name__ == '__main__':
    main()
