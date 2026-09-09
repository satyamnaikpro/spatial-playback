import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const TILE_PROVIDERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

export default function MapViewer({
  metadata,
  activeEntities = [],
  activeAlerts = [],
  resolvedPoints = [],
  historicalTrails = {},
  showTrails = true,
  mapStyle = 'dark',
  currentStepIndex = 0
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const trailLayerGroupRef = useRef(null);
  const entityLayerGroupRef = useRef(null);
  const alertLayerGroupRef = useRef(null);
  const resolvedLayerGroupRef = useRef(null);

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = metadata?.center || [28.6139, 77.2090];
    const initialZoom = metadata?.default_zoom || 13;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileCfg = TILE_PROVIDERS[mapStyle] || TILE_PROVIDERS.dark;
    const tileLayer = L.tileLayer(tileCfg.url, {
      attribution: tileCfg.attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    trailLayerGroupRef.current = L.layerGroup().addTo(map);
    resolvedLayerGroupRef.current = L.layerGroup().addTo(map);
    alertLayerGroupRef.current = L.layerGroup().addTo(map);
    entityLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Tile Layer dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;
    const tileCfg = TILE_PROVIDERS[mapStyle] || TILE_PROVIDERS.dark;

    map.removeLayer(tileLayerRef.current);
    const newTileLayer = L.tileLayer(tileCfg.url, {
      attribution: tileCfg.attribution,
      maxZoom: 19
    }).addTo(map);

    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // 3. Fit bounds when scenario metadata changes
  useEffect(() => {
    if (!mapInstanceRef.current || !metadata) return;
    const map = mapInstanceRef.current;

    if (metadata.bounds && metadata.bounds.length === 2) {
      try {
        map.fitBounds(metadata.bounds, { padding: [60, 60], maxZoom: 15 });
      } catch (err) {
        if (metadata.center) map.setView(metadata.center, metadata.default_zoom || 13);
      }
    } else if (metadata.center) {
      map.setView(metadata.center, metadata.default_zoom || 13);
    }
  }, [metadata?.id]);

  // 4. Render Historical Breadcrumb Trails
  useEffect(() => {
    if (!trailLayerGroupRef.current) return;
    const layer = trailLayerGroupRef.current;
    layer.clearLayers();

    if (!showTrails) return;

    Object.entries(historicalTrails).forEach(([entityId, points]) => {
      if (!points || points.length < 2) return;

      const entity = activeEntities.find(e => e.id === entityId);
      const color = entity?.color || '#00f0ff';

      // Outer glow line
      L.polyline(points, {
        color: color,
        weight: 6,
        opacity: 0.25,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layer);

      // Core crisp path
      L.polyline(points, {
        color: color,
        weight: 2.5,
        opacity: 0.85,
        dashArray: '6, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layer);
    });
  }, [historicalTrails, showTrails, activeEntities]);

  // 5. Render Resolved / Cleared Incident Markers (Green "X" markers from GIF)
  useEffect(() => {
    if (!resolvedLayerGroupRef.current) return;
    const layer = resolvedLayerGroupRef.current;
    layer.clearLayers();

    resolvedPoints.forEach(res => {
      const color = res.color || '#10b981';

      const iconHtml = `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="
            width: 22px; 
            height: 22px; 
            border-radius: 6px; 
            background: rgba(16, 185, 129, 0.18); 
            border: 1.5px solid ${color}; 
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.35); 
            display: flex; 
            align-items: center; 
            justify-content: center;
          ">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>
      `;

      const marker = L.marker([res.lat, res.lng], {
        icon: L.divIcon({
          className: 'custom-resolved-icon',
          html: iconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      });

      marker.bindPopup(`
        <div style="font-size: 12px; font-family: var(--font-sans);">
          <div style="font-weight: 700; color: #10b981; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>✓</span> ${res.title || 'Cleared Incident'}
          </div>
          <div style="color: var(--text-muted); font-size: 11px;">
            Status: <b style="color: #10b981;">Resolved / Cleared</b>
          </div>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); margin-top: 4px;">
            ${res.lat.toFixed(5)}, ${res.lng.toFixed(5)}
          </div>
        </div>
      `);

      marker.addTo(layer);
    });
  }, [resolvedPoints]);

  // 6. Render Active Incidents / Alerts (Orange / Yellow pulsating markers)
  useEffect(() => {
    if (!alertLayerGroupRef.current) return;
    const layer = alertLayerGroupRef.current;
    layer.clearLayers();

    activeAlerts.forEach(alert => {
      const color = alert.severity === 'danger' ? '#ef4444' : '#f97316';

      const iconHtml = `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div class="pulse-ring" style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 2px solid ${color}; background: rgba(249, 115, 22, 0.2);"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2px solid #fff; box-shadow: 0 0 12px ${color}; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; color: #000;">!</div>
        </div>
      `;

      const marker = L.marker([alert.lat, alert.lng], {
        icon: L.divIcon({
          className: 'custom-alert-icon',
          html: iconHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        })
      });

      marker.bindPopup(`
        <div style="font-size: 12px; font-family: var(--font-sans);">
          <div style="font-weight: 700; color: ${color}; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>⚠️</span> ${alert.title}
          </div>
          <div style="color: var(--text-main); margin-bottom: 6px;">
            ${alert.description || 'Active dispatch alert'}
          </div>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);">
            ${alert.lat.toFixed(5)}, ${alert.lng.toFixed(5)}
          </div>
        </div>
      `);

      marker.addTo(layer);
    });
  }, [activeAlerts]);

  // 7. Render Moving Active Entities (Blue Patrol Unit with heading)
  useEffect(() => {
    if (!entityLayerGroupRef.current) return;
    const layer = entityLayerGroupRef.current;
    layer.clearLayers();

    activeEntities.forEach(entity => {
      const color = entity.color || '#00f0ff';
      const heading = entity.heading_deg || 0;

      const iconHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: ${color}; opacity: 0.25; filter: blur(4px);"></div>
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #090d16;
            border: 2px solid ${color};
            box-shadow: 0 0 10px ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(${heading}deg);
            transition: transform 0.1s linear;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${color}">
              <polygon points="12 2 22 21 12 17 2 21 12 2"/>
            </svg>
          </div>
          <div style="
            position: absolute;
            bottom: -10px;
            white-space: nowrap;
            background: rgba(9, 13, 22, 0.85);
            border: 1px solid ${color}66;
            color: #fff;
            padding: 1px 4px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
            font-family: var(--font-mono);
          ">${entity.name || entity.id}</div>
        </div>
      `;

      const marker = L.marker([entity.lat, entity.lng], {
        icon: L.divIcon({
          className: 'entity-marker-icon',
          html: iconHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        })
      });

      marker.bindPopup(`
        <div style="font-size: 12px; font-family: var(--font-sans);">
          <div style="font-weight: 700; color: ${color}; margin-bottom: 6px; font-size: 13px;">
            ${entity.name || entity.id}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-family: var(--font-mono); font-size: 11px;">
            <div>Speed: <b style="color:#fff;">${entity.speed_kmh} km/h</b></div>
            <div>Heading: <b style="color:#fff;">${entity.heading_deg}°</b></div>
            <div>Lat: <b style="color:#fff;">${entity.lat.toFixed(4)}</b></div>
            <div>Lng: <b style="color:#fff;">${entity.lng.toFixed(4)}</b></div>
          </div>
        </div>
      `);

      marker.addTo(layer);
    });
  }, [activeEntities]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Iconic Floating 'Time step: N' HUD badge (mirroring the GIF style) */}
      <div 
        className="glass-panel"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 998,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Time step:
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--accent-cyan)',
          minWidth: '24px'
        }}>
          {currentStepIndex}
        </span>
      </div>

      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', zIndex: 1 }} 
      />
    </div>
  );
}
