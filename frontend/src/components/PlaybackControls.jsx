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
  intervalMs = 1000
}) {
  const maxTime = Math.max(0, totalFrames - 1);
  const currentStep = Math.floor(currentTime);
  const progressPercent = maxTime > 0 ? (currentTime / maxTime) * 100 : 0;
  const elapsedSecs = ((currentTime * intervalMs) / 1000).toFixed(1);
  const totalSecs = ((maxTime * intervalMs) / 1000).toFixed(1);

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)',
      maxWidth: '920px',
      zIndex: 1000,
      pointerEvents: 'auto'
    }}>
      <div className="glass-panel" style={{
        padding: '12px 20px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'var(--shadow-panel)'
      }}>
        {/* Scrubber Timeline Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            minWidth: '45px'
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
              background: 'var(--accent-cyan)',
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
            fontWeight: 600,
            color: 'var(--text-dim)',
            minWidth: '45px',
            textAlign: 'right'
          }}>
            {totalSecs}s
          </span>
        </div>

        {/* Buttons & Indicators Row (Google Navigation Style) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left: Step Readout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="telemetry-tag" style={{ borderRadius: '12px' }}>
              STEP: <b style={{ color: 'var(--accent-cyan)' }}>{currentStep}</b> / {maxTime}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>
              ({progressPercent.toFixed(0)}%)
            </span>
          </div>

          {/* Center: Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn-glass" 
              onClick={onReset} 
              style={{ width: '36px', height: '36px', padding: 0 }}
              title="Reset to start"
            >
              <RotateCcw size={15} />
            </button>

            <button 
              className="btn-glass" 
              onClick={onStepBackward} 
              style={{ width: '36px', height: '36px', padding: 0 }}
              title="Step Backward"
            >
              <SkipBack size={15} />
            </button>

            {/* Google Primary Round Play Button */}
            <button 
              className="btn-primary-play" 
              onClick={onTogglePlay}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />}
            </button>

            <button 
              className="btn-glass" 
              onClick={onStepForward} 
              style={{ width: '36px', height: '36px', padding: 0 }}
              title="Step Forward"
            >
              <SkipForward size={15} />
            </button>

            <button 
              className={`btn-glass ${loop ? 'active' : ''}`} 
              onClick={onToggleLoop} 
              style={{ width: '36px', height: '36px', padding: 0 }}
              title="Toggle Loop"
            >
              <Repeat size={15} />
            </button>
          </div>

          {/* Right: Speed Multiplier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <Gauge size={13} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Rate:</span>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {[0.25, 0.5, 1.0, 2.0, 4.0].map(s => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`btn-glass ${speed === s ? 'active' : ''}`}
                  style={{
                    padding: '3px 8px',
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
