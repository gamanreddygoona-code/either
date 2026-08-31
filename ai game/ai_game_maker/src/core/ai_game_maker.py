"""
AI Game Maker - Main Application
===============================

Main application that ties together video processing, AI vision,
game generation agents, and the game engine.

This is the core controller that orchestrates the entire
video-to-game generation pipeline.
"""

import time
import json
import threading
from typing import Optional, Dict, Any
from dataclasses import dataclass, field

from .video_processor import VideoProcessor, FrameData
from .ai_vision import AIVision, SceneAnalysis
from ..agents.game_agent import GameAgent, GameDesign
from ..agents.motion_agent import MotionAgent
from .game_engine import GameEngine
from .project_manager import ProjectManager, VideoSourceMeta, ProjectMeta


@dataclass
class GenerationConfig:
    """Configuration for game generation."""
    video_source: int = 0  # 0 for webcam
    target_fps: float = 10.0
    frame_skip: int = 0
    resolution: tuple = (640, 480)
    ai_model: str = "yolov8n.pt"
    game_genre: Optional[str] = None
    num_levels: int = 3
    creativity: float = 0.7
    
    def to_dict(self) -> dict:
        return {
            'video_source': self.video_source,
            'target_fps': self.target_fps,
            'frame_skip': self.frame_skip,
            'resolution': self.resolution,
            'ai_model': self.ai_model,
            'game_genre': self.game_genre,
            'num_levels': self.num_levels,
            'creativity': self.creativity
        }


@dataclass
class GenerationResult:
    """Result of game generation."""
    game_design: Optional[GameDesign] = None
    scene_analyses: list = field(default_factory=list)
    generation_time: float = 0.0
    frames_processed: int = 0
    success: bool = False
    error: Optional[str] = None
    
    def to_dict(self) -> dict:
        return {
            'success': self.success,
            'error': self.error,
            'generation_time': self.generation_time,
            'frames_processed': self.frames_processed,
            'scene_analyses_count': len(self.scene_analyses),
            'game_design': self.game_design.to_dict() if self.game_design else None
        }


class AIGameMaker:
    """
    Main AI Game Maker application.
    
    Orchestrates the entire pipeline:
    1. Video capture and frame extraction
    2. AI vision analysis (object detection, motion tracking)
    3. Game generation using AI agents
    4. Game engine for running the generated game
    
    Can run in different modes:
    - Real-time: Process video and generate games on the fly
    - Batch: Process a video file and generate multiple games
    - Research: Collect data and analyze generation patterns
    """
    
    def __init__(self, config: Optional[GenerationConfig] = None, projects_root: str = "projects"):
        """
        Initialize AI Game Maker.
        
        Args:
            config: Generation configuration
            projects_root: Root folder for ProjectGen storage (enforced)
        """
        self.config = config or GenerationConfig()
        self.video_processor: Optional[VideoProcessor] = None
        self.ai_vision: Optional[AIVision] = None
        self.game_agent: Optional[GameAgent] = None
        self.motion_agent: Optional[MotionAgent] = None
        self.game_engine: Optional[GameEngine] = None
        self.current_game: Optional[GameDesign] = None
        self.current_project_id: Optional[str] = None
        self.generation_results: list = []
        self.is_running = False
        self.generation_thread: Optional[threading.Thread] = None
        self.last_generation: Optional[GenerationResult] = None
        self.project_manager = ProjectManager(projects_root=projects_root)
        
        self._initialize_components()
        
    def _initialize_components(self):
        """Initialize all components."""
        # Video processor
        self.video_processor = VideoProcessor(
            source=self.config.video_source,
            skip_frames=self.config.frame_skip,
            target_fps=self.config.target_fps,
            resize=self.config.resolution
        )
        
        # AI Vision
        try:
            self.ai_vision = AIVision(
                model_path=self.config.ai_model,
                device="cpu"  # Use "cuda" if available
            )
        except Exception as e:
            print(f"Warning: Could not initialize AI Vision: {e}")
            self.ai_vision = None
            
        # Game Agent
        self.game_agent = GameAgent(
            creativity=self.config.creativity
        )
        
        # Motion Agent
        self.motion_agent = MotionAgent()
        
        # Game Engine (initialized when needed)
        self.game_engine = None
        
    def generate_project_from_video(self, duration: float = 5.0, project_name: Optional[str] = None, source_path: Optional[str] = None) -> dict:
        """
        ProjectGen: Every game MUST be created via video generation.
        Wraps generate_game_from_video and persists as a Project.
        Returns: {"result": GenerationResult, "project": ProjectMeta}
        """
        result = self.generate_game_from_video(duration=duration, source_path_override=source_path)
        if result.success and result.game_design:
            vm = VideoSourceMeta(
                source_type="video_file" if source_path else "webcam",
                source_path=source_path,
                fps=self.config.target_fps,
                resolution=self.config.resolution,
                duration=duration,
                frames_captured=result.frames_processed,
                frames_processed=result.frames_processed,
            )
            project = self.project_manager.create_project(
                project_name=project_name or result.game_design.title,
                video_meta=vm,
                game_design=result.game_design.to_dict()
            )
            self.current_project_id = project.project_id
            return {"result": result, "project": project}
        return {"result": result, "project": None}

    def generate_project_from_image(self, image_path: str, project_name: Optional[str] = None) -> dict:
        """
        ProjectGen for single image: treated as 1-frame video generation.
        Enforces video-origin rule (frames_processed = 1).
        """
        result = self.generate_game_from_image(image_path)
        if result.success and result.game_design:
            vm = VideoSourceMeta(
                source_type="image_file",
                source_path=image_path,
                fps=1.0,
                resolution=self.config.resolution,
                duration=0.1,
                frames_captured=1,
                frames_processed=1,
            )
            project = self.project_manager.create_project(
                project_name=project_name or result.game_design.title,
                video_meta=vm,
                game_design=result.game_design.to_dict()
            )
            self.current_project_id = project.project_id
            return {"result": result, "project": project}
        return {"result": result, "project": None}

    def generate_game_from_video(self, duration: float = 5.0, source_path_override: Optional[str] = None) -> GenerationResult:
        """
        Generate a game from video input.
        
        Processes video frames for the specified duration and generates
        a game based on the analysis.
        
        Args:
            duration: Duration in seconds to process video
            source_path_override: for ProjectGen audit trail
            
        Returns:
            GenerationResult with the generated game
        """
        start_time = time.time()
        frames_processed = 0
        scene_analyses = []
        
        try:
            # Open video source
            self.video_processor.open()
            
            # Process frames for the specified duration
            end_time = start_time + duration
            
            while time.time() < end_time:
                frame_data = self.video_processor.read_frame()
                if frame_data is None:
                    break
                    
                frames_processed += 1
                
                # Analyze frame
                if self.ai_vision:
                    scene_analysis = self.ai_vision.analyze_scene(
                        frame=frame_data.frame,
                        frame_number=frame_data.frame_number,
                        timestamp=frame_data.timestamp
                    )
                    scene_analyses.append(scene_analysis)
                    
                    # Pass motion data to motion agent
                    if scene_analysis.motion_vectors:
                        self.motion_agent.analyze_motion_vectors(
                            [
                                {
                                    'object_id': mv.object_id,
                                    'from_point': mv.from_point,
                                    'to_point': mv.to_point,
                                    'velocity': mv.velocity,
                                    'magnitude': mv.magnitude,
                                    'direction': mv.direction
                                } for mv in scene_analysis.motion_vectors
                            ],
                            frame_time=1.0/self.config.target_fps
                        )
                        
            # Use the last scene analysis for game generation
            if scene_analyses:
                last_scene = scene_analyses[-1]
                
                # Convert scene analysis to dict for game agent
                scene_dict = {
                    'frame_number': last_scene.frame_number,
                    'timestamp': last_scene.timestamp,
                    'objects': [
                        {
                            'class_id': obj.class_id,
                            'class_name': obj.class_name,
                            'confidence': obj.confidence,
                            'bbox': obj.bbox,
                            'center': obj.center,
                            'area': obj.area
                        } for obj in last_scene.objects
                    ],
                    'motion_vectors': [
                        {
                            'object_id': mv.object_id,
                            'from_point': mv.from_point,
                            'to_point': mv.to_point,
                            'velocity': mv.velocity,
                            'magnitude': mv.magnitude,
                            'direction': mv.direction
                        } for mv in last_scene.motion_vectors
                    ],
                    'scene_type': last_scene.scene_type,
                    'dominant_colors': last_scene.dominant_colors,
                    'brightness': last_scene.brightness,
                    'motion_intensity': last_scene.motion_intensity
                }
                
                # Generate game
                self.current_game = self.game_agent.generate_game_from_scene(
                    scene_dict,
                    num_levels=self.config.num_levels
                )
                
                # Generate World (tile-first, chunk-first) from same scene meta — video-driven
                try:
                    from .world import World
                    world = World()
                    world.generate_from_video(scene_dict, seed=last_scene.frame_number)
                    # attach world dict to game_design for persistence
                    self.current_game.metadata["world"] = world.to_dict()
                    self.current_game.metadata["world_meta"] = world.meta
                except Exception as e:
                    print(f"World generation failed: {e}")

                # Optimize placement using motion agent
                for level in self.current_game.levels:
                    level.elements = self.game_agent.optimize_placement(
                        level.elements,
                        self.config.resolution[0],
                        self.config.resolution[1]
                    )
                    
                generation_time = time.time() - start_time
                
                return GenerationResult(
                    game_design=self.current_game,
                    scene_analyses=scene_analyses,
                    generation_time=generation_time,
                    frames_processed=frames_processed,
                    success=True
                )
            else:
                return GenerationResult(
                    success=False,
                    error="No frames processed",
                    generation_time=time.time() - start_time
                )
                
        except Exception as e:
            return GenerationResult(
                success=False,
                error=str(e),
                generation_time=time.time() - start_time
            )
        finally:
            self.video_processor.close()
            
    def generate_game_from_image(self, image_path: str) -> GenerationResult:
        """
        Generate a game from a single image.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            GenerationResult with the generated game
        """
        import cv2
        
        start_time = time.time()
        
        try:
            # Read image
            frame = cv2.imread(image_path)
            if frame is None:
                return GenerationResult(
                    success=False,
                    error=f"Could not read image: {image_path}",
                    generation_time=0
                )
                
            # Resize if needed
            if self.config.resolution:
                frame = cv2.resize(frame, self.config.resolution)
                
            # Analyze single frame
            if self.ai_vision:
                scene_analysis = self.ai_vision.analyze_scene(
                    frame=frame,
                    frame_number=0,
                    timestamp=time.time()
                )
                
                scene_dict = {
                    'frame_number': 0,
                    'timestamp': time.time(),
                    'objects': [
                        {
                            'class_id': obj.class_id,
                            'class_name': obj.class_name,
                            'confidence': obj.confidence,
                            'bbox': obj.bbox,
                            'center': obj.center,
                            'area': obj.area
                        } for obj in scene_analysis.objects
                    ],
                    'motion_vectors': [],
                    'scene_type': scene_analysis.scene_type,
                    'dominant_colors': scene_analysis.dominant_colors,
                    'brightness': scene_analysis.brightness,
                    'motion_intensity': 0
                }
                
                # Generate game
                self.current_game = self.game_agent.generate_game_from_scene(
                    scene_dict,
                    num_levels=self.config.num_levels
                )
                try:
                    from .world import World
                    world = World()
                    world.generate_from_video(scene_dict, seed=0)
                    self.current_game.metadata["world"] = world.to_dict()
                    self.current_game.metadata["world_meta"] = world.meta
                except Exception as e:
                    print(f"World generation failed: {e}")
                
                generation_time = time.time() - start_time
                
                return GenerationResult(
                    game_design=self.current_game,
                    scene_analyses=[scene_analysis],
                    generation_time=generation_time,
                    frames_processed=1,
                    success=True
                )
            else:
                return GenerationResult(
                    success=False,
                    error="AI Vision not initialized",
                    generation_time=0
                )
                
        except Exception as e:
            return GenerationResult(
                success=False,
                error=str(e),
                generation_time=time.time() - start_time
            )
            
    def run_game(self, screen_width: int = 800, screen_height: int = 600):
        """
        Run the generated game.
        
        Args:
            screen_width: Width of the game window
            screen_height: Height of the game window
        """
        if not self.current_game:
            print("No game generated yet. Call generate_game_from_video() first.")
            return
            
        # Create game engine
        self.game_engine = GameEngine(screen_width, screen_height)
        
        # Create game from design
        self.game_engine.create_from_game_design(self.current_game.to_dict())
        
        # Run the game
        self.game_engine.run()
        
    def run_realtime_generation(self, duration_per_game: float = 10.0):
        """
        Run in real-time mode, generating new games periodically.
        
        Args:
            duration_per_game: Duration in seconds to process before generating a new game
        """
        self.is_running = True
        
        try:
            self.video_processor.open()
            
            while self.is_running:
                # Generate a new game
                result = self.generate_game_from_video(duration_per_game)
                self.last_generation = result
                self.generation_results.append(result)
                
                if result.success and result.game_design:
                    print(f"Generated game: {result.game_design.title}")
                    print(f"Genre: {result.game_design.genre.value}")
                    print(f"Theme: {result.game_design.theme}")
                    print(f"Levels: {len(result.game_design.levels)}")
                    print("-" * 50)
                    
                    # Optionally run the game
                    # self.run_game()
                    
        except KeyboardInterrupt:
            print("Stopping real-time generation...")
        finally:
            self.video_processor.close()
            self.is_running = False
            
    def start_async_generation(self, duration: float = 5.0):
        """
        Start game generation in a separate thread.
        
        Args:
            duration: Duration in seconds to process video
            
        Returns:
            Thread object
        """
        self.generation_thread = threading.Thread(
            target=lambda: setattr(self, 'last_generation', 
                                   self.generate_game_from_video(duration))
        )
        self.generation_thread.start()
        return self.generation_thread
        
    def get_current_game_state(self) -> Optional[dict]:
        """Get the current game state from the game engine."""
        if self.game_engine:
            return self.game_engine.get_state()
        return None
        
    def save_current_game(self, filepath: str):
        """Save the current game design to a file. Only allowed if video-generated (ProjectGen)."""
        if not self.current_game:
            print("No game to save.")
            return
        # enforce video origin: must have come from recent generation
        if self.current_project_id is None and (self.last_generation is None or not self.last_generation.success):
            raise ValueError("ProjectGen enforcement: cannot save a game that was not generated from video. Use generate_project_from_video().")
        self.game_agent.save_game_design(self.current_game, filepath)
        print(f"Game saved to {filepath}")
            
    def load_game(self, filepath: str) -> bool:
        """Load a game design from a file. Rejects non-video-generated designs."""
        try:
            loaded = self.game_agent.load_game_design(filepath)
            # check that it has video lineage if possible
            if not loaded.metadata.get("source_scene"):
                print("Warning: loaded design missing video lineage, but allowing for backwards compat")
            self.current_game = loaded
            print(f"Game loaded from {filepath}")
            return True
        except Exception as e:
            print(f"Error loading game: {e}")
            return False

    def load_project(self, project_id: str) -> bool:
        """Load a ProjectGen project as current game (enforced video origin)."""
        try:
            design = self.project_manager.load_game_design(project_id)
            if not design:
                print(f"Project {project_id} not found")
                return False
            # convert dict back to GameDesign object for engine
            from ..agents.game_agent import GameGenre, GameLevel, GameElement, GameElementType, GameRule
            # reuse loader via temp file roundtrip simplified: set current_game via dict hydration
            # Instead directly assign via game_agent loader would need file; we have dict, so rehydrate manually via save/load bypass
            # Simple: create temp file
            import tempfile, json, os
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tf:
                json.dump(design, tf)
                tf_path = tf.name
            self.current_game = self.game_agent.load_game_design(tf_path)
            os.remove(tf_path)
            self.current_project_id = project_id
            print(f"Project {project_id} loaded: {self.current_game.title}")
            return True
        except Exception as e:
            print(f"Error loading project: {e}")
            return False
            
    def export_research_data(self, filepath: str):
        """
        Export generation data for research purposes.
        
        Args:
            filepath: Path to save the research data
        """
        data = {
            'config': self.config.to_dict(),
            'generation_results': [r.to_dict() for r in self.generation_results],
            'current_game': self.current_game.to_dict() if self.current_game else None,
            'timestamp': time.time()
        }
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
            
        print(f"Research data exported to {filepath}")
        
    def get_motion_analysis(self) -> dict:
        """Get motion analysis data from the motion agent."""
        if self.motion_agent:
            return {
                'motion_patterns': len(self.motion_agent.motion_patterns),
                'motion_history': {k: len(v) for k, v in self.motion_agent.motion_history.items()},
                'motion_profiles': len(self.motion_agent.motion_profiles)
            }
        return {}
        
    def cleanup(self):
        """Clean up resources."""
        if self.video_processor:
            self.video_processor.close()
        self.is_running = False
        if self.generation_thread:
            self.generation_thread.join(timeout=1.0)


# Singleton instance for easy access
_game_maker: Optional[AIGameMaker] = None


def get_game_maker(config: Optional[GenerationConfig] = None) -> AIGameMaker:
    """Get or create the singleton AI Game Maker instance."""
    global _game_maker
    if _game_maker is None:
        _game_maker = AIGameMaker(config)
    return _game_maker


def reset_game_maker():
    """Reset the singleton instance."""
    global _game_maker
    if _game_maker:
        _game_maker.cleanup()
        _game_maker = None
