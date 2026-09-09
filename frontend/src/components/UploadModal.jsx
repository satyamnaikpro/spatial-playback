import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

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

      const res = await fetch('/api/scenarios/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Custom Scenario',
          description: description || 'Uploaded trajectory data',
          frames: parsed
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to upload scenario');
      }

      const newScenario = await res.json();
      onUploadSuccess(newScenario.id);
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
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UploadCloud size={20} color="var(--accent-cyan)" />
            <span style={{ fontSize: '16px', fontWeight: 700 }}>
              Load Custom Spatial Dataset
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
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
                placeholder="e.g. Route Testing Delta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#fff',
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
                placeholder="Brief mission description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#fff',
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
                <span>Upload .json file</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
            <textarea
              rows={8}
              placeholder='[&#10;  { "time": 0, "blue": [{ "lat": 28.61, "lng": 77.21 }], "yellow": [] },&#10;  { "time": 1, "blue": [{ "lat": 28.612, "lng": 77.212 }], "yellow": [] }&#10;]'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(5, 8, 16, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px',
                color: '#38bdf8',
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
              style={{ minWidth: '120px' }}
            >
              {submitting ? 'Processing...' : 'Load Scenario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
