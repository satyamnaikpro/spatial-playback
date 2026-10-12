# Spatial Playback & Telemetry

A scalable, high-performance spatial playback and telemetry analysis platform built with **FastAPI** on the backend and **React 18 + Leaflet + Vite** on the frontend.

Designed to visualize dynamic motion trajectories, multi-agent coordinates, velocity vectors, heading orientation, 3D altitude profiles, and real-time hazard clearances.

---

## 🛰️ Demo Datasets for Visualization

Pre-packaged, ready-to-run demo datasets are included in the repository under [`demo_data/`](demo_data/) so anyone can immediately visualize and replay spatial telemetry missions:

| Demo Dataset | Frames | Entities & Assets | Incidents & Alerts | Use-Case Description |
| :--- | :---: | :---: | :---: | :--- |
| **[`01_urban_clearance_mission.json`](demo_data/01_urban_clearance_mission.json)** | 60 | 1 Patrol Unit | 12 Incidents & Resolved | Ground-truth simulation: Rapid response unit clearing dynamic incidents into green checkpoints |
| **[`02_basic_arterial_route.json`](demo_data/02_basic_arterial_route.json)** | 10 | 1 Asset | 2 Sensor triggers | Arterial corridor transit tracking with roadside sensor proximity alerts at $t=2, 3$ |
| **[`03_autonomous_multi_fleet.json`](demo_data/03_autonomous_multi_fleet.json)** | 45 | 3 Fleet Units | Traffic & Road Hazard | Multi-agent coordination (Courier 101, 102 & Patrol 07) with dynamic road congestion |
| **[`04_aerial_drone_surveillance.json`](demo_data/04_aerial_drone_surveillance.json)** | 36 | 1 UAV Drone | No-fly Geofence Alert | High-altitude UAV reconnaissance with 3D altitude telemetry ($80\text{m} - 125\text{m}$) |

👉 **Full dataset documentation & schemas**: [Read `demo_data/README.md`](demo_data/README.md)

---

## ⚡ Quick Start & Visualization

### Option A: 1-Click Launch (Both Frontend & Backend)
```powershell
powershell -ExecutionPolicy Bypass -File .\run.ps1
```

### Option B: Standalone Frontend (Visualizing Demo Data Without Backend)
Anyone can clone this repo and visualize the demo datasets immediately without Python or Uvicorn:
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Open **[http://localhost:3000](http://localhost:3000)**:
1. Select any demo scenario from the **Scenario dropdown** in the header.
2. Or click **Upload** $\rightarrow$ click any **Quick Load Demo Preset** button (e.g. *Urban Clearance Mission*, *Multi-Fleet*, *Drone Recon*).
3. The interactive map, continuous 60fps interpolation, telemetry HUD, and breadcrumb trails will run instantly!

---

### Option C: Manual Full-Stack Launch

#### 1. Backend (Terminal 1)
```powershell
cd Backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```
- API Health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Interactive Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Scenarios List: [http://127.0.0.1:8000/api/scenarios](http://127.0.0.1:8000/api/scenarios)

#### 2. Frontend (Terminal 2)
```powershell
cd frontend
npm.cmd run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Regenerating Demo Datasets

To regenerate all demo files or generate custom scenarios:
```powershell
python Backend/generate_data.py
```
This updates `Backend/data.json`, `demo_data/`, and the frontend static assets.

---

## 📖 Operational Runbook

For architectural deep-dives, API specifications, and troubleshooting:
👉 **[Read the Full Operations Runbook (RUNBOOK.md)](RUNBOOK.md)**