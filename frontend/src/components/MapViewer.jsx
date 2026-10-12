import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const TILE_PROVIDERS = {
  // Google Maps Style Street Map (Clean roads, transit, landmarks, zero watermark)
  street: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, METI, TomTom'
  },
  // OpenStreetMap standard
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  // Google Maps Satellite Imagery (Photorealistic, zero watermark)
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
  },
  // Google Maps Terrain / Topography (Contours, hillshading)
  terrain: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN'
  },
  // Clean Light Gray Canvas (No watermark)
  light: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  },
  // Google Maps Dark Gray Canvas (Clean night mode, no watermark)
  dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  }
};

export default function MapViewer({
  metadata,
  activeEntities = [],
  activeAlerts = [],
  resolvedPoints = [],
  historicalTrails = {},
  showTrails = true,
  showAlerts = true,
  showResolved = true,
  showLabels = true,
  showRangeRings = true,
  mapStyle = 'street',
  currentStepIndex = 0,
  cameraAction = null,
  sidebarOpen = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const trailLayerGroupRef = useRef(null);
  const entityLayerGroupRef = useRef(null);
  const alertLayerGroupRef = useRef(null);
  const resolvedLayerGroupRef = useRef(null);
  const rangeRingGroupRef = useRef(null);

  // 1. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = metadata?.center || [28.6139, 77.2090];
    const initialZoom = metadata?.default_zoom || 13;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false
    });

    // Google-style zoom controls in top-left corner
    L.control.zoom({ position: 'topleft' }).addTo(map);

    const tileCfg = TILE_PROVIDERS[mapStyle] || TILE_PROVIDERS.street;
    const tileLayer = L.tileLayer(tileCfg.url, {
      attribution: tileCfg.attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    trailLayerGroupRef.current = L.layerGroup().addTo(map);
    rangeRingGroupRef.current = L.layerGroup().addTo(map);
    resolvedLayerGroupRef.current = L.layerGroup().addTo(map);
    alertLayerGroupRef.current = L.layerGroup().addTo(map);
    entityLayerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle sidebar open/close resize
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      mapInstanceRef.current.invalidateSize();
    }, 280);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  // 3. Switch Tile Layer dynamically (Watermark-Free)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;
    const tileCfg = TILE_PROVIDERS[mapStyle] || TILE_PROVIDERS.street;

    map.removeLayer(tileLayerRef.current);
    const newTileLayer = L.tileLayer(tileCfg.url, {
      attribution: tileCfg.attribution,
      maxZoom: 19
    }).addTo(map);

    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // 4. Fit bounds when scenario metadata changes
  useEffect(() => {
    if (!mapInstanceRef.current || !metadata) return;
    const map = mapInstanceRef.current;

    if (metadata.bounds && metadata.bounds.length === 2) {
      try {
        map.fitBounds(metadata.bounds, { padding: [60, 60], maxZoom: 15 });
      } catch {
        if (metadata.center) map.setView(metadata.center, metadata.default_zoom || 13);
      }
    } else if (metadata.center) {
      map.setView(metadata.center, metadata.default_zoom || 13);
    }
  }, [metadata?.id]);

  // 5. Camera command dispatch (fit_bounds, follow asset, zoom, fly_to)
  useEffect(() => {
    if (!mapInstanceRef.current || !cameraAction) return;
    const map = mapInstanceRef.current;

    if (cameraAction.type === 'fit_bounds') {
      if (metadata?.bounds && metadata.bounds.length === 2) {
        map.fitBounds(metadata.bounds, { padding: [60, 60], maxZoom: 15, animate: true, duration: 0.8 });
      } else if (metadata?.center) {
        map.flyTo(metadata.center, metadata.default_zoom || 13, { duration: 0.8 });
      }
    } else if (cameraAction.type === 'center_entity') {
      if (activeEntities.length > 0) {
        const primary = activeEntities[0];
        map.flyTo([primary.lat, primary.lng], 15, { duration: 0.8 });
      }
    } else if (cameraAction.type === 'fly_to') {
      if (cameraAction.payload && cameraAction.payload.lat != null) {
        map.flyTo([cameraAction.payload.lat, cameraAction.payload.lng], cameraAction.payload.zoom || 15, { duration: 0.8 });
      }
    } else if (cameraAction.type === 'zoom_in') {
      map.zoomIn();
    } else if (cameraAction.type === 'zoom_out') {
      map.zoomOut();
    }
  }, [cameraAction]);

  // 6. Render Historical Breadcrumb Motion Trails
  useEffect(() => {
    if (!trailLayerGroupRef.current) return;
    const layer = trailLayerGroupRef.current;
    layer.clearLayers();

    if (!showTrails) return;

    Object.entries(historicalTrails).forEach(([entityId, points]) => {
      if (!points || points.length < 2) return;

      const entity = activeEntities.find(e => e.id === entityId);
      const color = entity?.color || '#1a73e8';

      // Outer glow line
      L.polyline(points, {
        color: color,
        weight: 6,
        opacity: 0.22,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layer);

      // Core crisp path
      L.polyline(points, {
        color: color,
        weight: 3,
        opacity: 0.9,
        dashArray: '6, 6',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layer);
    });
  }, [historicalTrails, showTrails, activeEntities]);

  // 7. Render Resolved Incident Checkpoint Markers (Green markers)
  useEffect(() => {
    if (!resolvedLayerGroupRef.current) return;
    const layer = resolvedLayerGroupRef.current;
    layer.clearLayers();

    if (!showResolved) return;

    resolvedPoints.forEach(res => {
      const color = res.color || '#1e8e3e';

      const iconHtml = `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="
            width: 22px; 
            height: 22px; 
            border-radius: 50%; 
            background: #ffffff; 
            border: 2px solid ${color}; 
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); 
            display: flex; 
            align-items: center; 
            justify-content: center;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
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
          <div style="font-weight: 700; color: #1e8e3e; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>✓</span> ${res.title || 'Cleared Incident'}
          </div>
          <div style="color: var(--text-muted); font-size: 11px;">
            Status: <b style="color: #1e8e3e;">Resolved & Verified</b>
          </div>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); margin-top: 4px;">
            ${res.lat.toFixed(5)}, ${res.lng.toFixed(5)}
          </div>
        </div>
      `);

      marker.addTo(layer);
    });
  }, [resolvedPoints, showResolved]);

  // 8. Render Dynamic Alerts & Hazard Markers (Google Traffic Incident Style)
  useEffect(() => {
    if (!alertLayerGroupRef.current) return;
    const layer = alertLayerGroupRef.current;
    layer.clearLayers();

    if (!showAlerts) return;

    activeAlerts.forEach(alert => {
      const color = alert.severity === 'danger' ? '#d93025' : '#ea8600';

      const iconHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div class="pulse-ring" style="position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 2px solid ${color}; background: rgba(234, 134, 0, 0.2);"></div>
          <div style="
            width: 22px; 
            height: 22px; 
            border-radius: 50%; 
            background: #ffffff; 
            border: 2px solid ${color}; 
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 11px; 
            font-weight: bold; 
            color: ${color};
          ">!</div>
        </div>
      `;

      const marker = L.marker([alert.lat, alert.lng], {
        icon: L.divIcon({
          className: 'custom-alert-icon',
          html: iconHtml,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        })
      });

      marker.bindPopup(`
        <div style="font-size: 12px; font-family: var(--font-sans);">
          <div style="font-weight: 700; color: ${color}; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>⚠️</span> ${alert.title}
          </div>
          <div style="color: var(--text-main); margin-bottom: 6px;">
            ${alert.description || 'Active dispatch event'}
          </div>
          <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);">
            ${alert.lat.toFixed(5)}, ${alert.lng.toFixed(5)}
          </div>
        </div>
      `);

      marker.addTo(layer);
    });
  }, [activeAlerts, showAlerts]);

  // 9. Render Moving Patrol Units with Heading Orientation & Range Rings
  useEffect(() => {
    if (!entityLayerGroupRef.current || !rangeRingGroupRef.current) return;
    const entityLayer = entityLayerGroupRef.current;
    const ringLayer = rangeRingGroupRef.current;
    entityLayer.clearLayers();
    ringLayer.clearLayers();

    activeEntities.forEach(entity => {
      const color = entity.color || '#1a73e8';
      const heading = entity.heading_deg || 0;

      // Range ring overlay
      if (showRangeRings) {
        L.circle([entity.lat, entity.lng], {
          radius: 350,
          color: color,
          weight: 1.5,
          opacity: 0.4,
          fillColor: color,
          fillOpacity: 0.06,
          dashArray: '5, 5'
        }).addTo(ringLayer);
      }

      const labelHtml = showLabels ? `
        <div style="
          position: absolute;
          bottom: -13px;
          white-space: nowrap;
          background: #ffffff;
          border: 1px solid #dadce0;
          color: #202124;
          padding: 1px 6px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 600;
          box-shadow: 0 1px 4px rgba(60,64,67,0.25);
        ">${entity.name || entity.id}</div>
      ` : '';

      const iconHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #ffffff;
            border: 2.5px solid ${color};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: rotate(${heading}deg);
            transition: transform 0.1s linear;
          ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${color}">
              <polygon points="12 2 22 21 12 17 2 21 12 2"/>
            </svg>
          </div>
          ${labelHtml}
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
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
            <div>Speed: <b style="color:var(--text-main);">${entity.speed_kmh} km/h</b></div>
            <div>Heading: <b style="color:var(--text-main);">${entity.heading_deg}°</b></div>
            <div>Altitude: <b style="color:var(--text-main);">${entity.altitude_m || 0}m</b></div>
            <div>Lat/Lng: <b style="color:var(--text-main);">${entity.lat.toFixed(4)}, ${entity.lng.toFixed(4)}</b></div>
          </div>
        </div>
      `);

      marker.addTo(entityLayer);
    });
  }, [activeEntities, showLabels, showRangeRings]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%', zIndex: 1 }} 
      />
    </div>
  );
}
