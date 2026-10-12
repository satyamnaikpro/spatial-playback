# 🛰️ Demo Spatial Datasets for Visualization

This directory contains pre-packaged, ready-to-visualize spatial telemetry datasets for the **Spatial Playback & Telemetry** platform.

Anyone cloning this repository can immediately visualize, inspect, or replay these missions either in the web application (with or without the backend) or via the FastAPI REST endpoints.

---

## 📂 Available Demo Datasets

| File Name | Mission / Scenario | Frames | Entities | Incidents / Alerts | Key Telemetry Attributes |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **[`01_urban_clearance_mission.json`](01_urban_clearance_mission.json)** | Urban Clearance Mission | 60 | 1 Patrol Unit | 12 Incidents & Resolved | Heading, Speed (km/h), Clearance milestones, GIF ground truth |
| **[`02_basic_arterial_route.json`](02_basic_arterial_route.json)** | Basic Arterial Route | 10 | 1 Asset | 2 Sensor triggers | Linear transit corridor, Proximity triggers at $t=2, 3$ |
| **[`03_autonomous_multi_fleet.json`](03_autonomous_multi_fleet.json)** | Autonomous Multi-Fleet | 45 | 3 Fleet Units | Traffic & Road Hazard | Multi-agent coordination, variable speed, dynamic curves |
| **[`04_aerial_drone_surveillance.json`](04_aerial_drone_surveillance.json)** | Aerial Drone Surveillance | 36 | 1 UAV Drone | No-fly Geofence Breach | 3D altitude profiles ($80\text{m} - 125\text{m}$), 65 km/h patrol |

---

## 📊 Dataset Specifications & Schemas

The playback engine accepts two compatible schema styles:

### 1. Full Telemetry Schema (Recommended)
Used across all demo files for full HUD telemetry, velocity vectors, altitude displays, and clearance tracking:
```json
[
  {
    "time": 0,
    "entities": [
      {
        "id": "patrol-1",
        "name": "Rapid Response Patrol",
        "lat": 28.617205,
        "lng": 77.194459,
        "speed_kmh": 42.0,
        "heading_deg": 45.0,
        "altitude_m": 0.0,
        "color": "#00f0ff"
      }
    ],
    "alerts": [
      {
        "id": "incident-1",
        "title": "Active Incident #1",
        "lat": 28.60636,
        "lng": 77.21782,
        "severity": "warning",
        "description": "Unresolved emergency dispatch at intersection",
        "color": "#f97316"
      }
    ],
    "resolved": [
      {
        "id": "cleared-0",
        "lat": 28.615,
        "lng": 77.201,
        "resolved_at_time": 0
      }
    ],
    "blue": [{ "lat": 28.617205, "lng": 77.194459 }],
    "yellow": [{ "lat": 28.60636, "lng": 77.21782 }]
  }
]
```

### 2. Lightweight Minimal Schema
The platform also natively supports basic coordinate arrays:
```json
[
  {
    "time": 0,
    "blue": [{ "lat": 28.61, "lng": 77.21 }],
    "yellow": []
  },
  {
    "time": 1,
    "blue": [{ "lat": 28.612, "lng": 77.212 }],
    "yellow": [{ "lat": 28.62, "lng": 77.22 }]
  }
]
```

---

## 🚀 How to Visualize Any Demo File

### Method 1: Instant 1-Click UI Preset (Recommended)
1. Launch the web application:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000).
3. Click the **Upload** button in the top right.
4. Under **"Quick Load Demo Presets"**, click on any scenario button:
   - *Urban Clearance Mission (60 frames)*
   - *Autonomous Multi-Fleet (45 frames)*
   - *Aerial Drone Surveillance (36 frames)*
   - *Basic Arterial Route (10 frames)*
5. The map and telemetry HUD will immediately animate the trajectory!

---

### Method 2: Drag & Drop or Upload a `.json` File
1. In the Web App, click **Upload**.
2. Click **"Upload .json file"**.
3. Select any file from the `demo_data/` folder (or your own custom file).
4. Click **Load Scenario**.

---

### Method 3: Via FastAPI REST Endpoint
If running the Python backend:
```bash
# Upload custom dataset via curl or Postman
curl -X POST http://127.0.0.1:8000/api/scenarios/custom \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Custom Run\", \"frames\": $(cat demo_data/02_basic_arterial_route.json)}"
```

---

## 🛠️ Regenerating or Adding New Demo Datasets

You can regenerate or extend all demo datasets by running:
```powershell
python Backend/generate_data.py
```
This updates both the repository `demo_data/` directory and the frontend static public folder.
