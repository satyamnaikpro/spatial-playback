import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MapViewer from './components/MapViewer';
import PlaybackControls from './components/PlaybackControls';
import TelemetryHUD from './components/TelemetryHUD';
import UploadModal from './components/UploadModal';
import { usePlayback } from './hooks/usePlayback';

export default function App() {
  const playback = usePlayback();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        playback.togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        playback.stepBackward();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        playback.stepForward();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        playback.reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playback]);

  const handleUploadSuccess = async (newId) => {
    await playback.reloadScenarios();
    playback.setCurrentScenarioId(newId);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Floating Header */}
      <Header
        scenarios={playback.scenarios}
        currentScenarioId={playback.currentScenarioId}
        onSelectScenario={playback.setCurrentScenarioId}
        mapStyle={playback.mapStyle}
        onSelectMapStyle={playback.setMapStyle}
        showTrails={playback.showTrails}
        onToggleTrails={() => playback.setShowTrails(t => !t)}
        onOpenUpload={() => setIsUploadOpen(true)}
        totalFrames={playback.totalFrames}
        activeEntitiesCount={playback.activeEntities.length}
      />

      {/* Map View Area */}
      <main style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <MapViewer
          metadata={playback.metadata}
          activeEntities={playback.activeEntities}
          activeAlerts={playback.activeAlerts}
          resolvedPoints={playback.resolvedPoints}
          historicalTrails={playback.historicalTrails}
          showTrails={playback.showTrails}
          mapStyle={playback.mapStyle}
          currentStepIndex={playback.currentStepIndex}
        />

        {/* Telemetry HUD Drawer */}
        <TelemetryHUD
          metadata={playback.metadata}
          activeEntities={playback.activeEntities}
          activeAlerts={playback.activeAlerts}
          resolvedPoints={playback.resolvedPoints}
          clearanceRate={playback.clearanceRate}
          currentTime={playback.currentTime}
          totalFrames={playback.totalFrames}
        />

        {/* Floating Playback Controls Bar */}
        <PlaybackControls
          currentTime={playback.currentTime}
          totalFrames={playback.totalFrames}
          isPlaying={playback.isPlaying}
          onTogglePlay={playback.togglePlay}
          onReset={playback.reset}
          onSeek={playback.seek}
          onStepForward={playback.stepForward}
          onStepBackward={playback.stepBackward}
          speed={playback.speed}
          onChangeSpeed={playback.setSpeed}
          loop={playback.loop}
          onToggleLoop={() => playback.setLoop(l => !l)}
          intervalMs={playback.metadata?.default_step_interval_ms || 1000}
        />
      </main>

      {/* Custom Scenario Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
