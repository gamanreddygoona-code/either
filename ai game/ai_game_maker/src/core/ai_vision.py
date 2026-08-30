"""
AI Vision Module
===============

Handles object detection, motion tracking, and scene understanding
using YOLO and custom computer vision algorithms.
"""

import cv2
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from ultralytics import YOLO
import time


@dataclass
class DetectedObject:
    """Represents a detected object in a frame."""
    class_id: int
    class_name: str
    confidence: float
    bbox: Tuple[float, float, float, float]  # x1, y1, x2, y2
    center: Tuple[float, float]  # (x, y)
    area: float
    
    @property
    def width(self) -> float:
        return self.bbox[2] - self.bbox[0]
        
    @property
    def height(self) -> float:
        return self.bbox[3] - self.bbox[1]


@dataclass
class MotionVector:
    """Represents motion between frames."""
    object_id: int
    from_point: Tuple[float, float]
    to_point: Tuple[float, float]
    velocity: Tuple[float, float]  # pixels per second
    magnitude: float
    direction: float  # angle in radians


@dataclass
class SceneAnalysis:
    """Complete scene analysis result."""
    frame_number: int
    timestamp: float
    objects: List[DetectedObject]
    motion_vectors: List[MotionVector]
    scene_type: str
    dominant_colors: List[Tuple[int, int, int]]
    brightness: float
    motion_intensity: float


class AIVision:
    """
    AI Vision system for object detection and motion analysis.
    
    Uses YOLO for object detection and custom algorithms for
    motion tracking and scene understanding.
    """
    
    # Common YOLOv8 class names (partial list)
    CLASS_NAMES = [
        'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
        'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
        'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
        'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
        'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
        'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
        'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
        'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
        'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
        'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
        'toothbrush'
    ]
    
    def __init__(self, model_path: str = "yolov8n.pt", 
                 confidence_threshold: float = 0.5,
                 iou_threshold: float = 0.45,
                 device: str = "cpu"):
        """
        Initialize AI Vision system.
        
        Args:
            model_path: Path to YOLO model file
            confidence_threshold: Minimum confidence for detections
            iou_threshold: IOU threshold for NMS
            device: Device to run model on ('cpu' or 'cuda')
        """
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.device = device
        self.model = None
        self.tracker = None
        self.prev_objects: Dict[int, DetectedObject] = {}
        self.object_counter = 0
        
        self._load_model()
        
    def _load_model(self):
        """Load YOLO model."""
        try:
            self.model = YOLO(self.model_path)
            self.model.to(self.device)
        except Exception as e:
            print(f"Warning: Could not load YOLO model: {e}")
            print("Using OpenCV DNN as fallback...")
            self._load_opencv_model()
            
    def _load_opencv_model(self):
        """Load OpenCV DNN model as fallback."""
        pass  # Implement if needed
        
    def detect_objects(self, frame: np.ndarray) -> List[DetectedObject]:
        """
        Detect objects in a frame using YOLO.
        
        Args:
            frame: Input frame (BGR format)
            
        Returns:
            List of DetectedObject
        """
        if self.model is None:
            return []
            
        results = self.model.predict(
            source=frame,
            conf=self.confidence_threshold,
            iou=self.iou_threshold,
            verbose=False
        )
        
        objects = []
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls)
                confidence = float(box.conf)
                x1, y1, x2, y2 = map(float, box.xyxy[0])
                
                class_name = self.CLASS_NAMES[class_id] if class_id < len(self.CLASS_NAMES) else f"class_{class_id}"
                center = ((x1 + x2) / 2, (y1 + y2) / 2)
                area = (x2 - x1) * (y2 - y1)
                
                obj = DetectedObject(
                    class_id=class_id,
                    class_name=class_name,
                    confidence=confidence,
                    bbox=(x1, y1, x2, y2),
                    center=center,
                    area=area
                )
                objects.append(obj)
                
        return objects
        
    def track_motion(self, current_objects: List[DetectedObject], 
                     frame_time: float) -> List[MotionVector]:
        """
        Track object motion between frames.
        
        Args:
            current_objects: Objects detected in current frame
            frame_time: Time between frames in seconds
            
        Returns:
            List of MotionVector for tracked objects
        """
        motion_vectors = []
        
        # Simple motion detection (no proper tracking)
        for obj in current_objects:
            obj_id = id(obj)  # Simple ID for now
            
            if obj_id in self.prev_objects:
                prev_obj = self.prev_objects[obj_id]
                
                dx = obj.center[0] - prev_obj.center[0]
                dy = obj.center[1] - prev_obj.center[1]
                
                velocity = (dx / frame_time, dy / frame_time)
                magnitude = np.sqrt(dx**2 + dy**2) / frame_time
                direction = np.arctan2(dy, dx)
                
                motion_vector = MotionVector(
                    object_id=obj_id,
                    from_point=prev_obj.center,
                    to_point=obj.center,
                    velocity=velocity,
                    magnitude=magnitude,
                    direction=direction
                )
                motion_vectors.append(motion_vector)
                
        # Update previous objects
        self.prev_objects = {id(obj): obj for obj in current_objects}
        
        return motion_vectors
        
    def analyze_scene(self, frame: np.ndarray, 
                      frame_number: int = 0,
                      timestamp: float = 0.0) -> SceneAnalysis:
        """
        Perform complete scene analysis.
        
        Args:
            frame: Input frame
            frame_number: Frame number
            timestamp: Timestamp
            
        Returns:
            SceneAnalysis object
        """
        objects = self.detect_objects(frame)
        motion_vectors = self.track_motion(objects, 1/30.0)  # Assume 30 FPS
        
        # Simple scene classification
        scene_type = self._classify_scene(objects)
        
        # Color analysis
        dominant_colors = self._extract_dominant_colors(frame)
        
        # Brightness
        brightness = self._calculate_brightness(frame)
        
        # Motion intensity
        motion_intensity = np.mean([mv.magnitude for mv in motion_vectors]) if motion_vectors else 0.0
        
        return SceneAnalysis(
            frame_number=frame_number,
            timestamp=timestamp,
            objects=objects,
            motion_vectors=motion_vectors,
            scene_type=scene_type,
            dominant_colors=dominant_colors,
            brightness=brightness,
            motion_intensity=motion_intensity
        )
        
    def _classify_scene(self, objects: List[DetectedObject]) -> str:
        """Classify scene based on detected objects."""
        if not objects:
            return "empty"
            
        class_counts = {}
        for obj in objects:
            class_counts[obj.class_name] = class_counts.get(obj.class_name, 0) + 1
            
        # Simple heuristic
        if any(c in class_counts for c in ['person', 'car', 'bus', 'train']):
            return "urban"
        elif any(c in class_counts for c in ['tree', 'plant', 'bird']):
            return "nature"
        elif any(c in class_counts for c in ['chair', 'table', 'couch']):
            return "indoor"
        else:
            return "unknown"
            
    def _extract_dominant_colors(self, frame: np.ndarray, 
                                 k: int = 5) -> List[Tuple[int, int, int]]:
        """Extract dominant colors from frame using K-means."""
        pixels = frame.reshape(-1, 3).astype(np.float32)
        
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
        _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        centers = np.uint8(centers)
        return [tuple(center) for center in centers]
        
    def _calculate_brightness(self, frame: np.ndarray) -> float:
        """Calculate average brightness of frame."""
        if len(frame.shape) == 3:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        return np.mean(frame) / 255.0
