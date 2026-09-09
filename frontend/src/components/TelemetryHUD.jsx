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
  ShieldCheck 
} from 'lucide-react';

export default function TelemetryHUD({
  metadata,
  activeEntities = [],
  activeAlerts = [],
  resolvedPoints = [],
  clearanceRate = 0,
  currentTime,
  totalFrames
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
      top: '80px',
      left: '16px',
      zIndex: 999,
      display: 'flex',
      pointerEvents: 'auto',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* HUD Container */}
      <div 
        className="glass-panel" 
        style={{
          width: collapsed ? '0px' : '340px',
          opacity: collapsed ? 0 : 1,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 220px)',
          borderRight: collapsed ? 'none' : undefined
        }}
      >
        {/* HUD Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px' }}>
              INCIDENT & FLEET TELEMETRY
            </span>
          </div>
          <span className="telemetry-tag">
            {activeEntities.length} PATROL
          </span>
        </div>

        {/* Scrollable Telemetry Body */}
        <div style={{
          padding: '14px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Clearance Progress Card (From GIF lifecycle) */}
          {totalIncidents > 0 && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={13} color="var(--accent-emerald)" />
                  CLEARANCE LIFECYCLE
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {clearanceRate}%
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${clearanceRate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f97316 0%, #10b981 100%)',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                <span style={{ color: '#f97316' }}>● Active: {activeAlerts.length}</span>
                <span style={{ color: '#10b981' }}>✓ Cleared: {resolvedPoints.length}</span>
                <span>Total: {totalIncidents}</span>
              </div>
            </div>
          )}

          {/* Active Alerts / Incidents (Orange markers) */}
          {activeAlerts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#f97316',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <AlertTriangle size={13} />
                <span>Active Incidents ({activeAlerts.length})</span>
              </div>

              {activeAlerts.map(alert => (
                <div 
                  key={alert.id}
                  style={{
                    background: alert.severity === 'danger' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(249, 115, 22, 0.12)',
                    border: `1px solid ${alert.severity === 'danger' ? '#ef4444' : '#f97316'}55`,
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, color: alert.severity === 'danger' ? '#ef4444' : '#f97316' }}>
                      {alert.title}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}>
                      ACTIVE
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    {alert.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cleared / Resolved Points (Green "X" markers) */}
          {resolvedPoints.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <CheckCircle2 size={13} />
                <span>Cleared Incidents ({resolvedPoints.length})</span>
              </div>

              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '6px',
                borderRadius: '6px'
              }}>
                {resolvedPoints.map(res => (
                  <div 
                    key={res.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      background: 'rgba(16, 185, 129, 0.08)'
                    }}
                  >
                    <span style={{ color: '#10b981' }}>✓ {res.title}</span>
                    <span>{res.lat.toFixed(4)}, {res.lng.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Entities List (Patrol Units) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Patrol & Tracking Fleet
            </span>

            {activeEntities.map(entity => {
              const color = entity.color || '#00f0ff';
              const isCopied = copiedId === entity.id;

              return (
                <div 
                  key={entity.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${color}33`,
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 8px ${color}`
                      }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        {entity.name || entity.id}
                      </span>
                    </div>

                    <button 
                      onClick={() => copyCoords(entity.lat, entity.lng, entity.id)}
                      title="Copy coordinates"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {isCopied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      {isCopied ? 'COPIED' : 'COPY'}
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px'
                  }}>
                    <div>
                      <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>SPEED</div>
                      <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                        {entity.speed_kmh} <span style={{ fontSize: '9px' }}>km/h</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>HEADING</div>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {entity.heading_deg}°
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>ALT</div>
                      <div style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                        {entity.altitude_m} <span style={{ fontSize: '9px' }}>m</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--text-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Navigation size={10} />
                    <span>{entity.lat.toFixed(5)}, {entity.lng.toFixed(5)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scenario Overview */}
          {metadata && (
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {metadata.name}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                {metadata.description}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                <span>Frames: {metadata.total_frames}</span>
                <span>Interval: {metadata.default_step_interval_ms}ms</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Handle */}
      <button 
        onClick={() => setCollapsed(c => !c)}
        className="glass-panel"
        style={{
          width: '24px',
          height: '44px',
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderLeft: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          alignSelf: 'center'
        }}
        title={collapsed ? "Expand Telemetry HUD" : "Collapse Telemetry HUD"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
}
