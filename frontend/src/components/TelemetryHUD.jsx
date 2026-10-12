import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  Navigation, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  X, 
  Minus,
  Maximize2,
  Clock, 
  Crosshair, 
  Car 
} from 'lucide-react';

export default function TelemetryHUD({
  metadata,
  activeEntities = [],
  activeAlerts = [],
  resolvedPoints = [],
  clearanceRate = 0,
  currentTime = 0,
  totalFrames = 0,
  currentStepIndex = 0,
  onCameraAction,
  collapsed: externalCollapsed,
  onToggleCollapse
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const isControlled = externalCollapsed !== undefined;
  const collapsed = isControlled ? externalCollapsed : internalCollapsed;

  const handleToggleCollapse = (val) => {
    if (onToggleCollapse) {
      onToggleCollapse(val);
    }
    if (!isControlled) {
      setInternalCollapsed(val);
    }
  };

  const copyCoords = (lat, lng, id) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const totalIncidents = activeAlerts.length + resolvedPoints.length;

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      zIndex: 960,
      display: 'flex',
      alignItems: 'flex-start',
      pointerEvents: 'auto',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Collapsed Pill Button (MacBook Liquid Glass Floating Pill) */}
      {collapsed && (
        <button
          onClick={() => handleToggleCollapse(false)}
          className="liquid-glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '24px',
            cursor: 'pointer',
            border: '1px solid var(--liquid-glass-border)',
            color: 'var(--text-main)',
            boxShadow: 'var(--liquid-glass-shadow)'
          }}
          title="Open Live Results Card"
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--accent-cyan)',
            boxShadow: '0 0 8px var(--accent-cyan)'
          }} />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            Live Telemetry Results
          </span>
          {activeAlerts.length > 0 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '12px',
              background: 'var(--accent-amber-bg)',
              color: 'var(--accent-amber)'
            }}>
              {activeAlerts.length} Alerts
            </span>
          )}
          <span className="telemetry-tag" style={{ fontSize: '11px' }}>
            Step {Math.floor(currentTime)}
          </span>
          <ChevronLeft size={16} color="var(--text-muted)" />
        </button>
      )}

      {/* Expanded Live Results Card (MacBook Liquid Glass) */}
      {!collapsed && (
        <div 
          className="liquid-glass-panel" 
          style={{
            width: '354px',
            borderRadius: '18px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: minimized ? '50px' : 'calc(100% - 135px)',
            boxShadow: 'var(--liquid-glass-shadow)',
            border: '1px solid var(--liquid-glass-border)',
            animation: 'fadeIn 0.2s ease-out',
            transition: 'max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Card Header (MacBook Frosted Glass Header) */}
          <div style={{
            padding: '12px 16px',
            borderBottom: minimized ? 'none' : '1px solid var(--liquid-glass-subcard-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--liquid-glass-header-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-cyan)',
                boxShadow: '0 0 8px var(--accent-cyan)'
              }} />
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.3px', color: 'var(--text-main)' }}>
                LIVE MISSION RESULTS
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="telemetry-tag" style={{ fontSize: '11px', fontWeight: 700 }}>
                Step {Math.floor(currentTime)}
              </span>
              
              {/* Minimize/Maximize to Header Button */}
              <button
                onClick={() => setMinimized(m => !m)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'color 0.15s ease'
                }}
                title={minimized ? "Expand Content" : "Minimize to Header"}
              >
                {minimized ? <Maximize2 size={14} /> : <Minus size={14} />}
              </button>

              {/* Collapse to Pill Button */}
              <button
                onClick={() => handleToggleCollapse(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'color 0.15s ease'
                }}
                title="Collapse to Pill"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scrollable Live Result Body (Hidden when Minimized) */}
          {!minimized && (
            <div style={{
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
            {/* Clearance Progress Card (MacBook Subcard) */}
            {totalIncidents > 0 && (
              <div 
                className="liquid-glass-subcard" 
                style={{
                  borderRadius: '14px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="var(--accent-emerald)" />
                    Corridor Clearance Lifecycle
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {clearanceRate}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${clearanceRate}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-amber) 0%, var(--accent-emerald) 100%)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>● Active: {activeAlerts.length}</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>✓ Cleared: {resolvedPoints.length}</span>
                  <span>Total: {totalIncidents}</span>
                </div>
              </div>
            )}

            {/* Active Alerts / Hazards List */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--accent-amber)',
                  letterSpacing: '0.4px'
                }}>
                  <AlertTriangle size={13} />
                  <span>Active Hazards ({activeAlerts.length})</span>
                </div>
                {activeAlerts.length > 0 && (
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Real-time sensor feed</span>
                )}
              </div>

              {activeAlerts.length === 0 ? (
                <div style={{
                  padding: '11px 14px',
                  background: 'var(--accent-emerald-bg)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  border: '1px solid var(--liquid-glass-subcard-border)',
                  color: 'var(--accent-emerald)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} />
                  <span>All corridor hazard sensors clear</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      style={{
                        background: alert.severity === 'danger' ? 'var(--accent-rose-bg)' : 'var(--accent-amber-bg)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: `1px solid ${alert.severity === 'danger' ? 'var(--accent-rose)' : 'var(--accent-amber)'}40`,
                        borderRadius: '12px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '12px', color: alert.severity === 'danger' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                          {alert.title}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.06)',
                          color: 'var(--text-main)'
                        }}>
                          DISPATCH ACTIVE
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-main)', fontSize: '11px', lineHeight: 1.35 }}>
                        {alert.description}
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '4px',
                        fontSize: '10px',
                        color: 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <span>{alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</span>
                        {onCameraAction && (
                          <button
                            onClick={() => onCameraAction({ type: 'fly_to', payload: { lat: alert.lat, lng: alert.lng, zoom: 16 }, ts: Date.now() })}
                            className="liquid-glass-btn"
                            style={{ padding: '2px 9px', fontSize: '10px', borderRadius: '12px' }}
                          >
                            Center
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Patrol Units & Tracking Fleet (MacBook Liquid Glass Cards) */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Car size={13} color="var(--accent-cyan)" />
                  <span>Patrol Units ({activeEntities.length})</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeEntities.map(entity => (
                  <div
                    key={entity.id}
                    className="liquid-glass-subcard"
                    style={{
                      borderRadius: '14px',
                      padding: '11px 13px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '9px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: entity.color || 'var(--accent-cyan)',
                          boxShadow: `0 0 8px ${entity.color || 'var(--accent-cyan)'}`
                        }} />
                        <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-main)' }}>
                          {entity.name || entity.id}
                        </span>
                      </div>
                      <button
                        onClick={() => copyCoords(entity.lat, entity.lng, entity.id)}
                        className="liquid-glass-btn"
                        style={{ padding: '3px 8px', fontSize: '10px', borderRadius: '12px' }}
                        title="Copy Coordinates"
                      >
                        {copiedId === entity.id ? <Check size={11} color="var(--accent-emerald)" /> : <Copy size={11} />}
                        <span>{copiedId === entity.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Speed & Heading Pills (Liquid Glass Indicators) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
                      <div style={{ 
                        background: 'var(--accent-cyan-bg)', 
                        borderRadius: '9px', 
                        padding: '6px 4px',
                        border: '1px solid var(--liquid-glass-subcard-border)'
                      }}>
                        <div style={{ fontSize: '9px', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '0.3px' }}>SPEED</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {entity.speed_kmh} <span style={{ fontSize: '9px', fontWeight: 600 }}>km/h</span>
                        </div>
                      </div>
                      <div style={{ 
                        background: 'var(--liquid-glass-pill-bg)', 
                        borderRadius: '9px', 
                        padding: '6px 4px',
                        border: '1px solid var(--liquid-glass-subcard-border)'
                      }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.3px' }}>HEADING</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {entity.heading_deg}°
                        </div>
                      </div>
                      <div style={{ 
                        background: 'var(--liquid-glass-pill-bg)', 
                        borderRadius: '9px', 
                        padding: '6px 4px',
                        border: '1px solid var(--liquid-glass-subcard-border)'
                      }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.3px' }}>ALTITUDE</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {entity.altitude_m || 0}m
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '10px',
                      color: 'var(--text-dim)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      <span>{entity.lat.toFixed(5)}, {entity.lng.toFixed(5)}</span>
                      {onCameraAction && (
                        <button
                          onClick={() => onCameraAction({ type: 'fly_to', payload: { lat: entity.lat, lng: entity.lng, zoom: 16 }, ts: Date.now() })}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-cyan)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 4px',
                            borderRadius: '4px'
                          }}
                        >
                          Locate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Details Card (MacBook Subcard) */}
            {metadata && (
              <div 
                className="liquid-glass-subcard"
                style={{
                  borderRadius: '12px',
                  padding: '11px 13px',
                  fontSize: '11px',
                  color: 'var(--text-muted)'
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                  {metadata.name}
                </div>
                <div style={{ fontSize: '10px', lineHeight: 1.35 }}>
                  {metadata.description}
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
