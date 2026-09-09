import { useState, useEffect, useRef, useCallback } from 'react';

function lerpAngle(a, b, t) {
  let diff = (b - a) % 360;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  return (a + diff * t + 360) % 360;
}

export function usePlayback() {
  const [scenarios, setScenarios] = useState([]);
  const [currentScenarioId, setCurrentScenarioId] = useState('urban-clearance');
  const [metadata, setMetadata] = useState(null);
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [loop, setLoop] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [mapStyle, setMapStyle] = useState('dark');

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

  // 1. Fetch scenario list on mount
  useEffect(() => {
    async function loadScenarios() {
      try {
        const res = await fetch('/api/scenarios');
        if (!res.ok) throw new Error('Failed to load scenarios');
        const list = await res.json();
        setScenarios(list);
        if (list.length > 0 && !list.find(s => s.id === currentScenarioId)) {
          setCurrentScenarioId(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching scenarios:', err);
        setError('Backend not connected or failed to respond');
      }
    }
    loadScenarios();
  }, []);

  // 2. Load metadata and frames when scenario changes
  useEffect(() => {
    if (!currentScenarioId) return;
    let isCancelled = false;
    setLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);

    async function loadScenarioData() {
      try {
        const [metaRes, framesRes] = await Promise.all([
          fetch(`/api/scenarios/${currentScenarioId}/metadata`),
          fetch(`/api/scenarios/${currentScenarioId}/frames`)
        ]);

        if (!metaRes.ok || !framesRes.ok) {
          throw new Error('Failed to fetch scenario data');
        }

        const metaData = await metaRes.json();
        const framesData = await framesRes.json();

        if (!isCancelled) {
          setMetadata(metaData);
          setFrames(framesData);
          setCurrentTime(0);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setError(`Could not load scenario ${currentScenarioId}`);
          setLoading(false);
        }
      }
    }

    loadScenarioData();
    return () => { isCancelled = true; };
  }, [currentScenarioId]);

  // 3. Animation loop for 60fps continuous playback interpolation
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
    setCurrentTime(t => Math.max(Math.ceil(t) - 1, 0));
  };

  // 4. Compute interpolated entities, active alerts, resolved points, and trails
  const totalFrames = frames.length;
  let activeEntities = [];
  let activeAlerts = [];
  let resolvedPoints = [];
  let historicalTrails = {};

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

    // Resolved points (Green X markers from GIF)
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
    reloadScenarios: async () => {
      const res = await fetch('/api/scenarios');
      if (res.ok) setScenarios(await res.json());
    }
  };
}
