#!/usr/bin/env python3
"""
AI Game Maker - Setup Script
===========================

This script helps set up the AI Game Maker project by:
1. Creating necessary directories
2. Installing Python dependencies
3. Downloading required AI models
4. Verifying the setup
"""

import os
import sys
import subprocess
import json
from pathlib import Path


def print_header():
    """Print setup header."""
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
║          AI Game Maker - Setup Script                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    """)


def create_directories():
    """Create necessary directories."""
    print("\n📁 Creating directories...")
    
    directories = [
        'generated_games',
        'research_data',
        'temp',
        'src/ui/static',
        'src/ui/templates'
    ]
    
    for directory in directories:
        path = Path(directory)
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
            print(f"   ✓ Created: {directory}")
        else:
            print(f"   - Already exists: {directory}")
    
    print("   ✅ Directories ready")


def install_dependencies():
    """Install Python dependencies."""
    print("\n📦 Installing Python dependencies...")
    
    try:
        # Check if pip is available
        subprocess.run(['pip', '--version'], check=True, capture_output=True)
        
        # Install requirements
        print("   Installing from requirements.txt...")
        result = subprocess.run(
            ['pip', 'install', '-r', 'requirements.txt'],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("   ✅ Dependencies installed successfully")
        else:
            print("   ⚠️  Some dependencies may have failed to install:")
            print(result.stderr)
            
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Error: {e}")
    except FileNotFoundError:
        print("   ❌ pip not found. Please ensure Python and pip are installed.")


def check_python_version():
    """Check Python version."""
    print("\n🐍 Checking Python version...")
    
    version = sys.version_info
    print(f"   Python {version.major}.{version.minor}.{version.micro}")
    
    if version.major >= 3 and version.minor >= 8:
        print("   ✅ Python version is compatible")
        return True
    else:
        print("   ❌ Python 3.8 or higher is required")
        return False


def verify_setup():
    """Verify the setup."""
    print("\n✅ Verifying setup...")
    
    checks = [
        ('Python version', check_python_version()),
        ('requirements.txt', Path('requirements.txt').exists()),
        ('main.py', Path('main.py').exists()),
        ('src directory', Path('src').exists() and Path('src').is_dir()),
    ]
    
    all_passed = True
    for name, passed in checks:
        status = "✅" if passed else "❌"
        print(f"   {status} {name}")
        if not passed:
            all_passed = False
    
    return all_passed


def print_next_steps():
    """Print next steps."""
    print("\n" + "=" * 60)
    print("✅ Setup Complete!")
    print("=" * 60)
    print("\n🚀 Next Steps:")
    print("\n1. Start the web interface:")
    print("   python main.py web")
    print("   Then open: http://localhost:5000")
    print("\n2. Generate a game from video:")
    print("   python main.py generate --video my_video.mp4")
    print("\n3. Generate a game from image:")
    print("   python main.py generate --image my_image.jpg")
    print("\n4. Run a generated game:")
    print("   python main.py run --game game_design.json")
    print("\n5. For more options:")
    print("   python main.py help")
    print("\n" + "=" * 60)


def main():
    """Main setup function."""
    print_header()
    
    # Check Python version first
    if not check_python_version():
        print("\n❌ Setup cannot continue. Please install Python 3.8 or higher.")
        return
    
    # Create directories
    create_directories()
    
    # Install dependencies
    install_dependencies()
    
    # Verify setup
    if verify_setup():
        print_next_steps()
    else:
        print("\n⚠️  Setup completed with some issues. Please review the output above.")


if __name__ == '__main__':
    main()
