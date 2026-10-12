import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Compass, 
  Car, 
  Radio, 
  MapPin 
} from 'lucide-react';
import { DEMO_PRESETS } from '../hooks/usePlayback';

export default function UploadModal({ isOpen, onClose, onRegisterScenario }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loadingDemoId, setLoadingDemoId] = useState(null);

  if (!isOpen) return null;

  const handleSelectDemoPreset = async (preset) => {
    setLoadingDemoId(preset.id);
    setError(null);
    try {
      const res = await fetch(preset.file);
      if (!res.ok) throw new Error(`Could not load preset file: ${preset.file}`);
      const data = await res.json();
      setName(preset.name);
      setDescription(preset.description);
      setJsonText(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(`Failed to load preset: ${err.message}`);
    } finally {
      setLoadingDemoId(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (jsonErr) {
        throw new Error('Invalid JSON format. Please ensure valid JSON structure.');
      }

      if (!Array.isArray(parsed)) {
        throw new Error('Expected JSON array of frames: [{"time": 0, "blue": [...], "yellow": [...]}]');
      }

      await onRegisterScenario(
        name || 'Custom Spatial Scenario',
        description || 'User-provided trajectory dataset',
        parsed
      );

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '620px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UploadCloud size={20} color="var(--accent-cyan)" />
            <span style={{ fontSize: '16px', fontWeight: 700 }}>
              Load Spatial Dataset for Visualization
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Demo Presets Section */}
        <div style={{
          background: 'rgba(0, 240, 255, 0.05)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#e0f2fe' }}>
              Quick Load Demo Presets (1-Click)
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectDemoPreset(preset)}
                disabled={loadingDemoId === preset.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: 'var(--text-main)',
                  fontSize: '11px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 600 }}>{preset.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {preset.total_frames} frames • {preset.id}
                  </div>
                </div>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '10px', fontWeight: 600 }}>
                  {loadingDemoId === preset.id ? '...' : 'Load'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Scenario Name
              </label>
              <input 
                type="text"
                placeholder="e.g. Corridor Run Beta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Description
              </label>
              <input 
                type="text"
                placeholder="Brief mission details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Trajectory Frames JSON
              </label>
              <label style={{
                fontSize: '11px',
                color: 'var(--accent-cyan)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FileText size={12} />
                <span>Upload .json file from demo_data/</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
            <textarea
              rows={7}
              placeholder='[&#10;  { "time": 0, "blue": [{ "lat": 28.61, "lng": 77.21 }], "yellow": [] },&#10;  { "time": 1, "blue": [{ "lat": 28.612, "lng": 77.212 }], "yellow": [] }&#10;]'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '10px',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-glass"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting || !jsonText.trim()}
              className="btn-glass active"
              style={{ minWidth: '130px' }}
            >
              {submitting ? 'Visualizing...' : 'Load & Visualize'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
