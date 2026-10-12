import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Eye, 
  EyeOff, 
  Compass, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Crosshair, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  UploadCloud, 
  FolderOpen, 
  Sliders, 
  Activity, 
  ShieldCheck, 
  Car, 
  Tag, 
  CircleDot, 
  Map 
} from 'lucide-react';

const MAP_STYLES = [
  { id: 'street', name: 'Street Map', desc: 'Standard Road Map with Landmarks', icon: '🗺️' },
  { id: 'light', name: 'Positron Light', desc: 'Clean Minimal Light Gray Canvas', icon: '☀️' },
  { id: 'satellite', name: 'Satellite Imagery', desc: 'Photorealistic High-Res Imagery', icon: '🛰️' },
  { id: 'terrain', name: 'Topographic', desc: 'Elevation Contours & Hillshades', icon: '🏔️' },
  { id: 'dark', name: 'Dark Mode Map', desc: 'Sleek Night Navigation Vector', icon: '🌑' }
];

export default function Sidebar({
  isOpen,
  theme = 'light',
  onToggleOpen,
  mapStyle,
  onSelectMapStyle,
  showTrails,
  onToggleTrails,
  showAlerts,
  onToggleAlerts,
  showResolved,
  onToggleResolved,
  showLabels,
  onToggleLabels,
  showRangeRings,
  onToggleRangeRings,
  scenarios = [],
  currentScenarioId,
  onSelectScenario,
  activeEntities = [],
  activeAlerts = [],
  resolvedPoints = [],
  onCameraAction,
  onOpenUpload,
  metadata
}) {
  const [activeTab, setActiveTab] = useState('layers'); // 'layers' | 'camera' | 'scenarios' | 'roster'

  return (
    <aside 
      className="glass-panel"
      style={{
        width: isOpen ? '330px' : '0px',
        minWidth: isOpen ? '330px' : '0px',
        opacity: isOpen ? 1 : 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        borderTop: 'none',
        borderBottom: 'none',
        borderLeft: 'none',
        borderRadius: 0,
        boxShadow: isOpen ? '2px 0 12px rgba(60,64,67,0.15)' : 'none',
        background: 'var(--bg-panel)'
      }}
    >
      {/* Sidebar Header (Google Maps Style Drawer) */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.2px', color: 'var(--text-main)' }}>
            Map Layers & Controls
          </span>
        </div>
        <button
          onClick={onToggleOpen}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: '50%'
          }}
          title="Collapse Sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Google Maps Style Tabs (Chips Bar) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '8px 12px',
        gap: '6px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-dark-secondary)'
      }}>
        <button
          onClick={() => setActiveTab('layers')}
          className={`btn-glass ${activeTab === 'layers' ? 'active' : ''}`}
          style={{ padding: '6px 4px', fontSize: '11px', flexDirection: 'column', gap: '2px', borderRadius: '12px' }}
        >
          <Layers size={14} />
          <span>Layers</span>
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`btn-glass ${activeTab === 'camera' ? 'active' : ''}`}
          style={{ padding: '6px 4px', fontSize: '11px', flexDirection: 'column', gap: '2px', borderRadius: '12px' }}
        >
          <Crosshair size={14} />
          <span>Camera</span>
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`btn-glass ${activeTab === 'scenarios' ? 'active' : ''}`}
          style={{ padding: '6px 4px', fontSize: '11px', flexDirection: 'column', gap: '2px', borderRadius: '12px' }}
        >
          <FolderOpen size={14} />
          <span>Missions</span>
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`btn-glass ${activeTab === 'roster' ? 'active' : ''}`}
          style={{ padding: '6px 4px', fontSize: '11px', flexDirection: 'column', gap: '2px', borderRadius: '12px' }}
        >
          <Activity size={14} />
          <span>Fleet</span>
        </button>
      </div>

      {/* Scrollable Tab Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* ================= TAB 1: BASEMAP & LAYERS ================= */}
        {activeTab === 'layers' && (
          <>
            {/* Basemap Selection */}
            <div>
              <div className="sidebar-section-title">
                <span>Map Type</span>
                <span className="telemetry-tag" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{mapStyle}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {MAP_STYLES.filter(style => {
                  // In light mode, remove the dark mode map! Only show it when in dark mode
                  if (style.id === 'dark') {
                    return theme === 'dark';
                  }
                  return true;
                }).map(style => (
                  <button
                    key={style.id}
                    onClick={() => onSelectMapStyle(style.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      background: mapStyle === style.id ? 'var(--accent-cyan-bg)' : 'var(--bg-card)',
                      border: `1px solid ${mapStyle === style.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px' }}>{style.icon}</span>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{style.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{style.desc}</div>
                      </div>
                    </div>
                    {mapStyle === style.id && (
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '11px', fontWeight: 700 }}>● Active</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Overlays with Material Toggle Switches */}
            <div>
              <div className="sidebar-section-title">
                <span>Map Overlays</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Trails Toggle */}
                <div 
                  className={`sidebar-toggle-row ${showTrails ? 'active' : ''}`}
                  onClick={onToggleTrails}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Eye size={15} color="var(--accent-cyan)" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Breadcrumb Trails</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Motion history path lines</div>
                    </div>
                  </div>
                  <div className={`google-switch ${showTrails ? 'active' : ''}`}>
                    <div className="google-switch-thumb" />
                  </div>
                </div>

                {/* Alerts Toggle */}
                <div 
                  className={`sidebar-toggle-row ${showAlerts ? 'active' : ''}`}
                  onClick={onToggleAlerts}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={15} color="var(--accent-amber)" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Incident Markers</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hazard proximity alerts</div>
                    </div>
                  </div>
                  <div className={`google-switch ${showAlerts ? 'active' : ''}`}>
                    <div className="google-switch-thumb" />
                  </div>
                </div>

                {/* Resolved Checkpoints Toggle */}
                <div 
                  className={`sidebar-toggle-row ${showResolved ? 'active' : ''}`}
                  onClick={onToggleResolved}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={15} color="var(--accent-emerald)" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Resolved Milestones</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cleared incident markers</div>
                    </div>
                  </div>
                  <div className={`google-switch ${showResolved ? 'active' : ''}`}>
                    <div className="google-switch-thumb" />
                  </div>
                </div>

                {/* Range Rings Toggle */}
                <div 
                  className={`sidebar-toggle-row ${showRangeRings ? 'active' : ''}`}
                  onClick={onToggleRangeRings}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CircleDot size={15} color="var(--accent-cyan)" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Proximity Range Rings</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>350m sensor radius</div>
                    </div>
                  </div>
                  <div className={`google-switch ${showRangeRings ? 'active' : ''}`}>
                    <div className="google-switch-thumb" />
                  </div>
                </div>

                {/* Labels Toggle */}
                <div 
                  className={`sidebar-toggle-row ${showLabels ? 'active' : ''}`}
                  onClick={onToggleLabels}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Tag size={15} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>Asset Callouts</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Marker name badges</div>
                    </div>
                  </div>
                  <div className={`google-switch ${showLabels ? 'active' : ''}`}>
                    <div className="google-switch-thumb" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 2: CAMERA & NAVIGATION ================= */}
        {activeTab === 'camera' && (
          <>
            <div>
              <div className="sidebar-section-title">
                <span>Camera Presets</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => onCameraAction({ type: 'fit_bounds', ts: Date.now() })}
                  className="btn-glass"
                  style={{ justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '10px' }}
                >
                  <Maximize2 size={16} color="var(--accent-cyan)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-main)' }}>Fit Entire Route</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Auto-frame complete scenario bounds</div>
                  </div>
                </button>

                <button
                  onClick={() => onCameraAction({ type: 'center_entity', ts: Date.now() })}
                  className="btn-glass"
                  style={{ justifyContent: 'flex-start', padding: '10px 14px', borderRadius: '10px' }}
                >
                  <Crosshair size={16} color="var(--accent-cyan)" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-main)' }}>Follow Active Patrol</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Center camera on lead unit</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div className="sidebar-section-title">
                <span>Manual Zoom</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => onCameraAction({ type: 'zoom_in', ts: Date.now() })}
                  className="btn-glass"
                >
                  <ZoomIn size={14} />
                  <span>Zoom In</span>
                </button>
                <button
                  onClick={() => onCameraAction({ type: 'zoom_out', ts: Date.now() })}
                  className="btn-glass"
                >
                  <ZoomOut size={14} />
                  <span>Zoom Out</span>
                </button>
              </div>
            </div>

            {/* Coordinates / Extents Box */}
            {metadata && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '11px'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>Active Scene Extents</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Center Lat/Lng:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 600 }}>
                    {metadata.center ? `${metadata.center[0].toFixed(4)}, ${metadata.center[1].toFixed(4)}` : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Default Zoom:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                    Level {metadata.default_zoom || 13}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Duration:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                    {metadata.duration_seconds}s
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* ================= TAB 3: MISSIONS & DATASETS ================= */}
        {activeTab === 'scenarios' && (
          <>
            <div>
              <div className="sidebar-section-title">
                <span>Missions Catalog</span>
                <span className="telemetry-tag" style={{ fontSize: '9px' }}>{scenarios.length} Datasets</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scenarios.map(scen => (
                  <div
                    key={scen.id}
                    onClick={() => onSelectScenario(scen.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: currentScenarioId === scen.id ? 'var(--accent-cyan-bg)' : 'var(--bg-card)',
                      border: `1px solid ${currentScenarioId === scen.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {scen.name}
                      </span>
                      <span className="telemetry-tag" style={{ fontSize: '9px' }}>
                        {scen.total_frames} frames
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {scen.description || 'Spatial telemetry mission dataset'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <button
                onClick={onOpenUpload}
                className="btn-glass active"
                style={{ width: '100%', padding: '10px', borderRadius: '12px' }}
              >
                <UploadCloud size={15} />
                <span>Upload Custom Dataset</span>
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 4: FLEET ROSTER & INCIDENTS ================= */}
        {activeTab === 'roster' && (
          <>
            {/* Active Patrol Fleet */}
            <div>
              <div className="sidebar-section-title">
                <span>Patrol Units ({activeEntities.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeEntities.map(ent => (
                  <div
                    key={ent.id}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: ent.color || 'var(--accent-cyan)'
                      }} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{ent.name || ent.id}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {ent.speed_kmh} km/h • {ent.heading_deg}°
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onCameraAction({ type: 'fly_to', payload: { lat: ent.lat, lng: ent.lng, zoom: 16 }, ts: Date.now() })}
                      className="btn-glass"
                      style={{ padding: '3px 8px', fontSize: '10px' }}
                    >
                      Locate
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Incidents */}
            <div>
              <div className="sidebar-section-title">
                <span>Active Hazards ({activeAlerts.length})</span>
              </div>
              {activeAlerts.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', padding: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} />
                  <span>All corridor hazards resolved</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeAlerts.map(alert => (
                    <div
                      key={alert.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: 'var(--accent-amber-bg)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-amber)' }}>{alert.title}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                        </div>
                      </div>
                      <button
                        onClick={() => onCameraAction({ type: 'fly_to', payload: { lat: alert.lat, lng: alert.lng, zoom: 16 }, ts: Date.now() })}
                        className="btn-glass"
                        style={{ padding: '3px 8px', fontSize: '10px' }}
                      >
                        Locate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
