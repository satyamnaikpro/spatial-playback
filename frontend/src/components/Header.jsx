import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  UploadCloud, 
  Sliders, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Radio, 
  PanelLeftClose, 
  PanelLeft, 
  Map, 
  Search 
} from 'lucide-react';

export default function Header({
  sidebarOpen,
  onToggleSidebar,
  theme,
  onToggleTheme,
  scenarios = [],
  currentScenarioId,
  onSelectScenario,
  onOpenUpload,
  totalFrames,
  activeEntitiesCount,
  activeAlertsCount,
  resolvedCount,
  clearanceRate,
  isLiveBackend
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="glass-panel" style={{
      width: '100%',
      height: '56px',
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      zIndex: 1002,
      position: 'relative',
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-panel)',
      boxShadow: 'var(--shadow-panel)'
    }}>
      {/* Left: Sidebar Toggle + Brand Logo (Google Maps style) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Google Style Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          className={`btn-glass ${sidebarOpen ? 'active' : ''}`}
          style={{ padding: '6px 12px', height: '36px', borderRadius: '18px' }}
          title={sidebarOpen ? "Collapse Map Controls Sidebar" : "Expand Map Controls Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Sidebar</span>
        </button>

        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(26, 115, 232, 0.35)'
          }}>
            <Compass size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.2px', color: 'var(--text-main)' }}>
                Spatial <span style={{ color: 'var(--accent-cyan)' }}>Playback</span>
              </span>
              <span className="telemetry-tag" style={{ fontSize: '9px', padding: '1px 6px' }}>MAPS v2.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Google Search / Scenario Selector & Live Status Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Google Style Search / Scenario Dropdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-medium)',
          borderRadius: '24px',
          padding: '4px 12px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <Search size={14} color="var(--text-muted)" />
          <select 
            value={currentScenarioId} 
            onChange={(e) => onSelectScenario(e.target.value)}
            style={{
              background: 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
              maxWidth: '260px'
            }}
          >
            {scenarios.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.total_frames} frames)
              </option>
            ))}
          </select>
        </div>

        {/* Google Maps Transit & Incident Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="telemetry-tag" style={{
            background: 'var(--accent-cyan-bg)',
            color: 'var(--accent-cyan)',
            borderColor: 'var(--border-subtle)'
          }} title="Active Patrol Fleet">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
            {activeEntitiesCount} Units
          </div>

          <div className="telemetry-tag" style={{
            background: activeAlertsCount > 0 ? 'var(--accent-amber-bg)' : 'var(--bg-card)',
            color: activeAlertsCount > 0 ? 'var(--accent-amber)' : 'var(--text-dim)',
            borderColor: 'var(--border-subtle)'
          }} title="Active Sensor Alerts">
            <span>⚠️</span> {activeAlertsCount} Alerts
          </div>

          <div className="telemetry-tag" style={{
            background: 'var(--accent-emerald-bg)',
            color: 'var(--accent-emerald)',
            borderColor: 'var(--border-subtle)'
          }} title="Corridor Clearance Lifecycle">
            <span>✓</span> {clearanceRate}% Cleared
          </div>
        </div>
      </div>

      {/* Right: Live Connection Badge + Dark/Light Mode Icon + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Backend Status Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '16px',
          background: isLiveBackend ? 'var(--accent-emerald-bg)' : 'var(--accent-cyan-bg)',
          border: `1px solid ${isLiveBackend ? 'var(--accent-emerald)' : 'var(--accent-cyan)'}33`,
          fontSize: '11px',
          color: isLiveBackend ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
          fontWeight: 600
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isLiveBackend ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
            boxShadow: `0 0 6px ${isLiveBackend ? 'var(--accent-emerald)' : 'var(--accent-cyan)'}`
          }} />
          {isLiveBackend ? 'FASTAPI LIVE' : 'DEMO READY'}
        </div>

        {/* Dark / Light Mode Toggle Button with Icon (Google Style) */}
        <button
          onClick={onToggleTheme}
          className="btn-theme-toggle"
          title={theme === 'dark' ? "Switch to Light Mode (Google Maps Theme)" : "Switch to Dark Mode (Night Navigation)"}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun size={17} color="#f59e0b" />
          ) : (
            <Moon size={17} color="#1a73e8" />
          )}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="btn-fab"
          style={{ width: '36px', height: '36px' }}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        {/* Upload Custom Dataset (Google Maps Blue Button) */}
        <button 
          onClick={onOpenUpload}
          style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '18px',
            background: 'var(--accent-cyan)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-cyan-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-cyan)'; }}
          title="Upload Custom Trajectory Dataset"
        >
          <UploadCloud size={15} />
          <span>Upload</span>
        </button>
      </div>
    </header>
  );
}
