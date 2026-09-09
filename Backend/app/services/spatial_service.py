import json
import math
import os
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from ..models.schemas import (
    PlaybackFrame,
    EntityPoint,
    AlertPoint,
    ResolvedPoint,
    ScenarioMetadata,
    ScenarioSummary
)

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    dlon = math.radians(lon2 - lon1)
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    y = math.sin(dlon) * math.cos(lat2_r)
    x = math.cos(lat1_r) * math.sin(lat2_r) - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(dlon)
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360) % 360

class SpatialDataService:
    def __init__(self):
        self.scenarios: Dict[str, Dict] = {}
        self._load_urban_clearance_scenario()
        self._load_default_data()
        self._generate_urban_fleet_scenario()
        self._generate_drone_mission_scenario()

    def _load_urban_clearance_scenario(self):
        """Loads the 60-frame simulation extracted directly from 1765459103951.gif"""
        scenario_path = Path(__file__).resolve().parent.parent / "data" / "urban_clearance_scenario.json"
        if not scenario_path.exists():
            return

        try:
            with open(scenario_path, "r", encoding="utf-8") as f:
                raw_frames = json.load(f)

            frames: List[PlaybackFrame] = []
            for idx, rf in enumerate(raw_frames):
                entities: List[EntityPoint] = []
                for e_idx, e in enumerate(rf.get("entities", [])):
                    speed = 35.0
                    heading = 65.0
                    if idx > 0 and len(frames[idx - 1].entities) > e_idx:
                        prev = frames[idx - 1].entities[e_idx]
                        dist_km = haversine_distance_km(prev.lat, prev.lng, e["lat"], e["lng"])
                        speed = round(dist_km * 3600, 1)
                        if speed > 0.5:
                            heading = round(calculate_bearing(prev.lat, prev.lng, e["lat"], e["lng"]), 1)
                        else:
                            heading = prev.heading_deg

                    entities.append(EntityPoint(
                        id=e["id"],
                        name=e.get("name", "Patrol Unit 1"),
                        lat=e["lat"],
                        lng=e["lng"],
                        speed_kmh=speed,
                        heading_deg=heading,
                        altitude_m=0.0,
                        color=e.get("color", "#00f0ff")
                    ))

                alerts = [AlertPoint(**a) for a in rf.get("alerts", [])]
                resolved = [ResolvedPoint(**r) for r in rf.get("resolved", [])]

                frames.append(PlaybackFrame(
                    time=float(rf.get("time", idx)),
                    blue=rf.get("blue", []),
                    yellow=rf.get("yellow", []),
                    entities=entities,
                    alerts=alerts,
                    resolved=resolved
                ))

            metadata = self._compute_metadata(
                scenario_id="urban-clearance",
                name="Urban Incident Clearance (GIF Simulation)",
                description="60-frame simulation from user GIF: Patrol vehicle clearing dynamic incidents into resolved status across road network",
                frames=frames,
                interval_ms=500
            )

            self.scenarios["urban-clearance"] = {
                "metadata": metadata,
                "frames": frames
            }
        except Exception as err:
            print("Failed to load urban_clearance_scenario:", err)

    def _load_default_data(self):
        possible_paths = [
            Path(__file__).resolve().parent.parent.parent / "data.json",
            Path("data.json"),
            Path("Backend/data.json")
        ]
        
        raw_frames = []
        for p in possible_paths:
            if p.exists():
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        raw_frames = json.load(f)
                    break
                except Exception as e:
                    print(f"Error loading {p}: {e}")

        if not raw_frames:
            raw_frames = [
                {"time": 0, "blue": [{"lat": 28.61, "lng": 77.21}], "yellow": []},
                {"time": 1, "blue": [{"lat": 28.612, "lng": 77.212}], "yellow": []},
            ]

        frames: List[PlaybackFrame] = []
        for idx, rf in enumerate(raw_frames):
            time_val = float(rf.get("time", idx))
            blue_pts = rf.get("blue", [])
            yellow_pts = rf.get("yellow", [])

            entities: List[EntityPoint] = []
            for b_idx, b in enumerate(blue_pts):
                lat = float(b["lat"])
                lng = float(b["lng"])
                speed = 25.0
                heading = 45.0
                if idx > 0 and len(frames[idx - 1].entities) > b_idx:
                    prev = frames[idx - 1].entities[b_idx]
                    dist_km = haversine_distance_km(prev.lat, prev.lng, lat, lng)
                    speed = round(dist_km * 3600, 1)
                    heading = round(calculate_bearing(prev.lat, prev.lng, lat, lng), 1)

                entities.append(EntityPoint(
                    id=f"alpha-{b_idx + 1}",
                    name=f"Asset Alpha {b_idx + 1}",
                    lat=lat,
                    lng=lng,
                    speed_kmh=speed,
                    heading_deg=heading,
                    altitude_m=15.0,
                    color="#00f0ff"
                ))

            alerts: List[AlertPoint] = []
            for y_idx, y in enumerate(yellow_pts):
                alerts.append(AlertPoint(
                    id=f"alert-t{int(time_val)}-{y_idx}",
                    title=f"Incident Sensor #{y_idx + 1}",
                    lat=float(y["lat"]),
                    lng=float(y["lng"]),
                    severity="warning",
                    description="Proximity trigger detected in corridor",
                    color="#f59e0b"
                ))

            frames.append(PlaybackFrame(
                time=time_val,
                blue=blue_pts,
                yellow=yellow_pts,
                entities=entities,
                alerts=alerts,
                resolved=[]
            ))

        metadata = self._compute_metadata(
            scenario_id="default",
            name="Classic Spatial Route",
            description="Primary arterial playback tracking Delhi transit corridor",
            frames=frames,
            interval_ms=1000
        )

        self.scenarios["default"] = {
            "metadata": metadata,
            "frames": frames
        }

    def _generate_urban_fleet_scenario(self):
        frames: List[PlaybackFrame] = []
        center_lat = 28.6139
        center_lng = 77.2090
        total_steps = 45

        for t in range(total_steps):
            entities: List[EntityPoint] = []
            blue_legacy = []
            alerts: List[AlertPoint] = []
            yellow_legacy = []

            rad1 = t * (2 * math.pi / total_steps)
            lat1 = center_lat + 0.015 * math.sin(rad1)
            lng1 = center_lng + 0.020 * math.cos(rad1)
            deg1 = round((math.degrees(rad1) + 90) % 360, 1)

            rad2 = (t + 10) * (2 * math.pi / total_steps)
            lat2 = center_lat + 0.012 * math.cos(rad2 * 1.5)
            lng2 = center_lng + 0.018 * math.sin(rad2)
            deg2 = round(math.degrees(rad2) % 360, 1)

            lat3 = center_lat - 0.010 + 0.0006 * t
            lng3 = center_lng - 0.015 + 0.0008 * t
            deg3 = 55.0

            entities.append(EntityPoint(
                id="courier-1",
                name="Fleet Unit 101",
                lat=round(lat1, 6),
                lng=round(lng1, 6),
                speed_kmh=round(35.0 + 8.0 * math.sin(t * 0.5), 1),
                heading_deg=deg1,
                altitude_m=0.0,
                color="#00f0ff"
            ))
            blue_legacy.append({"lat": round(lat1, 6), "lng": round(lng1, 6)})

            entities.append(EntityPoint(
                id="courier-2",
                name="Fleet Unit 102",
                lat=round(lat2, 6),
                lng=round(lng2, 6),
                speed_kmh=round(42.0 + 5.0 * math.cos(t * 0.4), 1),
                heading_deg=deg2,
                altitude_m=0.0,
                color="#a855f7"
            ))

            entities.append(EntityPoint(
                id="patrol-3",
                name="Patrol Cruiser 07",
                lat=round(lat3, 6),
                lng=round(lng3, 6),
                speed_kmh=48.0,
                heading_deg=deg3,
                altitude_m=0.0,
                color="#10b981"
            ))

            if 8 <= t <= 14:
                alerts.append(AlertPoint(
                    id=f"alert-t{t}-congestion",
                    title="Traffic Congestion",
                    lat=28.618,
                    lng=77.215,
                    severity="warning",
                    description="Heavy congestion near central circle",
                    color="#f59e0b"
                ))
                yellow_legacy.append({"lat": 28.618, "lng": 77.215})

            if 25 <= t <= 32:
                alerts.append(AlertPoint(
                    id=f"alert-t{t}-hazard",
                    title="Road Obstruction",
                    lat=28.608,
                    lng=77.225,
                    severity="danger",
                    description="Lane closure due to maintenance",
                    color="#ef4444"
                ))
                yellow_legacy.append({"lat": 28.608, "lng": 77.225})

            frames.append(PlaybackFrame(
                time=float(t),
                blue=blue_legacy,
                yellow=yellow_legacy,
                entities=entities,
                alerts=alerts,
                resolved=[]
            ))

        metadata = self._compute_metadata(
            scenario_id="fleet-patrol",
            name="Autonomous Urban Fleet",
            description="Multi-agent telemetry tracking 3 automated courier and patrol units with dynamic road incidents",
            frames=frames,
            interval_ms=800
        )

        self.scenarios["fleet-patrol"] = {
            "metadata": metadata,
            "frames": frames
        }

    def _generate_drone_mission_scenario(self):
        frames: List[PlaybackFrame] = []
        center_lat = 28.625
        center_lng = 77.215
        total_steps = 36

        for t in range(total_steps):
            progress = t / (total_steps - 1)
            lat = center_lat - 0.020 + 0.040 * progress
            lng = center_lng + 0.015 * math.sin(progress * math.pi * 2)
            alt = 80.0 + 45.0 * math.sin(progress * math.pi)
            speed = 65.0 + 10.0 * math.cos(progress * math.pi * 3)
            heading = 25.0 + 20.0 * math.cos(progress * math.pi * 2)

            entities = [
                EntityPoint(
                    id="uav-falcon",
                    name="Surveillance Drone SkyFalcon",
                    lat=round(lat, 6),
                    lng=round(lng, 6),
                    speed_kmh=round(speed, 1),
                    heading_deg=round(heading, 1),
                    altitude_m=round(alt, 1),
                    color="#38bdf8"
                )
            ]

            alerts = []
            yellow_legacy = []
            if 12 <= t <= 20:
                alerts.append(AlertPoint(
                    id=f"drone-geofence-{t}",
                    title="Restricted Airspace Proximity",
                    lat=28.628,
                    lng=77.224,
                    severity="danger",
                    description="Flight path within 500m of helipad no-fly zone",
                    color="#ef4444"
                ))
                yellow_legacy.append({"lat": 28.628, "lng": 77.224})

            frames.append(PlaybackFrame(
                time=float(t),
                blue=[{"lat": round(lat, 6), "lng": round(lng, 6)}],
                yellow=yellow_legacy,
                entities=entities,
                alerts=alerts,
                resolved=[]
            ))

        metadata = self._compute_metadata(
            scenario_id="drone-recon",
            name="Drone Air Reconnaissance",
            description="High-altitude UAV reconnaissance route with 3D altitude telemetry and geofence monitoring",
            frames=frames,
            interval_ms=750
        )

        self.scenarios["drone-recon"] = {
            "metadata": metadata,
            "frames": frames
        }

    def _compute_metadata(self, scenario_id: str, name: str, description: str, frames: List[PlaybackFrame], interval_ms: int) -> ScenarioMetadata:
        if not frames:
            return ScenarioMetadata(
                id=scenario_id,
                name=name,
                description=description,
                total_frames=0,
                duration_seconds=0.0,
                default_step_interval_ms=interval_ms,
                center=[28.61, 77.21],
                default_zoom=13,
                bounds=[[28.6, 77.2], [28.62, 77.22]],
                total_entities=0,
                total_alerts=0,
                total_resolved=0
            )

        all_lats = []
        all_lngs = []
        unique_entity_ids = set()
        total_alerts = 0
        total_resolved = 0

        for f in frames:
            for e in f.entities:
                all_lats.append(e.lat)
                all_lngs.append(e.lng)
                unique_entity_ids.add(e.id)
            for a in f.alerts:
                all_lats.append(a.lat)
                all_lngs.append(a.lng)
                total_alerts += 1
            for r in f.resolved:
                all_lats.append(r.lat)
                all_lngs.append(r.lng)
                total_resolved += 1

        min_lat = min(all_lats) if all_lats else 28.61
        max_lat = max(all_lats) if all_lats else 28.61
        min_lng = min(all_lngs) if all_lngs else 77.21
        max_lng = max(all_lngs) if all_lngs else 77.21

        center_lat = (min_lat + max_lat) / 2
        center_lng = (min_lng + max_lng) / 2

        pad_lat = max((max_lat - min_lat) * 0.15, 0.005)
        pad_lng = max((max_lng - min_lng) * 0.15, 0.005)

        return ScenarioMetadata(
            id=scenario_id,
            name=name,
            description=description,
            total_frames=len(frames),
            duration_seconds=round((len(frames) * interval_ms) / 1000.0, 1),
            default_step_interval_ms=interval_ms,
            center=[round(center_lat, 6), round(center_lng, 6)],
            default_zoom=13,
            bounds=[
                [round(min_lat - pad_lat, 6), round(min_lng - pad_lng, 6)],
                [round(max_lat + pad_lat, 6), round(max_lng + pad_lng, 6)]
            ],
            total_entities=len(unique_entity_ids),
            total_alerts=total_alerts,
            total_resolved=total_resolved
        )

    def get_all_scenarios(self) -> List[ScenarioSummary]:
        summaries = []
        for s_id, s_data in self.scenarios.items():
            meta: ScenarioMetadata = s_data["metadata"]
            summaries.append(ScenarioSummary(
                id=meta.id,
                name=meta.name,
                description=meta.description,
                total_frames=meta.total_frames,
                center=meta.center
            ))
        return summaries

    def get_metadata(self, scenario_id: str) -> Optional[ScenarioMetadata]:
        scen = self.scenarios.get(scenario_id)
        return scen["metadata"] if scen else None

    def get_frames(self, scenario_id: str, start: int = 0, limit: Optional[int] = None) -> Optional[List[PlaybackFrame]]:
        scen = self.scenarios.get(scenario_id)
        if not scen:
            return None
        frames: List[PlaybackFrame] = scen["frames"]
        if limit is None:
            return frames[start:]
        return frames[start:start + limit]

    def get_frame_by_time(self, scenario_id: str, t: int) -> Optional[PlaybackFrame]:
        scen = self.scenarios.get(scenario_id)
        if not scen:
            return None
        frames: List[PlaybackFrame] = scen["frames"]
        if not frames:
            return None
        idx = t % len(frames)
        return frames[idx]

    def register_custom_scenario(self, name: str, description: str, raw_frames: list) -> ScenarioMetadata:
        scenario_id = f"custom-{len(self.scenarios) + 1}"
        frames: List[PlaybackFrame] = []
        for idx, rf in enumerate(raw_frames):
            time_val = float(rf.get("time", idx))
            blue_pts = rf.get("blue", [])
            yellow_pts = rf.get("yellow", [])
            entities = []
            for b_idx, b in enumerate(blue_pts):
                entities.append(EntityPoint(
                    id=f"custom-ent-{b_idx+1}",
                    name=f"Entity {b_idx+1}",
                    lat=float(b["lat"]),
                    lng=float(b["lng"]),
                    speed_kmh=30.0,
                    heading_deg=0.0,
                    altitude_m=0.0,
                    color="#38bdf8"
                ))
            alerts = []
            for y_idx, y in enumerate(yellow_pts):
                alerts.append(AlertPoint(
                    id=f"custom-alert-{idx}-{y_idx}",
                    title="Alert Event",
                    lat=float(y["lat"]),
                    lng=float(y["lng"]),
                    severity="warning",
                    color="#f59e0b"
                ))
            frames.append(PlaybackFrame(
                time=time_val,
                blue=blue_pts,
                yellow=yellow_pts,
                entities=entities,
                alerts=alerts,
                resolved=[]
            ))

        metadata = self._compute_metadata(scenario_id, name, description, frames, 1000)
        self.scenarios[scenario_id] = {
            "metadata": metadata,
            "frames": frames
        }
        return metadata

spatial_service = SpatialDataService()
