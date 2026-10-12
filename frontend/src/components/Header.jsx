import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  ChevronDown,
  Check,
  Car,
  Navigation
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getScenarioIcon = (id = '') => {
    const lower = id.toLowerCase();
    if (lower.includes('drone') || lower.includes('recon') || lower.includes('aerial')) {
      return <Navigation size={15} />;
    }
    if (lower.includes('fleet') || lower.includes('patrol')) {
      return <Car size={15} />;
    }
    if (lower.includes('clearance') || lower.includes('incident')) {
      return <ShieldCheck size={15} />;
    }
    return <Compass size={15} />;
  };

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
        {/* Custom MacBook Liquid Glass Scenario Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setDropdownOpen(o => !o)}
            className="liquid-glass-btn"
            style={{
              padding: '6px 14px',
              height: '38px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: dropdownOpen ? '1px solid var(--accent-cyan)' : '1px solid var(--liquid-glass-subcard-border)',
              background: dropdownOpen ? 'var(--liquid-glass-card-hover)' : 'var(--liquid-glass-pill-bg)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              boxShadow: dropdownOpen ? '0 0 12px rgba(26, 115, 232, 0.25)' : 'none'
            }}
            title="Choose Mission Scenario"
          >
            <Search size={14} color="var(--accent-cyan)" />
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              maxWidth: '240px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {scenarios.find(s => s.id === currentScenarioId)?.name || 'Select Scenario'}
            </span>
            <span className="telemetry-tag" style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
              {scenarios.find(s => s.id === currentScenarioId)?.total_frames || 0}f
            </span>
            <ChevronDown 
              size={14} 
              color="var(--text-muted)" 
              style={{
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </button>

          {/* Floating Elevated Liquid Glass Dropdown Popover */}
          {dropdownOpen && (
            <div
              className="liquid-glass-popover"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '400px',
                maxHeight: '430px',
                overflowY: 'auto',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                zIndex: 2000,
                animation: 'fadeIn 0.16s ease-out'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px 8px 10px',
                borderBottom: '1px solid var(--popover-item-border)'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: 'var(--text-muted)'
                }}>
                  MISSION SCENARIOS ({scenarios.length})
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  Real-time playback feeds
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingTop: '4px' }}>
                {scenarios.map(s => {
                  const isSelected = s.id === currentScenarioId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        onSelectScenario(s.id);
                        setDropdownOpen(false);
                      }}
                      className={`popover-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '11px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: isSelected ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.45)',
                          color: isSelected ? '#ffffff' : 'var(--accent-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: isSelected ? '0 2px 10px rgba(26, 115, 232, 0.35)' : 'inset 0 1px 1px rgba(255, 255, 255, 0.8)'
                        }}>
                          {getScenarioIcon(s.id)}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: isSelected ? 'var(--accent-cyan)' : 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {s.name}
                          </span>
                          {s.description && (
                            <span style={{
                              fontSize: '11px',
                              color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '2px',
                              opacity: 0.85
                            }}>
                              {s.description}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span className="telemetry-tag" style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                          {s.total_frames}f
                        </span>
                        {isSelected && <Check size={16} color="var(--accent-cyan)" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
