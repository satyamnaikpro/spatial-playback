import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapViewer from './components/MapViewer';
import PlaybackControls from './components/PlaybackControls';
import TelemetryHUD from './components/TelemetryHUD';
import UploadModal from './components/UploadModal';
import { usePlayback } from './hooks/usePlayback';

export default function App() {
  const playback = usePlayback();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Theme state: 'light' by default on app opening
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('spatial_playback_theme') || 'light';
  });

  // Layer visibility states for map area customization
  const [showAlerts, setShowAlerts] = useState(true);
  const [showResolved, setShowResolved] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showRangeRings, setShowRangeRings] = useState(true);
  const [cameraAction, setCameraAction] = useState(null);

  // Sync theme with document root attribute & local storage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spatial_playback_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      // When switching to dark mode, automatically switch to dark mode map
      if (nextTheme === 'dark') {
        if (playback.mapStyle === 'street' || playback.mapStyle === 'light') {
          playback.setMapStyle('dark');
        }
      } else {
        // When switching back to light mode, restore street map
        if (playback.mapStyle === 'dark') {
          playback.setMapStyle('street');
        }
      }
      return nextTheme;
    });
  };

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
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playback]);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-dark)'
    }}>
      {/* Docked Top Bar Header with Dark/Light Theme Icon */}
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        theme={theme}
        onToggleTheme={toggleTheme}
        scenarios={playback.scenarios}
        currentScenarioId={playback.currentScenarioId}
        onSelectScenario={playback.setCurrentScenarioId}
        onOpenUpload={() => setIsUploadOpen(true)}
        totalFrames={playback.totalFrames}
        activeEntitiesCount={playback.activeEntities.length}
        activeAlertsCount={playback.activeAlerts.length}
        resolvedCount={playback.resolvedPoints.length}
        clearanceRate={playback.clearanceRate}
        isLiveBackend={playback.isLiveBackend}
        currentTime={playback.currentTime}
      />

      {/* Main Workspace: Collapsible Sidebar + Map Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 56px)',
        overflow: 'hidden'
      }}>
        {/* Sidebar Controls for Map Area & Layers */}
        <Sidebar
          isOpen={sidebarOpen}
          theme={theme}
          onToggleOpen={() => setSidebarOpen(o => !o)}
          mapStyle={playback.mapStyle}
          onSelectMapStyle={playback.setMapStyle}
          showTrails={playback.showTrails}
          onToggleTrails={() => playback.setShowTrails(t => !t)}
          showAlerts={showAlerts}
          onToggleAlerts={() => setShowAlerts(a => !a)}
          showResolved={showResolved}
          onToggleResolved={() => setShowResolved(r => !r)}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(l => !l)}
          showRangeRings={showRangeRings}
          onToggleRangeRings={() => setShowRangeRings(rr => !rr)}
          scenarios={playback.scenarios}
          currentScenarioId={playback.currentScenarioId}
          onSelectScenario={playback.setCurrentScenarioId}
          activeEntities={playback.activeEntities}
          activeAlerts={playback.activeAlerts}
          resolvedPoints={playback.resolvedPoints}
          onCameraAction={setCameraAction}
          onOpenUpload={() => setIsUploadOpen(true)}
          metadata={playback.metadata}
        />

        {/* Primary Interactive Map View Area */}
        <main style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}>
          <MapViewer
            metadata={playback.metadata}
            activeEntities={playback.activeEntities}
            activeAlerts={playback.activeAlerts}
            resolvedPoints={playback.resolvedPoints}
            historicalTrails={playback.historicalTrails}
            showTrails={playback.showTrails}
            showAlerts={showAlerts}
            showResolved={showResolved}
            showLabels={showLabels}
            showRangeRings={showRangeRings}
            mapStyle={playback.mapStyle}
            currentStepIndex={playback.currentStepIndex}
            cameraAction={cameraAction}
            sidebarOpen={sidebarOpen}
          />

          {/* Telemetry Live Results Card (Docked on Right Side) */}
          <TelemetryHUD
            metadata={playback.metadata}
            activeEntities={playback.activeEntities}
            activeAlerts={playback.activeAlerts}
            resolvedPoints={playback.resolvedPoints}
            clearanceRate={playback.clearanceRate}
            currentTime={playback.currentTime}
            totalFrames={playback.totalFrames}
            onCameraAction={setCameraAction}
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
      </div>

      {/* Custom Scenario Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onRegisterScenario={playback.registerCustomScenario}
      />
    </div>
  );
}
