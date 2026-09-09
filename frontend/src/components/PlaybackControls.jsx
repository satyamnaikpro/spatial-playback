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
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 48px)',
      maxWidth: '920px',
      zIndex: 1000,
      pointerEvents: 'auto'
    }}>
      <div className="glass-panel" style={{
        padding: '14px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.65)'
      }}>
        {/* Scrubber Timeline Bar with Gradient Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            minWidth: '50px'
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
              background: 'linear-gradient(90deg, #0284c7, #00f0ff)',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
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
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-dim)',
            minWidth: '50px',
            textAlign: 'right'
          }}>
            {totalSecs}s
          </span>
        </div>

        {/* Buttons & Indicators Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left: Frame Readout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="telemetry-tag">
              STEP: <b style={{ color: '#fff' }}>{currentStep}</b> / {maxTime}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              ({progressPercent.toFixed(0)}%)
            </span>
          </div>

          {/* Center: Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="btn-glass" 
              onClick={onReset} 
              title="Reset to frame 0"
            >
              <RotateCcw size={15} />
            </button>

            <button 
              className="btn-glass" 
              onClick={onStepBackward} 
              title="Step Backward 1 Frame"
            >
              <SkipBack size={16} />
            </button>

            {/* Primary Big Play Button */}
            <button 
              className="btn-primary-play" 
              onClick={onTogglePlay}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" style={{ marginLeft: '2px' }} />}
            </button>

            <button 
              className="btn-glass" 
              onClick={onStepForward} 
              title="Step Forward 1 Frame"
            >
              <SkipForward size={16} />
            </button>

            <button 
              className={`btn-glass ${loop ? 'active' : ''}`} 
              onClick={onToggleLoop} 
              title="Toggle Loop Playback"
            >
              <Repeat size={15} />
            </button>
          </div>

          {/* Right: Speed Multiplier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <Gauge size={14} />
              <span style={{ fontSize: '12px' }}>Rate:</span>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {[0.25, 0.5, 1.0, 2.0, 4.0].map(s => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`btn-glass ${speed === s ? 'active' : ''}`}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    minWidth: '38px'
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
