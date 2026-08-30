"""
Motion Analysis AI Agent
=======================

AI agent responsible for analyzing motion patterns and generating
realistic movement for game elements.
"""

import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import random
import math
from collections import deque


@dataclass
class MotionPattern:
    """Represents a learned motion pattern."""
    pattern_id: str
    trajectory: List[Tuple[float, float]]  # List of (x, y) points
    velocities: List[Tuple[float, float]]  # List of (vx, vy) vectors
    duration: float  # Total duration in seconds
    is_periodic: bool
    frequency: float  # For periodic motions
    amplitude: float  # For periodic motions
    
    def get_position_at(self, t: float) -> Tuple[float, float]:
        """Get position at time t."""
        if self.is_periodic:
            # For periodic motion
            phase = (t / self.duration) * 2 * math.pi
            x = self.amplitude * math.sin(phase * self.frequency)
            y = 0  # Simplified
            return x, y
        else:
            # For non-periodic, interpolate
            if t <= 0:
                return self.trajectory[0]
            if t >= self.duration:
                return self.trajectory[-1]
                
            # Find segment
            total_points = len(self.trajectory)
            segment_time = self.duration / (total_points - 1)
            segment_idx = int(t / segment_time)
            segment_idx = min(segment_idx, total_points - 2)
            
            # Linear interpolation
            t_in_segment = (t - segment_idx * segment_time) / segment_time
            x1, y1 = self.trajectory[segment_idx]
            x2, y2 = self.trajectory[segment_idx + 1]
            
            x = x1 + (x2 - x1) * t_in_segment
            y = y1 + (y2 - y1) * t_in_segment
            return x, y


@dataclass
class MotionProfile:
    """Motion profile for a game element."""
    element_id: str
    base_speed: float
    acceleration: float
    max_speed: float
    motion_patterns: List[MotionPattern]
    current_pattern_idx: int = 0
    current_time: float = 0.0
    is_active: bool = True
    
    def update(self, delta_time: float) -> Tuple[float, float]:
        """Update motion and return displacement."""
        if not self.is_active or not self.motion_patterns:
            return 0, 0
            
        pattern = self.motion_patterns[self.current_pattern_idx]
        old_x, old_y = pattern.get_position_at(self.current_time)
        
        self.current_time += delta_time
        
        # Check if pattern is complete
        if self.current_time >= pattern.duration:
            self.current_time = 0
            self.current_pattern_idx = (self.current_pattern_idx + 1) % len(self.motion_patterns)
            pattern = self.motion_patterns[self.current_pattern_idx]
            
        new_x, new_y = pattern.get_position_at(self.current_time)
        
        dx = new_x - old_x
        dy = new_y - old_y
        
        return dx, dy


class MotionAgent:
    """
    AI Agent for motion analysis and generation.
    
    Analyzes motion vectors from video and generates realistic
    movement patterns for game elements.
    """
    
    def __init__(self, agent_id: str = "motion_agent_001",
                 learning_rate: float = 0.1,
                 memory_size: int = 100):
        """
        Initialize Motion Agent.
        
        Args:
            agent_id: Unique agent identifier
            learning_rate: How quickly the agent learns new patterns
            memory_size: Maximum number of motion patterns to remember
        """
        self.agent_id = agent_id
        self.learning_rate = learning_rate
        self.memory_size = memory_size
        self.motion_patterns: Dict[str, MotionPattern] = {}
        self.motion_history: Dict[str, deque] = {}
        self.motion_profiles: Dict[str, MotionProfile] = {}
        self.pattern_counter = 0
        
    def analyze_motion_vectors(self, motion_vectors: List[dict],
                              frame_time: float) -> Dict[str, MotionPattern]:
        """
        Analyze motion vectors and extract patterns.
        
        Args:
            motion_vectors: List of motion vector dictionaries
            frame_time: Time between frames in seconds
            
        Returns:
            Dictionary of extracted motion patterns
        """
        new_patterns = {}
        
        # Group vectors by object ID
        by_object = {}
        for mv in motion_vectors:
            obj_id = mv.get('object_id')
            if obj_id not in by_object:
                by_object[obj_id] = []
            by_object[obj_id].append(mv)
            
        # Extract patterns for each object
        for obj_id, vectors in by_object.items():
            if len(vectors) < 3:  # Need at least 3 points for a pattern
                continue
                
            trajectory = []
            velocities = []
            
            for i, mv in enumerate(vectors):
                # Get position (use to_point as current position)
                x, y = mv.get('to_point', (0, 0))
                trajectory.append((x, y))
                
                # Get velocity
                vx, vy = mv.get('velocity', (0, 0))
                velocities.append((vx, vy))
                
            duration = len(vectors) * frame_time
            
            # Check if motion is periodic
            is_periodic = self._detect_periodicity(trajectory)
            frequency, amplitude = self._analyze_periodic_motion(trajectory) if is_periodic else (0, 0)
            
            pattern_id = f"pattern_{self.pattern_counter}"
            self.pattern_counter += 1
            
            pattern = MotionPattern(
                pattern_id=pattern_id,
                trajectory=trajectory,
                velocities=velocities,
                duration=duration,
                is_periodic=is_periodic,
                frequency=frequency,
                amplitude=amplitude
            )
            
            self.motion_patterns[pattern_id] = pattern
            new_patterns[obj_id] = pattern
            
            # Store in history
            if obj_id not in self.motion_history:
                self.motion_history[obj_id] = deque(maxlen=self.memory_size)
            self.motion_history[obj_id].append(pattern)
            
        return new_patterns
        
    def _detect_periodicity(self, trajectory: List[Tuple[float, float]],
                           threshold: float = 0.1) -> bool:
        """Detect if a trajectory is periodic."""
        if len(trajectory) < 4:
            return False
            
        # Simple approach: check if start and end are close
        x1, y1 = trajectory[0]
        x2, y2 = trajectory[-1]
        
        distance = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        avg_distance = sum(
            math.sqrt((trajectory[i+1][0] - trajectory[i][0])**2 + 
                     (trajectory[i+1][1] - trajectory[i][1])**2)
            for i in range(len(trajectory)-1)
        ) / (len(trajectory) - 1)
        
        return distance < threshold * avg_distance
        
    def _analyze_periodic_motion(self, trajectory: List[Tuple[float, float]]) -> Tuple[float, float]:
        """Analyze frequency and amplitude of periodic motion."""
        # Simplified analysis
        x_vals = [p[0] for p in trajectory]
        y_vals = [p[1] for p in trajectory]
        
        # Find peaks to estimate frequency
        x_peaks = self._find_peaks(x_vals)
        y_peaks = self._find_peaks(y_vals)
        
        # Use x-axis for frequency if it has more variation
        if len(x_peaks) > len(y_peaks):
            peak_distance = x_peaks[1] - x_peaks[0] if len(x_peaks) > 1 else 1
            frequency = 1.0 / peak_distance if peak_distance > 0 else 1.0
            amplitude = (max(x_vals) - min(x_vals)) / 2
        else:
            peak_distance = y_peaks[1] - y_peaks[0] if len(y_peaks) > 1 else 1
            frequency = 1.0 / peak_distance if peak_distance > 0 else 1.0
            amplitude = (max(y_vals) - min(y_vals)) / 2
            
        return frequency, amplitude
        
    def _find_peaks(self, values: List[float]) -> List[int]:
        """Find peak indices in a list of values."""
        peaks = []
        for i in range(1, len(values) - 1):
            if values[i] > values[i-1] and values[i] > values[i+1]:
                peaks.append(i)
        return peaks
        
    def create_motion_profile(self, element_id: str, 
                             base_speed: float = 1.0,
                             pattern_ids: Optional[List[str]] = None) -> MotionProfile:
        """
        Create a motion profile for a game element.
        
        Args:
            element_id: ID of the game element
            base_speed: Base speed of the element
            pattern_ids: List of motion pattern IDs to use
            
        Returns:
            MotionProfile object
        """
        if pattern_ids is None:
            # Use all available patterns
            pattern_ids = list(self.motion_patterns.keys())
            
        motion_patterns = [self.motion_patterns[pid] for pid in pattern_ids 
                          if pid in self.motion_patterns]
        
        if not motion_patterns:
            # Create a default stationary pattern
            default_pattern = MotionPattern(
                pattern_id="default_stationary",
                trajectory=[(0, 0)],
                velocities=[(0, 0)],
                duration=1.0,
                is_periodic=False,
                frequency=0,
                amplitude=0
            )
            motion_patterns = [default_pattern]
            
        profile = MotionProfile(
            element_id=element_id,
            base_speed=base_speed,
            acceleration=0.5,
            max_speed=base_speed * 2,
            motion_patterns=motion_patterns
        )
        
        self.motion_profiles[element_id] = profile
        return profile
        
    def generate_realistic_motion(self, element_id: str, 
                                  delta_time: float) -> Tuple[float, float]:
        """
        Generate realistic motion for an element.
        
        Args:
            element_id: ID of the element
            delta_time: Time since last update
            
        Returns:
            (dx, dy) displacement
        """
        if element_id not in self.motion_profiles:
            # Create a default profile
            self.create_motion_profile(element_id)
            
        profile = self.motion_profiles[element_id]
        dx, dy = profile.update(delta_time)
        
        # Apply base speed
        dx *= profile.base_speed
        dy *= profile.base_speed
        
        return dx, dy
        
    def adapt_to_environment(self, element_id: str, 
                            environment: dict):
        """
        Adapt motion to environment constraints.
        
        Args:
            element_id: ID of the element
            environment: Dictionary with environment info (boundaries, obstacles, etc.)
        """
        if element_id not in self.motion_profiles:
            return
            
        profile = self.motion_profiles[element_id]
        
        # Adjust speed based on environment complexity
        obstacle_density = environment.get('obstacle_density', 0)
        profile.base_speed *= (1.0 - obstacle_density * 0.5)
        
        # If near boundary, reduce speed
        distance_to_boundary = environment.get('distance_to_boundary', float('inf'))
        if distance_to_boundary < 50:
            profile.base_speed *= 0.5
            
    def learn_from_player(self, player_motion: List[dict]):
        """
        Learn motion patterns from player behavior.
        
        Args:
            player_motion: List of player motion data
        """
        # Analyze player motion and add to patterns
        patterns = self.analyze_motion_vectors(player_motion, 1/60.0)
        
        # Adjust learning rate based on how much we learned
        if patterns:
            self.learning_rate = min(0.5, self.learning_rate * 1.1)
            
    def generate_smooth_motion(self, start_pos: Tuple[float, float],
                               end_pos: Tuple[float, float],
                               duration: float,
                               num_points: int = 10) -> List[Tuple[float, float]]:
        """
        Generate a smooth motion path between two points.
        
        Args:
            start_pos: Starting position (x, y)
            end_pos: Ending position (x, y)
            duration: Total duration in seconds
            num_points: Number of points in the path
            
        Returns:
            List of (x, y) points
        """
        path = []
        
        for i in range(num_points):
            t = i / (num_points - 1)
            
            # Use ease-in-out for smoother motion
            t_eased = self._ease_in_out_quad(t)
            
            x = start_pos[0] + (end_pos[0] - start_pos[0]) * t_eased
            y = start_pos[1] + (end_pos[1] - start_pos[1]) * t_eased
            
            path.append((x, y))
            
        return path
        
    def _ease_in_out_quad(self, t: float) -> float:
        """Quadratic ease-in-out function."""
        if t < 0.5:
            return 2 * t * t
        else:
            return -1 + (4 - 2 * t) * t
            
    def generate_avoidance_motion(self, position: Tuple[float, float],
                                  obstacles: List[Tuple[float, float, float, float]],
                                  target: Optional[Tuple[float, float]] = None,
                                  speed: float = 1.0) -> Tuple[float, float]:
        """
        Generate motion that avoids obstacles.
        
        Args:
            position: Current position (x, y)
            obstacles: List of (x, y, width, height) obstacle rectangles
            target: Target position (optional)
            speed: Movement speed
            
        Returns:
            (vx, vy) velocity vector
        """
        # Calculate repulsion from obstacles
        vx, vy = 0, 0
        
        for ox, oy, ow, oh in obstacles:
            # Calculate distance to obstacle
            closest_x = max(ox, min(position[0], ox + ow))
            closest_y = max(oy, min(position[1], oy + oh))
            
            dx = position[0] - closest_x
            dy = position[1] - closest_y
            distance = math.sqrt(dx**2 + dy**2)
            
            if distance < 100:  # Only avoid if close
                # Repulsion force (inverse square law)
                force = 1.0 / (distance * distance) if distance > 0 else 10.0
                vx += dx * force
                vy += dy * force
                
        # Normalize and apply speed
        magnitude = math.sqrt(vx**2 + vy**2)
        if magnitude > 0:
            vx = (vx / magnitude) * speed
            vy = (vy / magnitude) * speed
            
        # Add attraction to target if provided
        if target:
            tx, ty = target
            dx = tx - position[0]
            dy = ty - position[1]
            distance = math.sqrt(dx**2 + dy**2)
            
            if distance > 0:
                attraction = min(1.0, speed / distance)
                vx += dx * attraction * 0.5
                vy += dy * attraction * 0.5
                
        return vx, vy
