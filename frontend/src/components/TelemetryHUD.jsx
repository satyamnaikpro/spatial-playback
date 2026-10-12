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
  onCameraAction
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

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
      zIndex: 999,
      display: 'flex',
      alignItems: 'flex-start',
      pointerEvents: 'auto',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Collapsed Pill Button (Google Maps Floating Pill Style) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: '24px',
            cursor: 'pointer',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-panel)'
          }}
          title="Open Live Results Card"
        >
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--accent-cyan)',
            boxShadow: '0 0 6px var(--accent-cyan)'
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

      {/* Expanded Live Results Card */}
      {!collapsed && (
        <div 
          className="glass-panel" 
          style={{
            width: '350px',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 140px)',
            boxShadow: 'var(--shadow-panel)',
            border: '1px solid var(--border-subtle)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Card Header (Google Maps Live Card Style) */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)'
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="telemetry-tag" style={{ fontSize: '11px', fontWeight: 700 }}>
                Step {Math.floor(currentTime)}
              </span>
              <button
                onClick={() => setCollapsed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                title="Collapse Card"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable Live Result Body */}
          <div style={{
            padding: '14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* Clearance Progress Card */}
            {totalIncidents > 0 && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
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
                <div style={{ width: '100%', height: '6px', background: 'var(--border-medium)', borderRadius: '3px', overflow: 'hidden' }}>
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

            {/* Active Alerts / Hazards List (Google Maps Traffic Style) */}
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
                  padding: '10px 12px',
                  background: 'var(--accent-emerald-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      style={{
                        background: alert.severity === 'danger' ? 'var(--accent-rose-bg)' : 'var(--accent-amber-bg)',
                        border: `1px solid ${alert.severity === 'danger' ? 'var(--accent-rose)' : 'var(--accent-amber)'}44`,
                        borderRadius: '10px',
                        padding: '9px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '12px', color: alert.severity === 'danger' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                          {alert.title}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: 'rgba(0,0,0,0.08)',
                          color: 'var(--text-main)'
                        }}>
                          DISPATCH ACTIVE
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-main)', fontSize: '11px', lineHeight: 1.3 }}>
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
                            className="btn-glass"
                            style={{ padding: '2px 8px', fontSize: '10px' }}
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

            {/* Patrol Units & Tracking Fleet */}
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
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: entity.color || 'var(--accent-cyan)',
                          boxShadow: `0 0 6px ${entity.color || 'var(--accent-cyan)'}`
                        }} />
                        <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-main)' }}>
                          {entity.name || entity.id}
                        </span>
                      </div>
                      <button
                        onClick={() => copyCoords(entity.lat, entity.lng, entity.id)}
                        className="btn-glass"
                        style={{ padding: '3px 8px', fontSize: '10px' }}
                        title="Copy Coordinates"
                      >
                        {copiedId === entity.id ? <Check size={11} color="var(--accent-emerald)" /> : <Copy size={11} />}
                        <span>{copiedId === entity.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Speed & Heading Pills */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
                      <div style={{ background: 'var(--accent-cyan-bg)', borderRadius: '8px', padding: '6px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--accent-cyan)', fontWeight: 600 }}>SPEED</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {entity.speed_kmh} <span style={{ fontSize: '9px' }}>km/h</span>
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-dark-secondary)', borderRadius: '8px', padding: '6px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>HEADING</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {entity.heading_deg}°
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-dark-secondary)', borderRadius: '8px', padding: '6px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>ALTITUDE</div>
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
                            fontWeight: 600
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

            {/* Mission Details Card */}
            {metadata && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '11px',
                color: 'var(--text-muted)'
              }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px' }}>
                  {metadata.name}
                </div>
                <div style={{ fontSize: '10px', lineHeight: 1.3 }}>
                  {metadata.description}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
