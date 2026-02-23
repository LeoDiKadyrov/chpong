import React, { useState, useEffect, useRef } from 'react';
import soundManager from '../audio/soundManager.js';
import { setGraphicsQuality } from '../game/renderer.js';
import {
  GRAPHICS_QUALITY_KEY,
  GRAPHICS_QUALITY_HIGH,
  GRAPHICS_QUALITY_LOW,
} from '@shared/constants.js';
import '../styles/VolumeControl.css';

const STORAGE_KEY = 'dialoguePong_audio';

/**
 * VolumeControl — small floating panel for audio settings.
 * Reads/writes to localStorage for persistence across sessions.
 * Sits inside the game layout; positioned via CSS.
 */
function VolumeControl() {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [musicVol, setMusicVol] = useState(0.4);
  const [sfxVol, setSfxVol] = useState(0.7);
  const [quality, setQualityState] = useState(
    () => (typeof localStorage !== 'undefined' && localStorage.getItem(GRAPHICS_QUALITY_KEY)) || GRAPHICS_QUALITY_HIGH
  );
  const panelRef = useRef(null);

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.muted !== undefined)    setMuted(saved.muted);
      if (saved.musicVol !== undefined) setMusicVol(saved.musicVol);
      if (saved.sfxVol !== undefined)   setSfxVol(saved.sfxVol);

      soundManager.setMuted(saved.muted ?? false);
      soundManager.setMusicVolume(saved.musicVol ?? 0.4);
      soundManager.setSfxVolume(saved.sfxVol ?? 0.7);
      if (saved.quality !== undefined) {
        setQualityState(saved.quality);
        setGraphicsQuality(saved.quality);
      }
    } catch (_) { /* malformed localStorage — ignore */ }
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const persist = (update) => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, ...update }));
    } catch (_) { /* ignore */ }
  };

  const handleMute = () => {
    const next = !muted;
    setMuted(next);
    soundManager.setMuted(next);
    persist({ muted: next });
  };

  const handleMusicVol = (e) => {
    const v = parseFloat(e.target.value);
    setMusicVol(v);
    soundManager.setMusicVolume(v);
    persist({ musicVol: v });
  };

  const handleSfxVol = (e) => {
    const v = parseFloat(e.target.value);
    setSfxVol(v);
    soundManager.setSfxVolume(v);
    persist({ sfxVol: v });
  };

  const handleQuality = (q) => {
    setQualityState(q);
    setGraphicsQuality(q);
    persist({ quality: q });
  };

  return (
    <div className="volume-control" ref={panelRef}>
      <button
        className={`volume-toggle ${muted ? 'muted' : ''}`}
        onClick={handleMute}
        title={muted ? 'Unmute' : 'Mute'}
        aria-label={muted ? 'Unmute audio' : 'Mute audio'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <button
        className="volume-settings-btn"
        onClick={() => setOpen((o) => !o)}
        title="Audio settings"
        aria-label="Open audio settings"
      >
        ⚙
      </button>

      {open && (
        <div className="volume-panel">
          <h4 className="volume-panel-title">Audio</h4>

          <label className="volume-label">
            Music
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVol}
              onChange={handleMusicVol}
              className="volume-slider"
              aria-label="Music volume"
            />
            <span className="volume-value">{Math.round(musicVol * 100)}%</span>
          </label>

          <label className="volume-label">
            SFX
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={handleSfxVol}
              className="volume-slider"
              aria-label="SFX volume"
            />
            <span className="volume-value">{Math.round(sfxVol * 100)}%</span>
          </label>

          <div className="volume-quality">
            <span className="volume-label-text">Quality</span>
            <button
              className={`quality-btn ${quality === GRAPHICS_QUALITY_HIGH ? 'active' : ''}`}
              onClick={() => handleQuality(GRAPHICS_QUALITY_HIGH)}
            >High</button>
            <button
              className={`quality-btn ${quality === GRAPHICS_QUALITY_LOW ? 'active' : ''}`}
              onClick={() => handleQuality(GRAPHICS_QUALITY_LOW)}
            >Low</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolumeControl;
