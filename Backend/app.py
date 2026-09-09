"""
Spatial Playback Entrypoint
Delegates to the scalable FastAPI modular architecture in Backend/app/main.py
"""
import sys
from pathlib import Path

# Ensure Backend package is in path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
