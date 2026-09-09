import React from 'react';
import { 
  Compass, 
  Layers, 
  Radio, 
  UploadCloud, 
  Eye, 
  EyeOff, 
  ChevronDown 
} from 'lucide-react';

export default function Header({
  scenarios,
  currentScenarioId,
  onSelectScenario,
  mapStyle,
  onSelectMapStyle,
  showTrails,
  onToggleTrails,
  onOpenUpload,
  totalFrames,
  activeEntitiesCount
}) {
  return (
    <header className="glass-panel" style={{
      margin: '12px 16px 0 16px',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      zIndex: 1000,
      position: 'relative'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(2, 132, 199, 0.4))',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)'
        }}>
          <Compass size={20} color="#00f0ff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.5px' }}>
              SPATIAL <span style={{ color: 'var(--accent-cyan)' }}>PLAYBACK</span>
            </span>
            <span className="telemetry-tag" style={{ fontSize: '10px' }}>v2.0 PRO</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Dynamic GIS Telemetry & Motion Simulation
          </p>
        </div>
      </div>

      {/* Scenario Selector & Telemetry Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Scenario:
          </span>
          <select 
            value={currentScenarioId} 
            onChange={(e) => onSelectScenario(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#fff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.total_frames} frames)
              </option>
            ))}
          </select>
        </div>

        {/* Live Backend Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          fontSize: '11px',
          color: 'var(--accent-emerald)',
          fontWeight: 600
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--accent-emerald)',
            boxShadow: '0 0 8px var(--accent-emerald)'
          }} />
          FASTAPI CONNECTED
        </div>
      </div>

      {/* Actions & Map Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Map Style Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            className={`btn-glass ${mapStyle === 'dark' ? 'active' : ''}`}
            onClick={() => onSelectMapStyle('dark')}
            title="Dark Matter Map"
          >
            <Layers size={14} />
            <span>Dark</span>
          </button>
          <button 
            className={`btn-glass ${mapStyle === 'satellite' ? 'active' : ''}`}
            onClick={() => onSelectMapStyle('satellite')}
            title="Satellite Imagery"
          >
            <span>Satellite</span>
          </button>
          <button 
            className={`btn-glass ${mapStyle === 'street' ? 'active' : ''}`}
            onClick={() => onSelectMapStyle('street')}
            title="OpenStreetMap Street Layer"
          >
            <span>Street</span>
          </button>
        </div>

        {/* Trails Toggle */}
        <button 
          className={`btn-glass ${showTrails ? 'active' : ''}`}
          onClick={onToggleTrails}
          title="Toggle trajectory breadcrumb trails"
        >
          {showTrails ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>Trails</span>
        </button>

        {/* Upload Custom Dataset */}
        <button 
          className="btn-glass"
          onClick={onOpenUpload}
          style={{ borderColor: 'rgba(0, 240, 255, 0.3)' }}
          title="Upload or paste custom trajectory dataset"
        >
          <UploadCloud size={14} color="#00f0ff" />
          <span>Upload</span>
        </button>
      </div>
    </header>
  );
}
