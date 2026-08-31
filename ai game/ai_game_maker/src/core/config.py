"""
Backend Config — token only at backend, never to frontend
"""
import os
from pathlib import Path

def load_env_file(path=".env"):
    p = Path(path)
    if not p.exists():
        # also try one level up (ai_game_maker/.env)
        p = Path(__file__).resolve().parents[2] / ".env"
    if p.exists():
        for line in p.read_text().splitlines():
            line=line.strip()
            if not line or line.startswith("#") or "=" not in line: continue
            k,v=line.split("=",1)
            k=k.strip(); v=v.strip().strip('"').strip("'")
            if k and v and k not in os.environ:
                os.environ[k]=v

load_env_file()

BACKEND_TOKEN = os.environ.get("BACKEND_TOKEN", "")
# generic alias — if user sets FB_TOKEN / API_TOKEN etc
if not BACKEND_TOKEN:
    BACKEND_TOKEN = os.environ.get("FB_TOKEN") or os.environ.get("API_TOKEN") or ""

def has_token() -> bool:
    return bool(BACKEND_TOKEN and len(BACKEND_TOKEN) > 10)

def token_preview() -> str:
    if not BACKEND_TOKEN: return "missing"
    return BACKEND_TOKEN[:6] + "…" + BACKEND_TOKEN[-4:] + f" ({len(BACKEND_TOKEN)} chars)"

def auth_headers() -> dict:
    """Use at backend only — never send to client"""
    if not has_token(): return {}
    # Bearer pattern; adjust per provider if needed
    return {"Authorization": f"Bearer {BACKEND_TOKEN}"}
