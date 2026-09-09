from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.playback import router as playback_router
from .services.spatial_service import spatial_service

app = FastAPI(
    title="Spatial Playback Telemetry API",
    description="Scalable High-Performance Spatial Playback & Telemetry Backend",
    version="2.0.0"
)

# Enable CORS for local React/Vite development and general access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modern API routes under /api
app.include_router(playback_router, prefix="/api", tags=["Playback"])

# Include legacy /state endpoint at root for 100% backward compatibility
@app.get("/state", tags=["Legacy"])
def get_legacy_state(t: int = 0):
    frame = spatial_service.get_frame_by_time("default", t)
    if not frame:
        return {"time": t, "blue": [], "yellow": []}
    return {
        "time": frame.time,
        "blue": frame.blue,
        "yellow": frame.yellow
    }

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "spatial-playback-api",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("Backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
