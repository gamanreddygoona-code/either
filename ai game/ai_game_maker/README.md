# AI Game Maker

> **Video to Game Generation Research Tool**

AI Game Maker is an advanced research tool that generates playable games from video frames using AI agents for motion analysis, object placement, and game mechanics generation.

## Features

### Core Capabilities
- **Video Frame Processing**: Extract and analyze frames from video input (webcam or files)
- **AI Vision**: Object detection and motion tracking using YOLOv8
- **Game Generation**: AI agents create game mechanics, levels, and rules from video content
- **Motion Analysis**: Intelligent motion pattern recognition and realistic movement generation
- **Real-time Generation**: Process video and generate games on the fly

### AI Agents
1. **Game Agent**: Generates game designs, levels, and rules from scene analysis
2. **Motion Agent**: Analyzes motion patterns and creates realistic movement for game elements
3. **Vision Agent**: Detects objects, tracks motion, and understands scenes

### User Interface
- **White Minimal Design**: Clean, professional interface
- **Right-Side Tabs**: Organized controls and settings
- **Real-time Preview**: See video input and generation progress
- **Game Visualization**: Preview generated game elements
- **Research Tools**: Export data for analysis

## Installation

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Git (optional, for cloning)

### Setup

1. **Clone the repository** (or download the code):
   ```bash
   git clone <repository-url>
   cd ai_game_maker
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

   For GPU acceleration (recommended for AI models):
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

3. **Download YOLOv8 model** (optional, will be downloaded automatically on first run):
   ```bash
   # The model will be automatically downloaded when you run the application
   # Or you can manually download it:
   # wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.pt
   ```

## Usage

### Command Line Interface

#### Start the Web Interface
```bash
python main.py web
```
Then open your browser to: http://localhost:5000

#### Generate a Game from Video
```bash
python main.py generate --video input.mp4 --duration 10 --output my_game.json
```

#### Generate a Game from Image
```bash
python main.py generate --image frame.jpg --output my_game.json
```

#### Run a Generated Game
```bash
python main.py run --game my_game.json --width 800 --height 600
```

#### Research Mode (Continuous Generation)
```bash
python main.py research --duration 10 --output research_data
```

### Web Interface

1. **Start the server**:
   ```bash
   python main.py web
   ```

2. **Open browser**: Navigate to http://localhost:5000

3. **Use the interface**:
   - **Video Input Tab**: Start camera or upload video
   - **Generate**: Create a game from the video input
   - **Preview**: View the generated game design
   - **Run**: Play the generated game
   - **Settings Tab**: Configure generation parameters
   - **AI Agents Tab**: View AI system status
   - **Research Tab**: Export generation data

## Project Structure

```
ai_game_maker/
├── main.py                    # Main entry point
├── requirements.txt            # Python dependencies
├── README.md                  # This file
│
├── src/
│   ├── __init__.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── video_processor.py  # Video frame extraction
│   │   ├── ai_vision.py        # AI vision and object detection
│   │   ├── game_engine.py      # Pygame-based game engine
│   │   └── ai_game_maker.py    # Main game maker controller
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── game_agent.py       # Game generation AI agent
│   │   └── motion_agent.py     # Motion analysis AI agent
│   │
│   └── ui/
│       ├── __init__.py
│       ├── web_app.py          # Flask web application
│       ├── static/             # Static files (CSS, JS, images)
│       │   ├── styles.css       # UI styles
│       │   ├── app.js           # UI JavaScript
│       │   └── game.html       # Game runner page
│       └── templates/          # HTML templates
│           └── index.html       # Main UI page
│
└── generated_games/           # Generated game designs (created at runtime)
└── research_data/             # Research data exports (created at runtime)
```

## Architecture

### Video Processing Pipeline
```
Video Input → Frame Extraction → Preprocessing → AI Vision Analysis
                              ↓
                       Motion Tracking
                              ↓
                       Scene Understanding
```

### Game Generation Pipeline
```
Scene Analysis → Game Agent → Game Design Generation
                    ↓
              Motion Agent → Movement Patterns
                    ↓
              Level Creation → Element Placement
                    ↓
              Rule Generation → Game Mechanics
```

### Rendering Pipeline
```
Game Design → Game Engine → Pygame Rendering
                    ↓
              Input Handling → Physics → Collision Detection
```

## Configuration

### Generation Settings
- **Video Source**: Webcam (0) or video file path
- **Target FPS**: Frames per second to process (1-60)
- **Frame Skip**: Number of frames to skip between processing
- **Creativity**: How creative the AI should be (0-1)
- **Number of Levels**: How many levels to generate (1-10)
- **Preferred Genre**: Auto-detect or specify a genre

### AI Models
- **YOLOv8**: Used for object detection (default: yolov8n.pt)
- **Device**: CPU or CUDA (GPU)

## Research Features

### Data Collection
- Generation statistics (time, frames processed, objects detected)
- Game design exports (JSON format)
- Motion pattern analysis
- Scene classification data

### Export Formats
- **Game Design**: JSON file with complete game structure
- **Research Data**: JSON file with generation statistics and analysis
- **Generation Log**: CSV file with timestamped generation records

### Analysis Tools
- Motion pattern visualization
- Object detection statistics
- Generation time analysis
- Creativity level tracking

## Examples

### Example 1: Generate from Webcam
```bash
# Start the web interface
python main.py web

# Then in the browser:
# 1. Click "Start Camera"
# 2. Click "Generate Game"
# 3. Wait for generation to complete
# 4. Click "Run Game" to play
```

### Example 2: Generate from Video File
```bash
# Generate a game from a 10-second video clip
python main.py generate --video my_video.mp4 --duration 10 --output my_game.json

# Run the generated game
python main.py run --game my_game.json
```

### Example 3: Research Session
```bash
# Run continuous generation for research
python main.py research --duration 5 --output research_output

# This will:
# - Process 5 seconds of video
# - Generate a game
# - Save the game design
# - Export research data
# - Repeat until stopped (Ctrl+C)
```

## Technical Details

### Supported Game Genres
- Platformer
- Shooter
- Puzzle
- Racing
- Adventure
- Arcade
- Strategy

### Supported Game Elements
- Player
- Enemy
- Platform
- Collectible
- Obstacle
- Background
- Trigger

### Object Detection Classes
The system uses YOLOv8 which can detect 80+ object classes including:
- Person
- Car, Truck, Bus
- Animal (Dog, Cat, Horse, etc.)
- Furniture (Chair, Table, etc.)
- Sports equipment
- And many more...

### Motion Analysis
- Velocity calculation
- Trajectory prediction
- Periodic motion detection
- Obstacle avoidance
- Environment adaptation

## Troubleshooting

### Common Issues

1. **Camera not working**:
   - Ensure you have a webcam connected
   - Check browser permissions for camera access
   - Try a different browser

2. **AI model not loading**:
   - Check your internet connection (model will download automatically)
   - Ensure you have enough disk space
   - Try running with `--ai-model yolov8n.pt` to specify the model

3. **Slow performance**:
   - Use a lower resolution (640x480 instead of 1280x720)
   - Reduce the target FPS
   - Increase frame skip
   - Use CPU mode if GPU is not available

4. **Game not running**:
   - Ensure Pygame is installed: `pip install pygame`
   - Check that the game design file exists
   - Verify the game design is valid JSON

### Debug Mode
Run with debug output:
```bash
python main.py web --debug
```

## Performance Optimization

### For Better AI Performance
- Use a GPU with CUDA support
- Install PyTorch with CUDA: `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118`
- Use a smaller YOLO model (yolov8n.pt is the smallest)
- Reduce the video resolution

### For Better Game Performance
- Use a lower screen resolution
- Reduce the number of game elements
- Simplify collision detection
- Use frame skipping

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (if available)
5. Submit a pull request

### Code Style
- Follow PEP 8 guidelines
- Use type hints
- Add docstrings to functions and classes
- Keep functions short and focused
- Use descriptive variable names

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) - Object detection
- [Pygame](https://www.pygame.org/) - Game engine
- [Flask](https://flask.palletsprojects.com/) - Web framework
- [OpenCV](https://opencv.org/) - Computer vision

## Contact
For questions, issues, or feedback, please open an issue on the GitHub repository.
