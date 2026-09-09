from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class Coordinate(BaseModel):
    lat: float
    lng: float

class EntityPoint(BaseModel):
    id: str = Field(default="entity-1", description="Unique entity identifier")
    name: Optional[str] = Field(default="Asset", description="Entity display name")
    lat: float
    lng: float
    speed_kmh: Optional[float] = Field(default=0.0, description="Speed in km/h")
    heading_deg: Optional[float] = Field(default=0.0, description="Bearing angle 0-360")
    altitude_m: Optional[float] = Field(default=0.0, description="Altitude in meters")
    color: str = Field(default="#00f0ff", description="Display color hex")

class AlertPoint(BaseModel):
    id: str = Field(default="alert-1")
    title: str = Field(default="Spatial Alert")
    lat: float
    lng: float
    severity: str = Field(default="warning", description="info, warning, danger")
    description: Optional[str] = None
    color: str = Field(default="#f59e0b")

class ResolvedPoint(BaseModel):
    id: str = Field(default="resolved-1")
    title: str = Field(default="Resolved Incident")
    lat: float
    lng: float
    color: str = Field(default="#10b981")
    resolved_at_step: Optional[int] = None

class PlaybackFrame(BaseModel):
    time: float = Field(description="Normalized timestep or epoch")
    # Backward compatibility with existing fields:
    blue: List[Dict[str, float]] = Field(default_factory=list, description="Legacy blue points")
    yellow: List[Dict[str, float]] = Field(default_factory=list, description="Legacy yellow points")
    # Modern rich models:
    entities: List[EntityPoint] = Field(default_factory=list, description="Rich tracking entities")
    alerts: List[AlertPoint] = Field(default_factory=list, description="Active alerts/incidents")
    resolved: List[ResolvedPoint] = Field(default_factory=list, description="Resolved/cleared incidents")

class ScenarioMetadata(BaseModel):
    id: str
    name: str
    description: str
    total_frames: int
    duration_seconds: float
    default_step_interval_ms: int = 1000
    center: List[float] = Field(description="[lat, lng] map center")
    default_zoom: int = 13
    bounds: List[List[float]] = Field(description="[[min_lat, min_lng], [max_lat, max_lng]]")
    total_entities: int
    total_alerts: int
    total_resolved: int = 0

class ScenarioSummary(BaseModel):
    id: str
    name: str
    description: str
    total_frames: int
    center: List[float]
