"""
Game Engine Module
=================

Pygame-based game engine for rendering and running generated games.
"""

import pygame
import sys
import time
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
import random
import math


@dataclass
class GameObject:
    """Base class for all game objects."""
    x: float
    y: float
    width: float
    height: float
    color: Tuple[int, int, int] = (255, 255, 255)
    visible: bool = True
    collidable: bool = True
    
    def draw(self, screen: pygame.Surface, camera_offset: Tuple[float, float] = (0, 0)):
        """Draw the object on the screen."""
        if not self.visible:
            return
            
        # Apply camera offset
        draw_x = int(self.x - camera_offset[0])
        draw_y = int(self.y - camera_offset[1])
        
        # Simple rectangle drawing
        rect = pygame.Rect(draw_x, draw_y, int(self.width), int(self.height))
        pygame.draw.rect(screen, self.color, rect)
        pygame.draw.rect(screen, (0, 0, 0), rect, 1)  # Border
        
    def get_rect(self) -> pygame.Rect:
        """Get the pygame Rect for collision detection."""
        return pygame.Rect(int(self.x), int(self.y), int(self.width), int(self.height))
        
    def collides_with(self, other: 'GameObject') -> bool:
        """Check collision with another object."""
        if not self.collidable or not other.collidable:
            return False
        return self.get_rect().colliderect(other.get_rect())


@dataclass
class Player(GameObject):
    """Player character."""
    speed: float = 5.0
    jump_force: float = 10.0
    velocity_x: float = 0.0
    velocity_y: float = 0.0
    is_grounded: bool = True
    can_shoot: bool = True
    health: int = 100
    score: int = 0
    color: Tuple[int, int, int] = (0, 128, 255)  # Blue
    
    def __post_init__(self):
        # Override default values
        self.width = 40
        self.height = 80
        
    def update(self, delta_time: float, input_state: dict, 
               game_objects: List[GameObject]):
        """Update player based on input and physics."""
        # Horizontal movement
        if input_state.get('left', False):
            self.velocity_x = -self.speed
        elif input_state.get('right', False):
            self.velocity_x = self.speed
        else:
            self.velocity_x *= 0.8  # Friction
            
        # Jumping
        if input_state.get('jump', False) and self.is_grounded:
            self.velocity_y = -self.jump_force
            self.is_grounded = False
            
        # Apply gravity
        self.velocity_y += 0.8  # Gravity
        
        # Update position
        self.x += self.velocity_x * delta_time * 60  # Multiply by 60 for FPS independence
        self.y += self.velocity_y * delta_time * 60
        
        # Check for ground collision
        self.is_grounded = False
        for obj in game_objects:
            if obj != self and self.collides_with(obj):
                # Simple ground detection (check if player is above object)
                if self.velocity_y > 0 and self.y + self.height > obj.y + 10:
                    self.y = obj.y - self.height
                    self.velocity_y = 0
                    self.is_grounded = True
                    
        # Keep player on screen
        if self.x < 0:
            self.x = 0
        if self.y < 0:
            self.y = 0
            self.velocity_y = 0
            
    def draw(self, screen: pygame.Surface, camera_offset: Tuple[float, float] = (0, 0)):
        """Draw the player."""
        # Draw body
        super().draw(screen, camera_offset)
        
        # Draw eyes (to show direction)
        eye_size = 8
        eye_offset = 15
        left_eye_x = int(self.x + eye_offset - camera_offset[0])
        left_eye_y = int(self.y + 20 - camera_offset[1])
        right_eye_x = int(self.x + self.width - eye_offset - camera_offset[0])
        right_eye_y = left_eye_y
        
        pygame.draw.circle(screen, (255, 255, 255), (left_eye_x, left_eye_y), eye_size)
        pygame.draw.circle(screen, (255, 255, 255), (right_eye_x, right_eye_y), eye_size)
        pygame.draw.circle(screen, (0, 0, 0), (left_eye_x, left_eye_y), eye_size // 2)
        pygame.draw.circle(screen, (0, 0, 0), (right_eye_x, right_eye_y), eye_size // 2)


@dataclass
class Platform(GameObject):
    """Platform object that player can stand on."""
    is_moving: bool = False
    move_speed: float = 2.0
    move_range: float = 100.0
    original_x: float = field(default=0.0)
    move_direction: int = 1
    color: Tuple[int, int, int] = (0, 255, 0)  # Green
    
    def __post_init__(self):
        if self.is_moving:
            self.original_x = self.x
            
    def update(self, delta_time: float):
        """Update moving platform."""
        if self.is_moving:
            self.x += self.move_speed * self.move_direction * delta_time * 60
            
            # Check bounds
            if self.x > self.original_x + self.move_range:
                self.move_direction = -1
            elif self.x < self.original_x - self.move_range:
                self.move_direction = 1


@dataclass
class Enemy(GameObject):
    """Enemy that moves and can damage player."""
    speed: float = 2.0
    damage: int = 20
    velocity_x: float = 0.0
    velocity_y: float = 0.0
    move_direction: int = 1
    move_range: float = 200.0
    original_x: float = field(default=0.0)
    color: Tuple[int, int, int] = (255, 0, 0)  # Red
    
    def __post_init__(self):
        self.original_x = self.x
        
    def update(self, delta_time: float, player: Player):
        """Update enemy AI."""
        # Simple AI: move back and forth
        self.x += self.speed * self.move_direction * delta_time * 60
        
        # Check bounds
        if self.x > self.original_x + self.move_range:
            self.move_direction = -1
        elif self.x < self.original_x - self.move_range:
            self.move_direction = 1
            
        # Chase player if close
        if abs(self.x - player.x) < 300:
            if self.x < player.x:
                self.move_direction = 1
            else:
                self.move_direction = -1
                
    def draw(self, screen: pygame.Surface, camera_offset: Tuple[float, float] = (0, 0)):
        """Draw the enemy."""
        super().draw(screen, camera_offset)
        
        # Draw angry eyes
        eye_size = 6
        left_eye_x = int(self.x + 10 - camera_offset[0])
        left_eye_y = int(self.y + 15 - camera_offset[1])
        right_eye_x = int(self.x + self.width - 10 - camera_offset[0])
        right_eye_y = left_eye_y
        
        pygame.draw.circle(screen, (255, 255, 255), (left_eye_x, left_eye_y), eye_size)
        pygame.draw.circle(screen, (255, 255, 255), (right_eye_x, right_eye_y), eye_size)
        pygame.draw.circle(screen, (0, 0, 0), (left_eye_x, left_eye_y), eye_size // 2)
        pygame.draw.circle(screen, (0, 0, 0), (right_eye_x, right_eye_y), eye_size // 2)


@dataclass
class Collectible(GameObject):
    """Item that player can collect."""
    score_value: int = 10
    color: Tuple[int, int, int] = (255, 255, 0)  # Yellow
    
    def __post_init__(self):
        self.width = 30
        self.height = 30
        
    def draw(self, screen: pygame.Surface, camera_offset: Tuple[float, float] = (0, 0)):
        """Draw the collectible."""
        # Draw circle
        center_x = int(self.x + self.width/2 - camera_offset[0])
        center_y = int(self.y + self.height/2 - camera_offset[1])
        pygame.draw.circle(screen, self.color, (center_x, center_y), int(self.width/2))
        pygame.draw.circle(screen, (0, 0, 0), (center_x, center_y), int(self.width/2), 1)


@dataclass
class Projectile(GameObject):
    """Projectile shot by player."""
    speed: float = 10.0
    damage: int = 10
    direction: Tuple[float, float] = (1, 0)
    lifetime: float = 2.0
    time_alive: float = 0.0
    color: Tuple[int, int, int] = (255, 255, 255)  # White
    
    def __post_init__(self):
        self.width = 10
        self.height = 10
        
    def update(self, delta_time: float) -> bool:
        """Update projectile position. Returns True if still alive."""
        self.x += self.direction[0] * self.speed * delta_time * 60
        self.y += self.direction[1] * self.speed * delta_time * 60
        self.time_alive += delta_time
        
        return self.time_alive < self.lifetime
        
    def draw(self, screen: pygame.Surface, camera_offset: Tuple[float, float] = (0, 0)):
        """Draw the projectile."""
        # Draw small circle
        center_x = int(self.x + self.width/2 - camera_offset[0])
        center_y = int(self.y + self.height/2 - camera_offset[1])
        pygame.draw.circle(screen, self.color, (center_x, center_y), int(self.width/2))


class GameEngine:
    """
    Main game engine for running generated games.
    
    Handles rendering, input, physics, and game state management.
    """
    
    def __init__(self, screen_width: int = 800, screen_height: int = 600):
        """
        Initialize game engine.
        
        Args:
            screen_width: Width of the game screen
            screen_height: Height of the game screen
        """
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.screen = None
        self.clock = None
        self.running = False
        self.game_objects: List[GameObject] = []
        self.projectiles: List[Projectile] = []
        self.player: Optional[Player] = None
        self.camera_offset: Tuple[float, float] = (0, 0)
        self.score: int = 0
        self.health: int = 100
        self.game_over: bool = False
        self.game_won: bool = False
        self.input_state: dict = {}
        self.last_time: float = 0.0
        
    def initialize(self):
        """Initialize Pygame."""
        pygame.init()
        self.screen = pygame.display.set_mode((self.screen_width, self.screen_height))
        pygame.display.set_caption("AI Game Maker")
        self.clock = pygame.time.Clock()
        self.running = True
        self.last_time = time.time()
        
    def create_from_game_design(self, game_design: dict):
        """
        Create game objects from a game design.
        
        Args:
            game_design: Game design dictionary
        """
        self.game_objects = []
        self.projectiles = []
        self.game_over = False
        self.game_won = False
        self.score = 0
        self.health = 100
        
        # Create player
        for element in game_design.get('levels', [{}])[0].get('elements', []):
            if element.get('type') == 'player':
                self.player = Player(
                    x=element.get('x', 100),
                    y=element.get('y', 100),
                    speed=element.get('properties', {}).get('speed', 5),
                    jump_force=element.get('properties', {}).get('jump_force', 10)
                )
                self.game_objects.append(self.player)
                break
            
        if self.player is None:
            # Create default player
            self.player = Player(x=100, y=100)
            self.game_objects.append(self.player)
            
        # Create other elements
        for element in game_design.get('levels', [{}])[0].get('elements', []):
            element_type = element.get('type')
            props = element.get('properties', {})
            
            if element_type == 'platform':
                obj = Platform(
                    x=element.get('x', 0),
                    y=element.get('y', 400),
                    width=element.get('width', 100),
                    height=element.get('height', 20),
                    is_moving=props.get('is_moving', False),
                    move_speed=props.get('move_speed', 2),
                    move_range=props.get('move_range', 100)
                )
                self.game_objects.append(obj)
                
            elif element_type == 'enemy':
                obj = Enemy(
                    x=element.get('x', 300),
                    y=element.get('y', 400),
                    width=element.get('width', 40),
                    height=element.get('height', 60),
                    speed=props.get('speed', 2),
                    damage=props.get('damage', 20)
                )
                self.game_objects.append(obj)
                
            elif element_type == 'collectible':
                obj = Collectible(
                    x=element.get('x', 200),
                    y=element.get('y', 300),
                    score_value=props.get('score_value', 10)
                )
                self.game_objects.append(obj)
                
    def handle_events(self):
        """Handle Pygame events."""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_LEFT:
                    self.input_state['left'] = True
                elif event.key == pygame.K_RIGHT:
                    self.input_state['right'] = True
                elif event.key == pygame.K_UP:
                    self.input_state['jump'] = True
                elif event.key == pygame.K_SPACE:
                    self.input_state['shoot'] = True
                    if self.player and self.player.can_shoot:
                        self._shoot()
                elif event.key == pygame.K_r:
                    # Reset game
                    self.reset()
                    
            elif event.type == pygame.KEYUP:
                if event.key == pygame.K_LEFT:
                    self.input_state['left'] = False
                elif event.key == pygame.K_RIGHT:
                    self.input_state['right'] = False
                elif event.key == pygame.K_UP:
                    self.input_state['jump'] = False
                elif event.key == pygame.K_SPACE:
                    self.input_state['shoot'] = False
                    
    def _shoot(self):
        """Create a new projectile."""
        if not self.player:
            return
            
        # Shoot in the direction player is facing
        direction_x = 1 if self.input_state.get('right', False) else -1
        if self.input_state.get('left', False):
            direction_x = -1
        elif self.input_state.get('right', False):
            direction_x = 1
            
        projectile = Projectile(
            x=self.player.x + self.player.width/2,
            y=self.player.y + self.player.height/2,
            direction=(direction_x, 0)
        )
        self.projectiles.append(projectile)
        
    def update(self):
        """Update game state."""
        current_time = time.time()
        delta_time = current_time - self.last_time
        self.last_time = current_time
        
        if delta_time > 0.1:  # Cap delta time to prevent issues
            delta_time = 0.1
            
        # Update player
        if self.player:
            self.player.update(delta_time, self.input_state, self.game_objects)
            
            # Update camera to follow player
            target_x = self.player.x - self.screen_width / 2
            self.camera_offset = (target_x, 0)
            
        # Update game objects
        for obj in self.game_objects:
            if hasattr(obj, 'update'):
                if isinstance(obj, Enemy):
                    obj.update(delta_time, self.player)
                elif isinstance(obj, Platform):
                    obj.update(delta_time)
                    
        # Update projectiles
        alive_projectiles = []
        for projectile in self.projectiles:
            if projectile.update(delta_time):
                alive_projectiles.append(projectile)
                
                # Check for collisions with enemies
                for obj in self.game_objects:
                    if isinstance(obj, Enemy) and projectile.collides_with(obj):
                        obj.health -= projectile.damage
                        if obj.health <= 0:
                            self.game_objects.remove(obj)
                        break
            
        self.projectiles = alive_projectiles
        
        # Check for player collisions with collectibles
        if self.player:
            for obj in self.game_objects[:]:  # Copy list for iteration
                if isinstance(obj, Collectible) and self.player.collides_with(obj):
                    self.score += obj.score_value
                    self.game_objects.remove(obj)
                    
            # Check for player collisions with enemies
            for obj in self.game_objects:
                if isinstance(obj, Enemy) and self.player.collides_with(obj):
                    self.health -= obj.damage
                    if self.health <= 0:
                        self.game_over = True
                        
        # Check win condition (all collectibles collected)
        collectibles = [o for o in self.game_objects if isinstance(o, Collectible)]
        if not collectibles:
            self.game_won = True
            
    def draw(self):
        """Draw game objects."""
        if self.screen is None:
            return
            
        # Clear screen
        self.screen.fill((240, 240, 240))  # Light gray background
        
        # Draw game objects
        for obj in self.game_objects:
            obj.draw(self.screen, self.camera_offset)
            
        # Draw projectiles
        for projectile in self.projectiles:
            projectile.draw(self.screen, self.camera_offset)
            
        # Draw player (on top)
        if self.player:
            self.player.draw(self.screen, self.camera_offset)
            
        # Draw HUD
        self._draw_hud()
        
        # Draw game over/won message
        if self.game_over:
            self._draw_message("GAME OVER", (255, 0, 0))
        elif self.game_won:
            self._draw_message("YOU WIN!", (0, 255, 0))
            
        pygame.display.flip()
        
    def _draw_hud(self):
        """Draw heads-up display."""
        font = pygame.font.SysFont(None, 36)
        
        # Score
        score_text = font.render(f"Score: {self.score}", True, (0, 0, 0))
        self.screen.blit(score_text, (10, 10))
        
        # Health
        health_text = font.render(f"Health: {self.health}", True, (0, 0, 0))
        self.screen.blit(health_text, (10, 50))
        
        # Draw health bar
        bar_width = 200
        bar_height = 20
        health_ratio = self.health / 100.0
        pygame.draw.rect(self.screen, (255, 0, 0), 
                        (10, 80, bar_width, bar_height))
        pygame.draw.rect(self.screen, (0, 255, 0),
                        (10, 80, bar_width * health_ratio, bar_height))
        
    def _draw_message(self, text: str, color: Tuple[int, int, int]):
        """Draw a centered message."""
        font = pygame.font.SysFont(None, 72)
        text_surface = font.render(text, True, color)
        text_rect = text_surface.get_rect(center=(self.screen_width/2, self.screen_height/2))
        self.screen.blit(text_surface, text_rect)
        
    def reset(self):
        """Reset the game."""
        self.game_over = False
        self.game_won = False
        self.score = 0
        self.health = 100
        self.camera_offset = (0, 0)
        
        # Reset player position
        if self.player:
            self.player.x = 100
            self.player.y = 100
            self.player.velocity_x = 0
            self.player.velocity_y = 0
            
    def run(self):
        """Main game loop."""
        self.initialize()
        
        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            
            # Cap frame rate
            self.clock.tick(60)
            
        pygame.quit()
        sys.exit()
        
    def get_state(self) -> dict:
        """Get current game state."""
        return {
            'score': self.score,
            'health': self.health,
            'game_over': self.game_over,
            'game_won': self.game_won,
            'player_position': (self.player.x, self.player.y) if self.player else (0, 0),
            'num_objects': len(self.game_objects),
            'num_projectiles': len(self.projectiles)
        }
