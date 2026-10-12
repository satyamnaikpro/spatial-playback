import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Gauge 
} from 'lucide-react';

export default function PlaybackControls({
  currentTime,
  totalFrames,
  isPlaying,
  onTogglePlay,
  onReset,
  onSeek,
  onStepForward,
  onStepBackward,
  speed,
  onChangeSpeed,
  loop,
  onToggleLoop,
  intervalMs = 1000,
  hudOpen = false
}) {
  const maxTime = Math.max(0, totalFrames - 1);
  const currentStep = Math.floor(currentTime);
  const progressPercent = maxTime > 0 ? (currentTime / maxTime) * 100 : 0;
  const elapsedSecs = ((currentTime * intervalMs) / 1000).toFixed(1);
  const totalSecs = ((maxTime * intervalMs) / 1000).toFixed(1);

  return (
    <div className="playback-dock">
      <div className="liquid-glass-panel" style={{
        padding: '13px 22px',
        borderRadius: '26px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'var(--liquid-glass-shadow)',
        border: '1px solid var(--liquid-glass-border)'
      }}>
        {/* Scrubber Timeline Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            minWidth: '45px',
            fontFamily: 'var(--font-mono)'
          }}>
            {elapsedSecs}s
          </span>

          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            {/* Background fill track */}
            <div style={{
              position: 'absolute',
              left: 0,
              width: `${progressPercent}%`,
              height: '6px',
              borderRadius: '3px',
              background: 'linear-gradient(90deg, var(--accent-cyan) 0%, #34a853 100%)',
              boxShadow: '0 0 10px rgba(26, 115, 232, 0.45)',
              pointerEvents: 'none',
              zIndex: 1
            }} />

            <input
              type="range"
              min="0"
              max={maxTime}
              step="0.01"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="timeline-slider"
              style={{ zIndex: 2 }}
            />
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-dim)',
            minWidth: '45px',
            textAlign: 'right',
            fontFamily: 'var(--font-mono)'
          }}>
            {totalSecs}s
          </span>
        </div>

        {/* Buttons & Indicators Row (MacBook Dock / Control Center Style) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Left: Step Readout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifySelf: 'start', minWidth: 0 }}>
            <span className="telemetry-tag" style={{ borderRadius: '14px', padding: '4px 12px', whiteSpace: 'nowrap' }}>
              STEP: <b style={{ color: 'var(--accent-cyan)' }}>{currentStep}</b> / {maxTime}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              ({progressPercent.toFixed(0)}%)
            </span>
          </div>

          {/* Center: Playback Controls (MacBook Glass Action Buttons) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifySelf: 'center' }}>
            <button 
              className="liquid-glass-btn" 
              onClick={onReset} 
              style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
              title="Reset to start"
            >
              <RotateCcw size={15} />
            </button>

            <button 
              className="liquid-glass-btn" 
              onClick={onStepBackward} 
              style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
              title="Step Backward"
            >
              <SkipBack size={15} />
            </button>

            {/* Apple Glowing Disc Play Button */}
            <button 
              className="btn-primary-play" 
              onClick={onTogglePlay}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />}
            </button>

            <button 
              className="liquid-glass-btn" 
              onClick={onStepForward} 
              style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
              title="Step Forward"
            >
              <SkipForward size={15} />
            </button>

            <button 
              className={`liquid-glass-btn ${loop ? 'active' : ''}`} 
              onClick={onToggleLoop} 
              style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
              title="Toggle Loop"
            >
              <Repeat size={15} />
            </button>
          </div>

          {/* Right: Speed Multiplier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifySelf: 'end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <Gauge size={13} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Rate:</span>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {[0.25, 0.5, 1.0, 2.0, 4.0].map(s => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`liquid-glass-btn ${speed === s ? 'active' : ''}`}
                  style={{
                    padding: '3px 9px',
                    fontSize: '11px',
                    fontWeight: 600,
                    minWidth: '36px',
                    borderRadius: '12px'
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
