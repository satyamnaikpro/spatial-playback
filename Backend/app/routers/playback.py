from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional
from ..models.schemas import (
    PlaybackFrame,
    ScenarioMetadata,
    ScenarioSummary
)
from ..services.spatial_service import spatial_service

router = APIRouter()

@router.get("/scenarios", response_model=List[ScenarioSummary], summary="List all available spatial scenarios")
def list_scenarios():
    return spatial_service.get_all_scenarios()

@router.get("/scenarios/{scenario_id}/metadata", response_model=ScenarioMetadata, summary="Get scenario metadata")
def get_scenario_metadata(scenario_id: str):
    metadata = spatial_service.get_metadata(scenario_id)
    if not metadata:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return metadata

@router.get("/scenarios/{scenario_id}/frames", response_model=List[PlaybackFrame], summary="Fetch buffered frames for playback")
def get_scenario_frames(
    scenario_id: str,
    start: int = Query(default=0, ge=0),
    limit: Optional[int] = Query(default=None, ge=1)
):
    frames = spatial_service.get_frames(scenario_id, start=start, limit=limit)
    if frames is None:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return frames

@router.get("/scenarios/{scenario_id}/state", response_model=PlaybackFrame, summary="Fetch single state frame for a timestep")
def get_scenario_state(scenario_id: str, t: int = Query(default=0, ge=0)):
    frame = spatial_service.get_frame_by_time(scenario_id, t)
    if not frame:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return frame

@router.post("/scenarios/custom", response_model=ScenarioMetadata, summary="Upload custom trajectory data")
def create_custom_scenario(payload: dict = Body(...)):
    name = payload.get("name", "Custom Trajectory")
    description = payload.get("description", "Uploaded spatial dataset")
    frames = payload.get("frames", [])
    if not frames or not isinstance(frames, list):
        raise HTTPException(status_code=400, detail="Invalid frames list provided")
    return spatial_service.register_custom_scenario(name, description, frames)

# Top-level backward compatibility endpoint
@router.get("/state")
def legacy_get_state(t: int = Query(default=0)):
    frame = spatial_service.get_frame_by_time("default", t)
    if not frame:
        raise HTTPException(status_code=404, detail="Default data not available")
    # Return dict format matching legacy expectations
    return {
        "time": frame.time,
        "blue": frame.blue,
        "yellow": frame.yellow
    }
