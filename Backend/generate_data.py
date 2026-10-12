"""
Spatial Playback & Telemetry - Demo Dataset & Simulation Generator
Generates high-fidelity spatial datasets with multi-agent coordinates,
telemetry attributes (speed, heading, altitude), and dynamic alerts.
"""

import json
import math
import os
import sys
from pathlib import Path

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    dlon = math.radians(lon2 - lon1)
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    y = math.sin(dlon) * math.cos(lat2_r)
    x = math.cos(lat1_r) * math.sin(lat2_r) - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(dlon)
    return (math.degrees(math.atan2(y, x)) + 360) % 360

def generate_basic_trajectory(output_path: Path):
    """Scenario 2: Single arterial transit corridor (10 frames)."""
    start_lat = 28.61
    start_lng = 77.21
    frames = []

    for t in range(10):
        lat = round(start_lat + 0.002 * t, 6)
        lng = round(start_lng + 0.002 * t, 6)
        blue = [{"lat": lat, "lng": lng}]
        yellow = []
        alerts = []

        if t == 2:
            yellow.append({"lat": 28.62, "lng": 77.22})
            alerts.append({
                "id": "alert-t2-1",
                "title": "Sensor Anomaly Alpha",
                "lat": 28.62,
                "lng": 77.22,
                "severity": "warning",
                "description": "Roadside sensor proximity trigger detected",
                "color": "#f59e0b"
            })

        if t == 3:
            yellow.append({"lat": 28.63, "lng": 77.23})
            alerts.append({
                "id": "alert-t3-1",
                "title": "Sensor Anomaly Beta",
                "lat": 28.63,
                "lng": 77.23,
                "severity": "warning",
                "description": "Secondary intersection sensor trigger",
                "color": "#f59e0b"
            })

        entities = [{
            "id": "alpha-1",
            "name": "Asset Alpha 1",
            "lat": lat,
            "lng": lng,
            "speed_kmh": 25.0,
            "heading_deg": 45.0,
            "altitude_m": 0.0,
            "color": "#00f0ff"
        }]

        frames.append({
            "time": t,
            "blue": blue,
            "yellow": yellow,
            "entities": entities,
            "alerts": alerts,
            "resolved": []
        })

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(frames, f, indent=2)
    print(f"  [OK] Generated {len(frames)} frames -> {output_path}")
    return frames

def generate_autonomous_fleet(output_path: Path):
    """Scenario 3: 3-agent autonomous fleet with road incidents (45 frames)."""
    center_lat = 28.6139
    center_lng = 77.2090
    total_steps = 45
    frames = []

    for t in range(total_steps):
        rad1 = t * (2 * math.pi / total_steps)
        lat1 = round(center_lat + 0.015 * math.sin(rad1), 6)
        lng1 = round(center_lng + 0.020 * math.cos(rad1), 6)
        deg1 = round((math.degrees(rad1) + 90) % 360, 1)

        rad2 = (t + 10) * (2 * math.pi / total_steps)
        lat2 = round(center_lat + 0.012 * math.cos(rad2 * 1.5), 6)
        lng2 = round(center_lng + 0.018 * math.sin(rad2), 6)
        deg2 = round(math.degrees(rad2) % 360, 1)

        lat3 = round(center_lat - 0.010 + 0.0006 * t, 6)
        lng3 = round(center_lng - 0.015 + 0.0008 * t, 6)
        deg3 = 55.0

        entities = [
            {
                "id": "courier-1",
                "name": "Fleet Unit 101",
                "lat": lat1,
                "lng": lng1,
                "speed_kmh": round(35.0 + 8.0 * math.sin(t * 0.5), 1),
                "heading_deg": deg1,
                "altitude_m": 0.0,
                "color": "#00f0ff"
            },
            {
                "id": "courier-2",
                "name": "Fleet Unit 102",
                "lat": lat2,
                "lng": lng2,
                "speed_kmh": round(42.0 + 5.0 * math.cos(t * 0.4), 1),
                "heading_deg": deg2,
                "altitude_m": 0.0,
                "color": "#a855f7"
            },
            {
                "id": "patrol-3",
                "name": "Patrol Cruiser 07",
                "lat": lat3,
                "lng": lng3,
                "speed_kmh": 48.0,
                "heading_deg": deg3,
                "altitude_m": 0.0,
                "color": "#10b981"
            }
        ]

        blue = [{"lat": lat1, "lng": lng1}, {"lat": lat2, "lng": lng2}, {"lat": lat3, "lng": lng3}]
        yellow = []
        alerts = []

        if 8 <= t <= 14:
            alerts.append({
                "id": f"alert-t{t}-congestion",
                "title": "Traffic Congestion",
                "lat": 28.618,
                "lng": 77.215,
                "severity": "warning",
                "description": "Heavy congestion detected near central circle",
                "color": "#f59e0b"
            })
            yellow.append({"lat": 28.618, "lng": 77.215})

        if 25 <= t <= 32:
            alerts.append({
                "id": f"alert-t{t}-hazard",
                "title": "Road Obstruction",
                "lat": 28.608,
                "lng": 77.225,
                "severity": "danger",
                "description": "Lane closure due to maintenance crew",
                "color": "#ef4444"
            })
            yellow.append({"lat": 28.608, "lng": 77.225})

        frames.append({
            "time": float(t),
            "blue": blue,
            "yellow": yellow,
            "entities": entities,
            "alerts": alerts,
            "resolved": []
        })

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(frames, f, indent=2)
    print(f"  [OK] Generated {len(frames)} frames -> {output_path}")
    return frames

def generate_drone_surveillance(output_path: Path):
    """Scenario 4: UAV Aerial Surveillance Drone (36 frames)."""
    center_lat = 28.625
    center_lng = 77.215
    total_steps = 36
    frames = []

    for t in range(total_steps):
        progress = t / (total_steps - 1)
        lat = round(center_lat - 0.020 + 0.040 * progress, 6)
        lng = round(center_lng + 0.015 * math.sin(progress * math.pi * 2), 6)
        alt = round(80.0 + 45.0 * math.sin(progress * math.pi), 1)
        speed = round(65.0 + 10.0 * math.cos(progress * math.pi * 3), 1)
        heading = round(25.0 + 20.0 * math.cos(progress * math.pi * 2), 1)

        drone = {
            "id": "uav-falcon",
            "name": "Surveillance Drone SkyFalcon",
            "lat": lat,
            "lng": lng,
            "speed_kmh": speed,
            "heading_deg": heading,
            "altitude_m": alt,
            "color": "#38bdf8"
        }

        alerts = []
        yellow = []
        if 12 <= t <= 20:
            alerts.append({
                "id": f"drone-geofence-{t}",
                "title": "Restricted Airspace Proximity",
                "lat": 28.628,
                "lng": 77.224,
                "severity": "danger",
                "description": "Flight path within 500m of helipad no-fly zone",
                "color": "#ef4444"
            })
            yellow.append({"lat": 28.628, "lng": 77.224})

        frames.append({
            "time": float(t),
            "blue": [{"lat": lat, "lng": lng}],
            "yellow": yellow,
            "entities": [drone],
            "alerts": alerts,
            "resolved": []
        })

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(frames, f, indent=2)
    print(f"  [OK] Generated {len(frames)} frames -> {output_path}")
    return frames

def sync_urban_clearance(src_path: Path, dest_paths: list):
    """Copies urban clearance scenario directly to destination paths."""
    if not src_path.exists():
        print(f"  [WARN] Source {src_path} not found")
        return
    with open(src_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for p in dest_paths:
        with open(p, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"  [OK] Synced {len(data)} frames -> {p}")

def main():
    root_dir = Path(__file__).resolve().parent.parent
    backend_dir = root_dir / "Backend"
    demo_dir = root_dir / "demo_data"
    frontend_public_demo = root_dir / "frontend" / "public" / "demo_data"

    demo_dir.mkdir(parents=True, exist_ok=True)
    frontend_public_demo.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("Spatial Playback & Telemetry - Demo Data Generator")
    print("==================================================")

    # 1. Urban clearance scenario
    src_urban = backend_dir / "app" / "data" / "urban_clearance_scenario.json"
    dest_urban_1 = demo_dir / "01_urban_clearance_mission.json"
    dest_urban_2 = frontend_public_demo / "01_urban_clearance_mission.json"
    sync_urban_clearance(src_urban, [dest_urban_1, dest_urban_2])

    # 2. Basic arterial route
    generate_basic_trajectory(backend_dir / "data.json")
    generate_basic_trajectory(demo_dir / "02_basic_arterial_route.json")
    generate_basic_trajectory(frontend_public_demo / "02_basic_arterial_route.json")

    # 3. Autonomous fleet
    generate_autonomous_fleet(demo_dir / "03_autonomous_multi_fleet.json")
    generate_autonomous_fleet(frontend_public_demo / "03_autonomous_multi_fleet.json")

    # 4. Drone surveillance
    generate_drone_surveillance(demo_dir / "04_aerial_drone_surveillance.json")
    generate_drone_surveillance(frontend_public_demo / "04_aerial_drone_surveillance.json")

    print("\nAll demo datasets generated & synced across repo!")
    print(f"Repository Demo Directory: {demo_dir}")
    print(f"Frontend Static Directory: {frontend_public_demo}")

if __name__ == "__main__":
    main()
