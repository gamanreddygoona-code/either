"""
Video Processing Module
======================

Handles video input, frame extraction, and preprocessing for AI analysis.
Supports webcam, video files, and image sequences.
"""

import cv2
import numpy as np
from typing import Generator, Tuple, Optional
from dataclasses import dataclass
import time


@dataclass
class FrameData:
    """Container for processed frame data."""
    frame: np.ndarray
    timestamp: float
    frame_number: int
    fps: float
    
    def __post_init__(self):
        if len(self.frame.shape) == 2:
            self.frame = cv2.cvtColor(self.frame, cv2.COLOR_GRAY2BGR)


class VideoProcessor:
    """
    Main video processing class for frame extraction and preprocessing.
    
    Supports:
    - Webcam input (real-time)
    - Video file input
    - Image sequence input
    - Frame skipping and sampling
    """
    
    def __init__(self, source: int = 0, skip_frames: int = 0, 
                 target_fps: Optional[float] = None, 
                 resize: Optional[Tuple[int, int]] = None):
        """
        Initialize video processor.
        
        Args:
            source: Video source (0 for webcam, path for video file)
            skip_frames: Number of frames to skip between captures
            target_fps: Target frames per second (None for source FPS)
            resize: Target resolution (width, height), None for original
        """
        self.source = source
        self.skip_frames = skip_frames
        self.target_fps = target_fps
        self.resize = resize
        self.cap = None
        self.fps = 30.0
        self.frame_count = 0
        
    def __enter__(self):
        self.open()
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
        
    def open(self):
        """Open video source."""
        self.cap = cv2.VideoCapture(self.source)
        if not self.cap.isOpened():
            raise ValueError(f"Cannot open video source: {self.source}")
            
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        if self.target_fps is None:
            self.target_fps = self.fps
            
        if self.target_fps <= 0:
            self.target_fps = 30.0
            
    def close(self):
        """Close video source."""
        if self.cap is not None:
            self.cap.release()
            self.cap = None
            
    def get_frame_rate(self) -> float:
        """Get the actual frame rate of the source."""
        return self.fps
        
    def read_frame(self) -> Optional[FrameData]:
        """
        Read a single frame from the video source.
        
        Returns:
            FrameData object or None if no more frames
        """
        if self.cap is None:
            self.open()
            
        ret, frame = self.cap.read()
        if not ret:
            return None
            
        self.frame_count += 1
        
        if self.skip_frames > 0 and self.frame_count % (self.skip_frames + 1) != 0:
            return self.read_frame()
            
        if self.resize:
            frame = cv2.resize(frame, self.resize)
            
        timestamp = time.time()
        
        return FrameData(
            frame=frame,
            timestamp=timestamp,
            frame_number=self.frame_count,
            fps=self.target_fps
        )
        
    def frame_generator(self) -> Generator[FrameData, None, None]:
        """
        Generator that yields frames continuously.
        
        Yields:
            FrameData objects
        """
        while True:
            frame = self.read_frame()
            if frame is None:
                break
            yield frame
            
            frame_delay = 1.0 / self.target_fps
            time.sleep(max(0, frame_delay - 0.001))
            
    def preprocess_frame(self, frame: np.ndarray, 
                         grayscale: bool = False,
                         normalize: bool = False) -> np.ndarray:
        """
        Preprocess frame for AI model input.
        
        Args:
            frame: Input frame (BGR format)
            grayscale: Convert to grayscale
            normalize: Normalize to [0, 1]
            
        Returns:
            Processed frame
        """
        if grayscale:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
        if normalize:
            frame = frame.astype(np.float32) / 255.0
            
        return frame
        
    def get_video_info(self) -> dict:
        """Get information about the video source."""
        if self.cap is None:
            self.open()
            
        width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = self.cap.get(cv2.CAP_PROP_FPS)
        
        return {
            'width': width,
            'height': height,
            'fps': fps,
            'total_frames': total_frames,
            'fourcc': int(self.cap.get(cv2.CAP_PROP_FOURCC))
        }
