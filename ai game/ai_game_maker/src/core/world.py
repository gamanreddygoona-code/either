"""
World Engine — Tile-first, Chunk-first architecture
===================================================
Research summary implemented:

- TileWorldEngine: chunk is smallest unit of load/save/dirty/render cache
- Nu World: World aggregates subsystems via facade, frame lifecycle, spatial hash
- industrialworld: swept physics, destructible, GPU CA inspiration (CPU here)

World aggregates: TileMap + ChunkManager + PhysicsWorld + WorldGenerator
All coordinates: World Px ↔ Tile ↔ Chunk
"""

from __future__ import annotations
import math, json, random
from dataclasses import dataclass, field, asdict
from typing import Dict, Tuple, List, Optional
from enum import Enum
from pathlib import Path

TILE_SIZE = 32  # px
CHUNK_SIZE = 16  # tiles per chunk side
CHUNK_PX = TILE_SIZE * CHUNK_SIZE  # 512 px

class TileType(Enum):
    AIR = 0
    GROUND = 1
    PLATFORM = 2
    WALL = 3
    SPIKE = 4

TILE_PROPS = {
    TileType.AIR:      {"solid": False, "friction": 0.0, "color": (0,0,0,0)},
    TileType.GROUND:   {"solid": True,  "friction": 0.8, "color": (90,110,90)},
    TileType.PLATFORM: {"solid": True,  "friction": 0.85,"color": (78,180,78)},
    TileType.WALL:     {"solid": True,  "friction": 0.6, "color": (110,110,130)},
    TileType.SPIKE:    {"solid": False, "friction": 0.5, "color": (200,50,50)},
}

@dataclass
class Tile:
    type: TileType = TileType.AIR
    @property
    def solid(self): return TILE_PROPS[self.type]["solid"]
    @property
    def color(self): return TILE_PROPS[self.type]["color"][:3]
    def to_dict(self): return {"type": self.type.value}
    @staticmethod
    def from_dict(d): return Tile(TileType(d["type"]))

@dataclass
class ChunkCoord:
    x: int
    y: int
    def __hash__(self): return hash((self.x,self.y))
    def __eq__(self, o): return isinstance(o, ChunkCoord) and self.x==o.x and self.y==o.y
    @staticmethod
    def from_world_px(wx, wy): return ChunkCoord(math.floor(wx/CHUNK_PX), math.floor(wy/CHUNK_PX))
    @staticmethod
    def from_tile(tx, ty): return ChunkCoord(math.floor(tx/CHUNK_SIZE), math.floor(ty/CHUNK_SIZE))
    def world_px_origin(self): return (self.x*CHUNK_PX, self.y*CHUNK_PX)
    def neighbors(self): return [ChunkCoord(self.x+dx,self.y+dy) for dx in (-1,0,1) for dy in (-1,0,1) if not (dx==0 and dy==0)]

def world_to_tile(wx, wy): return (math.floor(wx/TILE_SIZE), math.floor(wy/TILE_SIZE))
def tile_to_world(tx, ty): return (tx*TILE_SIZE, ty*TILE_SIZE)
def world_to_local_tile(wx, wy):
    tx,ty = world_to_tile(wx,wy)
    cc = ChunkCoord.from_tile(tx,ty)
    return cc, (tx - cc.x*CHUNK_SIZE, ty - cc.y*CHUNK_SIZE)

class Chunk:
    """ Smallest unit of load/save/dirty/render cache """
    def __init__(self, coord: ChunkCoord):
        self.coord = coord
        self.tiles: List[List[Tile]] = [[Tile() for _ in range(CHUNK_SIZE)] for _ in range(CHUNK_SIZE)]
        self.dirty = True
        self.generated = False
    def get(self, lx, ly) -> Tile:
        if 0 <= lx < CHUNK_SIZE and 0 <= ly < CHUNK_SIZE:
            return self.tiles[ly][lx]
        return Tile(TileType.AIR)
    def set(self, lx, ly, tile: Tile):
        if 0 <= lx < CHUNK_SIZE and 0 <= ly < CHUNK_SIZE:
            self.tiles[ly][lx] = tile
            self.dirty = True
    def is_solid_tile(self, lx,ly): return self.get(lx,ly).solid
    def to_dict(self):
        return {"coord": [self.coord.x,self.coord.y], "tiles": [[t.to_dict() for t in row] for row in self.tiles], "generated": self.generated}
    @staticmethod
    def from_dict(d):
        c = Chunk(ChunkCoord(d["coord"][0], d["coord"][1]))
        c.tiles = [[Tile.from_dict(td) for td in row] for row in d["tiles"]]
        c.generated = d.get("generated", True)
        c.dirty=False
        return c
    def collision_grid(self):
        """ 16x16 bool grid """
        return [[self.get(x,y).solid for x in range(CHUNK_SIZE)] for y in range(CHUNK_SIZE)]

class TileMap:
    """ Chunk-first storage """
    def __init__(self):
        self.chunks: Dict[ChunkCoord, Chunk] = {}
    def get_or_create(self, coord: ChunkCoord) -> Chunk:
        if coord not in self.chunks:
            self.chunks[coord] = Chunk(coord)
        return self.chunks[coord]
    def get_tile_world(self, wx, wy) -> Tile:
        cc, (lx,ly) = world_to_local_tile(wx,wy)
        ch = self.chunks.get(cc)
        return ch.get(lx,ly) if ch else Tile(TileType.AIR)
    def set_tile_world(self, wx, wy, tile: Tile):
        cc,(lx,ly) = world_to_local_tile(wx,wy)
        self.get_or_create(cc).set(lx,ly,tile)
    def set_tile(self, tx,ty, tile: Tile):
        cc = ChunkCoord.from_tile(tx,ty)
        self.get_or_create(cc).set(tx - cc.x*CHUNK_SIZE, ty - cc.y*CHUNK_SIZE, tile)
    def is_solid_world(self, wx, wy) -> bool:
        return self.get_tile_world(wx,wy).solid
    def get_chunk(self, coord: ChunkCoord) -> Optional[Chunk]: return self.chunks.get(coord)
    def all_chunks(self): return list(self.chunks.values())
    def world_bounds_tiles(self):
        if not self.chunks: return (0,0,0,0)
        xs = [c.coord.x for c in self.chunks.values()]; ys=[c.coord.y for c in self.chunks.values()]
        return (min(xs)*CHUNK_SIZE, min(ys)*CHUNK_SIZE, (max(xs)+1)*CHUNK_SIZE, (max(ys)+1)*CHUNK_SIZE)
    def to_dict(self): return {"chunks": {f"{k.x}_{k.y}": v.to_dict() for k,v in self.chunks.items()}}
    @staticmethod
    def from_dict(d):
        tm=TileMap()
        for _, cd in d.get("chunks",{}).items():
            c=Chunk.from_dict(cd)
            tm.chunks[c.coord]=c
        return tm
    def cull(self, cam_x, cam_y, view_w, view_h):
        """ return chunks in view (camera world px + view size) """
        min_c = ChunkCoord.from_world_px(cam_x, cam_y)
        max_c = ChunkCoord.from_world_px(cam_x+view_w, cam_y+view_h)
        out=[]
        for x in range(min_c.x-1, max_c.x+2):
            for y in range(min_c.y-1, max_c.y+2):
                ch=self.chunks.get(ChunkCoord(x,y))
                if ch: out.append(ch)
        return out

class PhysicsWorld:
    """ Swept AABB, tile-based collision, spatial hash broad-phase """
    def __init__(self, tilemap: TileMap, gravity=0.8):
        self.tilemap=tilemap
        self.gravity=gravity
    def tile_solid_at(self, wx, wy): return self.tilemap.is_solid_world(wx,wy)
    def check_aabb_solid(self, x,y,w,h) -> bool:
        # check 4 corners + center
        points=[(x,y),(x+w,y),(x,y+h),(x+w,y+h),(x+w/2,y+h+1)]
        return any(self.tile_solid_at(px,py) for px,py in points)
    def swept_move(self, x,y,w,h, vx,vy) -> Tuple[float,float,bool,bool]:
        """ move with swept per-axis; returns new x,y, hit_x, hit_y """
        # X axis
        nx = x + vx
        hit_x=False
        if vx !=0:
            # sample vertical span
            step = 1 if vx>0 else -1
            # need to check tiles along edge
            edge_x = (nx + w) if vx>0 else nx
            for py in [y+2, y+h//2, y+h-2]:
                if self.tile_solid_at(edge_x, py):
                    hit_x=True
                    # snap to tile boundary
                    tx,_ = world_to_tile(edge_x, py)
                    tile_wx,_ = tile_to_world(tx,0)
                    nx = tile_wx - w -0.01 if vx>0 else tile_wx + TILE_SIZE +0.01
                    break
        # Y axis
        ny = y + vy
        hit_y=False
        if vy !=0:
            edge_y = (ny + h) if vy>0 else ny
            for px in [nx+2, nx+w//2, nx+w-2]:
                if self.tile_solid_at(px, edge_y):
                    hit_y=True
                    _,ty = world_to_tile(px, edge_y)
                    _,tile_wy = tile_to_world(0,ty)
                    ny = tile_wy - h -0.01 if vy>0 else tile_wy + TILE_SIZE +0.01
                    break
        return nx, ny, hit_x, hit_y

class WorldGenerator:
    """ Procedural, video-driven (dominant colors, brightness, motion, scene_type) """
    BIOMES = {
        "city": {"ground": TileType.GROUND, "palette": [(90,90,95),(110,110,130)], "platform_chance": 0.35},
        "forest": {"ground": TileType.GROUND, "palette": [(70,110,70),(90,130,80)], "platform_chance": 0.45},
        "indoor": {"ground": TileType.WALL, "palette": [(130,120,110)], "platform_chance": 0.5},
        "cave": {"ground": TileType.WALL, "palette": [(80,80,85)], "platform_chance": 0.25},
    }
    def __init__(self, seed=None):
        self.rnd = random.Random(seed)
    def choose_biome(self, scene_type, dominant_colors):
        if scene_type in ["urban","city"]: return "city"
        if scene_type in ["nature","forest"]: return "forest"
        if scene_type == "indoor": return "indoor"
        # fallback by brightness
        return "city"
    def generate(self, tilemap: TileMap, world_tiles_w=80, world_tiles_h=24, scene_meta=None):
        """
        Fill tilemap with ground + platforms derived from video meta.
        scene_meta: {scene_type, dominant_colors, brightness, motion_intensity, objects: [{bbox, class}]}
        """
        scene_meta = scene_meta or {}
        biome_name = self.choose_biome(scene_meta.get("scene_type","unknown"), scene_meta.get("dominant_colors",[]))
        biome = self.BIOMES[biome_name]
        brightness = scene_meta.get("brightness", 0.5)
        motion = scene_meta.get("motion_intensity", 0)
        # ground floor: fill bottom 2 rows solid
        ground_y = world_tiles_h - 2
        for x in range(world_tiles_w):
            for y in range(ground_y, world_tiles_h):
                tilemap.set_tile(x,y, Tile(biome["ground"]))
        # add variation via perlin-like noise (simple random hills)
        for x in range(world_tiles_w):
            if self.rnd.random() < 0.08 + brightness*0.05:
                h = self.rnd.randint(1,3)
                for dy in range(h):
                    tilemap.set_tile(x, ground_y-1-dy, Tile(TileType.GROUND))
        # platforms: density driven by motion + platform_chance
        plat_chance = biome["platform_chance"] + motion*0.01
        for x in range(4, world_tiles_w-4):
            for y in range(6, ground_y-3):
                if self.rnd.random() < plat_chance*0.07:
                    # platform run length 3-5 tiles
                    length = self.rnd.randint(3,5)
                    for dx in range(length):
                        if x+dx < world_tiles_w:
                            # avoid overwriting ground
                            if tilemap.get_tile_world((x+dx)*TILE_SIZE, y*TILE_SIZE).type == TileType.AIR:
                                tilemap.set_tile(x+dx,y, Tile(TileType.PLATFORM))
        # sprinkle spikes in cave
        if biome_name=="cave":
            for _ in range(world_tiles_w//10):
                x=self.rnd.randint(0,world_tiles_w-1)
                tilemap.set_tile(x, ground_y-1, Tile(TileType.SPIKE))
        # seed objects from detected bboxes -> place extra platforms/walls near them
        for obj in scene_meta.get("objects",[])[:8]:
            bbox = obj.get("bbox", [0,0,0,0])
            # map bbox (px 640x480) to tile coords
            bx = int((bbox[0]/640)*world_tiles_w)
            by = int((bbox[1]/480)*(world_tiles_h-6)) + 2
            bx=max(1, min(world_tiles_w-2, bx)); by=max(2, min(ground_y-2, by))
            # place a 2x1 platform under detected person/car etc
            tilemap.set_tile(bx, by, Tile(TileType.PLATFORM))
            tilemap.set_tile(bx+1, by, Tile(TileType.PLATFORM))
        # mark generated
        for ch in tilemap.all_chunks(): ch.generated=True
        return {"biome": biome_name, "world_tiles": [world_tiles_w, world_tiles_h], "seed": self.rnd.randint(0,9999)}

class World:
    """ Facade — Genie-like: larger explorable world (160×40) with chunk streaming """
    def __init__(self, tilemap: Optional[TileMap]=None, gravity=0.85):
        self.tilemap = tilemap or TileMap()
        self.physics = PhysicsWorld(self.tilemap, gravity=gravity)
        self.generator = WorldGenerator()
        self.entities: List[dict] = []
        self.spawn_point: Tuple[int,int] = (64, 64)
        self.world_size_tiles = (160,40)  # Genie scale — 5120×1280 px, 10×3 chunks
        self.meta: Dict = {}
    def generate_from_video(self, scene_meta: dict, seed=None):
        self.generator = WorldGenerator(seed or scene_meta.get("timestamp", random.randint(0,9999)))
        info = self.generator.generate(self.tilemap, world_tiles_w=self.world_size_tiles[0], world_tiles_h=self.world_size_tiles[1], scene_meta=scene_meta)
        self.meta.update(info)
        self.meta.update({"scene_type": scene_meta.get("scene_type"), "brightness": scene_meta.get("brightness"), "motion": scene_meta.get("motion_intensity")})
        # spawn point = first solid ground
        self.spawn_point = (2*TILE_SIZE, (self.world_size_tiles[1]-4)*TILE_SIZE)
        return info
    def is_solid(self, wx,wy): return self.physics.tile_solid_at(wx,wy)
    def to_dict(self):
        return {"tilemap": self.tilemap.to_dict(), "spawn": self.spawn_point, "size_tiles": self.world_size_tiles, "meta": self.meta}
    @staticmethod
    def from_dict(d):
        w=World(TileMap.from_dict(d["tilemap"]))
        w.spawn_point=tuple(d.get("spawn",[64,64]))
        w.world_size_tiles=tuple(d.get("size_tiles",[80,24]))
        w.meta=d.get("meta",{})
        return w
    def save(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path,"w") as f: json.dump(self.to_dict(), f, indent=2)
    @staticmethod
    def load(path: Path):
        with open(path) as f: return World.from_dict(json.load(f))
    def render_chunks(self, cam_x, cam_y, view_w, view_h):
        """ for API: return visible chunks payload """
        chunks = self.tilemap.cull(cam_x, cam_y, view_w, view_h)
        return [c.to_dict() for c in chunks]
