import { useState, useEffect, useRef, useCallback } from 'react';

function lerpAngle(a, b, t) {
  let diff = (b - a) % 360;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  return (a + diff * t + 360) % 360;
}

export const DEMO_PRESETS = [
  {
    id: 'urban-clearance',
    name: 'Urban Incident Clearance (GIF Simulation)',
    description: '60-frame simulation from user GIF: Patrol vehicle clearing dynamic incidents into resolved status',
    file: '/demo_data/01_urban_clearance_mission.json',
    total_frames: 60,
    center: [28.617, 77.194]
  },
  {
    id: 'fleet-patrol',
    name: 'Autonomous Urban Fleet',
    description: '45-frame multi-agent telemetry tracking 3 automated units with congestion & road hazards',
    file: '/demo_data/03_autonomous_multi_fleet.json',
    total_frames: 45,
    center: [28.6139, 77.209]
  },
  {
    id: 'drone-recon',
    name: 'Drone Air Reconnaissance',
    description: '36-frame UAV reconnaissance route with 3D altitude telemetry and geofence monitoring',
    file: '/demo_data/04_aerial_drone_surveillance.json',
    total_frames: 36,
    center: [28.625, 77.215]
  },
  {
    id: 'default',
    name: 'Classic Arterial Route',
    description: '10-frame arterial corridor tracking with roadside proximity alerts',
    file: '/demo_data/02_basic_arterial_route.json',
    total_frames: 10,
    center: [28.61, 77.21]
  }
];

function computeLocalMetadata(scenarioId, name, description, frames, intervalMs = 800) {
  if (!frames || frames.length === 0) {
    return {
      id: scenarioId,
      name,
      description,
      total_frames: 0,
      duration_seconds: 0.0,
      default_step_interval_ms: intervalMs,
      center: [28.61, 77.21],
      default_zoom: 13,
      bounds: [[28.6, 77.2], [28.62, 77.22]],
      total_entities: 0,
      total_alerts: 0,
      total_resolved: 0
    };
  }

  const allLats = [];
  const allLngs = [];
  const uniqueEntities = new Set();
  let totalAlerts = 0;
  let totalResolved = 0;

  frames.forEach(f => {
    (f.entities || []).forEach(e => {
      allLats.push(e.lat);
      allLngs.push(e.lng);
      uniqueEntities.add(e.id);
    });
    (f.alerts || []).forEach(a => {
      allLats.push(a.lat);
      allLngs.push(a.lng);
      totalAlerts++;
    });
    (f.resolved || []).forEach(r => {
      allLats.push(r.lat);
      allLngs.push(r.lng);
      totalResolved++;
    });

    if (!f.entities || f.entities.length === 0) {
      (f.blue || []).forEach(b => {
        allLats.push(b.lat);
        allLngs.push(b.lng);
        uniqueEntities.add('blue-1');
      });
      (f.yellow || []).forEach(y => {
        allLats.push(y.lat);
        allLngs.push(y.lng);
        totalAlerts++;
      });
    }
  });

  const minLat = allLats.length ? Math.min(...allLats) : 28.61;
  const maxLat = allLats.length ? Math.max(...allLats) : 28.61;
  const minLng = allLngs.length ? Math.min(...allLngs) : 77.21;
  const maxLng = allLngs.length ? Math.max(...allLngs) : 77.21;
  const center = [Number(((minLat + maxLat) / 2).toFixed(6)), Number(((minLng + maxLng) / 2).toFixed(6))];
  const padLat = Math.max((maxLat - minLat) * 0.15, 0.005);
  const padLng = Math.max((maxLng - minLng) * 0.15, 0.005);

  return {
    id: scenarioId,
    name,
    description,
    total_frames: frames.length,
    duration_seconds: Number(((frames.length * intervalMs) / 1000).toFixed(1)),
    default_step_interval_ms: intervalMs,
    center,
    default_zoom: 13,
    bounds: [
      [Number((minLat - padLat).toFixed(6)), Number((minLng - padLng).toFixed(6))],
      [Number((maxLat + padLat).toFixed(6)), Number((maxLng + padLng).toFixed(6))]
    ],
    total_entities: uniqueEntities.size || 1,
    total_alerts: totalAlerts,
    total_resolved: totalResolved
  };
}

export function usePlayback() {
  const [scenarios, setScenarios] = useState(DEMO_PRESETS);
  const [currentScenarioId, setCurrentScenarioId] = useState('urban-clearance');
  const [metadata, setMetadata] = useState(null);
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  // In-memory cache for loaded/custom scenarios
  const customStoreRef = useRef({});

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [loop, setLoop] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [mapStyle, setMapStyle] = useState('street');

  const animFrameRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const loopRef = useRef(loop);
  const currentTimeRef = useRef(currentTime);
  const framesRef = useRef(frames);
  const metadataRef = useRef(metadata);

  isPlayingRef.current = isPlaying;
  speedRef.current = speed;
  loopRef.current = loop;
  currentTimeRef.current = currentTime;
  framesRef.current = frames;
  metadataRef.current = metadata;

  // 1. Fetch scenario list on mount, fallback gracefully to DEMO_PRESETS if backend is not running
  const reloadScenarios = useCallback(async () => {
    try {
      const res = await fetch('/api/scenarios');
      if (!res.ok) throw new Error('API returned non-200');
      const list = await res.json();
      setIsLiveBackend(true);
      setScenarios(list);
      if (list.length > 0 && !list.find(s => s.id === currentScenarioId)) {
        setCurrentScenarioId(list[0].id);
      }
    } catch {
      setIsLiveBackend(false);
      setScenarios(DEMO_PRESETS);
    }
  }, [currentScenarioId]);

  useEffect(() => {
    reloadScenarios();
  }, [reloadScenarios]);

  // 2. Load metadata and frames when scenario changes
  useEffect(() => {
    if (!currentScenarioId) return;
    let isCancelled = false;
    setLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);

    async function loadScenarioData() {
      // Check in-memory custom scenario store first
      if (customStoreRef.current[currentScenarioId]) {
        const stored = customStoreRef.current[currentScenarioId];
        if (!isCancelled) {
          setMetadata(stored.metadata);
          setFrames(stored.frames);
          setCurrentTime(0);
          setLoading(false);
          setError(null);
        }
        return;
      }

      // If backend is active, attempt fetching from API
      if (isLiveBackend) {
        try {
          const [metaRes, framesRes] = await Promise.all([
            fetch(`/api/scenarios/${currentScenarioId}/metadata`),
            fetch(`/api/scenarios/${currentScenarioId}/frames`)
          ]);

          if (metaRes.ok && framesRes.ok) {
            const metaData = await metaRes.json();
            const framesData = await framesRes.json();

            if (!isCancelled) {
              setMetadata(metaData);
              setFrames(framesData);
              setCurrentTime(0);
              setLoading(false);
              setError(null);
            }
            return;
          }
        } catch {
          // Fall through to static demo file loader
        }
      }

      // Static Demo File fallback
      const demoPreset = DEMO_PRESETS.find(p => p.id === currentScenarioId);
      const filePath = demoPreset ? demoPreset.file : `/demo_data/${currentScenarioId}.json`;

      try {
        const fileRes = await fetch(filePath);
        if (!fileRes.ok) throw new Error(`Could not load static file ${filePath}`);
        const framesData = await fileRes.json();

        // Ensure legacy format frames are normalized with entities
        const normalizedFrames = framesData.map((rf, idx) => {
          let entities = rf.entities || [];
          if (entities.length === 0 && rf.blue && rf.blue.length > 0) {
            entities = rf.blue.map((b, bIdx) => ({
              id: `entity-${bIdx + 1}`,
              name: `Asset ${bIdx + 1}`,
              lat: b.lat,
              lng: b.lng,
              speed_kmh: 30.0,
              heading_deg: 45.0,
              altitude_m: 0.0,
              color: '#00f0ff'
            }));
          }
          return {
            ...rf,
            entities,
            alerts: rf.alerts || [],
            resolved: rf.resolved || []
          };
        });

        const metaData = computeLocalMetadata(
          currentScenarioId,
          demoPreset ? demoPreset.name : currentScenarioId,
          demoPreset ? demoPreset.description : 'Demo Trajectory',
          normalizedFrames
        );

        if (!isCancelled) {
          setMetadata(metaData);
          setFrames(normalizedFrames);
          setCurrentTime(0);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading scenario:', err);
          setError(`Could not load scenario ${currentScenarioId}`);
          setLoading(false);
        }
      }
    }

    loadScenarioData();
    return () => { isCancelled = true; };
  }, [currentScenarioId, isLiveBackend]);

  // 3. Register custom uploaded scenario (works both online with FastAPI or offline client-side)
  const registerCustomScenario = useCallback(async (name, description, rawFrames) => {
    // Try FastAPI if online
    if (isLiveBackend) {
      try {
        const res = await fetch('/api/scenarios/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, frames: rawFrames })
        });
        if (res.ok) {
          const newScenario = await res.json();
          await reloadScenarios();
          setCurrentScenarioId(newScenario.id);
          return newScenario.id;
        }
      } catch {
        // Fall back to local registration
      }
    }

    // Local client-side registration
    const newId = `custom-${Date.now().toString(36)}`;
    const normalizedFrames = rawFrames.map((rf, idx) => {
      let entities = rf.entities || [];
      if (entities.length === 0 && rf.blue && rf.blue.length > 0) {
        entities = rf.blue.map((b, bIdx) => ({
          id: `custom-ent-${bIdx + 1}`,
          name: `Custom Entity ${bIdx + 1}`,
          lat: b.lat,
          lng: b.lng,
          speed_kmh: 35.0,
          heading_deg: 0.0,
          altitude_m: 0.0,
          color: '#38bdf8'
        }));
      }
      return {
        time: rf.time != null ? rf.time : idx,
        blue: rf.blue || [],
        yellow: rf.yellow || [],
        entities,
        alerts: rf.alerts || [],
        resolved: rf.resolved || []
      };
    });

    const localMeta = computeLocalMetadata(newId, name, description, normalizedFrames);

    customStoreRef.current[newId] = {
      metadata: localMeta,
      frames: normalizedFrames
    };

    setScenarios(prev => [
      ...prev,
      {
        id: newId,
        name,
        description,
        total_frames: normalizedFrames.length,
        center: localMeta.center
      }
    ]);

    setCurrentScenarioId(newId);
    return newId;
  }, [isLiveBackend, reloadScenarios]);

  // 4. Animation loop for 60fps continuous playback interpolation
  const stepAnimation = useCallback((timestamp) => {
    if (!isPlayingRef.current) return;

    if (lastTimestampRef.current === null) {
      lastTimestampRef.current = timestamp;
    }

    const deltaMs = timestamp - lastTimestampRef.current;
    lastTimestampRef.current = timestamp;

    const totalFrames = framesRef.current.length;
    if (totalFrames <= 1) {
      setIsPlaying(false);
      return;
    }

    const baseInterval = metadataRef.current?.default_step_interval_ms || 1000;
    const advance = (deltaMs / baseInterval) * speedRef.current;
    let nextTime = currentTimeRef.current + advance;

    const maxTime = totalFrames - 1;

    if (nextTime >= maxTime) {
      if (loopRef.current) {
        nextTime = nextTime % maxTime;
      } else {
        nextTime = maxTime;
        setIsPlaying(false);
      }
    }

    setCurrentTime(nextTime);
    animFrameRef.current = requestAnimationFrame(stepAnimation);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      lastTimestampRef.current = null;
      animFrameRef.current = requestAnimationFrame(stepAnimation);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      lastTimestampRef.current = null;
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, stepAnimation]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying(p => !p);

  const reset = () => {
    pause();
    setCurrentTime(0);
  };

  const seek = (time) => {
    const totalFrames = frames.length;
    if (totalFrames === 0) return;
    const clamped = Math.max(0, Math.min(time, totalFrames - 1));
    setCurrentTime(clamped);
  };

  const stepForward = () => {
    pause();
    const totalFrames = frames.length;
    if (totalFrames === 0) return;
    setCurrentTime(t => Math.min(Math.floor(t) + 1, totalFrames - 1));
  };

  const stepBackward = () => {
    pause();
    const totalFrames = frames.length;
    if (totalFrames === 0) return;
    setCurrentTime(t => Math.max(Math.ceil(t) - 1, 0));
  };

  // 5. Compute interpolated entities, alerts, resolved points, and trails
  const totalFrames = frames.length;
  let activeEntities = [];
  let activeAlerts = [];
  let resolvedPoints = [];
  const historicalTrails = {};

  if (totalFrames > 0) {
    const floorIdx = Math.floor(currentTime);
    const ceilIdx = Math.min(floorIdx + 1, totalFrames - 1);
    const fraction = currentTime - floorIdx;

    const frame0 = frames[floorIdx] || frames[0];
    const frame1 = frames[ceilIdx] || frame0;

    // Build historical trails up to floorIdx
    const trailStartIdx = Math.max(0, floorIdx - 35);
    for (let i = trailStartIdx; i <= floorIdx; i++) {
      const f = frames[i];
      if (f && f.entities) {
        f.entities.forEach(e => {
          if (!historicalTrails[e.id]) historicalTrails[e.id] = [];
          historicalTrails[e.id].push([e.lat, e.lng]);
        });
      }
    }

    // Interpolate entity positions
    if (frame0 && frame0.entities) {
      activeEntities = frame0.entities.map(e0 => {
        const e1 = frame1.entities ? frame1.entities.find(e => e.id === e0.id) : null;
        if (!e1 || floorIdx === ceilIdx || fraction === 0) {
          if (historicalTrails[e0.id]) {
            historicalTrails[e0.id].push([e0.lat, e0.lng]);
          }
          return { ...e0 };
        }

        const lat = e0.lat + (e1.lat - e0.lat) * fraction;
        const lng = e0.lng + (e1.lng - e0.lng) * fraction;
        const speed_kmh = e0.speed_kmh != null && e1.speed_kmh != null
          ? e0.speed_kmh + (e1.speed_kmh - e0.speed_kmh) * fraction
          : e0.speed_kmh;
        const heading_deg = e0.heading_deg != null && e1.heading_deg != null
          ? lerpAngle(e0.heading_deg, e1.heading_deg, fraction)
          : e0.heading_deg;
        const altitude_m = e0.altitude_m != null && e1.altitude_m != null
          ? e0.altitude_m + (e1.altitude_m - e0.altitude_m) * fraction
          : e0.altitude_m;

        if (historicalTrails[e0.id]) {
          historicalTrails[e0.id].push([lat, lng]);
        }

        return {
          ...e0,
          lat,
          lng,
          speed_kmh: Number(speed_kmh.toFixed(1)),
          heading_deg: Number(heading_deg.toFixed(1)),
          altitude_m: Number(altitude_m.toFixed(1))
        };
      });
    }

    // Active incidents / alerts
    activeAlerts = frame0.alerts || [];

    // Resolved points
    resolvedPoints = frame0.resolved || [];
  }

  const totalIncidents = activeAlerts.length + resolvedPoints.length;
  const clearanceRate = totalIncidents > 0 
    ? Math.round((resolvedPoints.length / totalIncidents) * 100) 
    : 100;

  return {
    scenarios,
    currentScenarioId,
    setCurrentScenarioId,
    metadata,
    frames,
    totalFrames,
    currentTime,
    currentStepIndex: Math.floor(currentTime),
    isPlaying,
    speed,
    loop,
    showTrails,
    mapStyle,
    loading,
    error,
    isLiveBackend,
    activeEntities,
    activeAlerts,
    resolvedPoints,
    clearanceRate,
    historicalTrails,
    // Actions
    play,
    pause,
    togglePlay,
    reset,
    seek,
    stepForward,
    stepBackward,
    setSpeed,
    setLoop,
    setShowTrails,
    setMapStyle,
    reloadScenarios,
    registerCustomScenario
  };
}
