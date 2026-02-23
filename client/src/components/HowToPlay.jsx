import React from 'react';
import '../styles/HowToPlay.css';

/**
 * HowToPlay — Modal overlay explaining game mechanics.
 * Closed by clicking the X button or the backdrop.
 * @param {function} onClose - callback to close modal
 */
function HowToPlay({ onClose }) {
  return (
    <div className="howtoplay-backdrop" onClick={onClose}>
      <div className="howtoplay-modal" onClick={(e) => e.stopPropagation()}>
        <button className="howtoplay-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="howtoplay-title">How to Play</h2>

        <ul className="howtoplay-list">
          <li>
            <span className="howtoplay-icon">🏓</span>
            <span>Hit the ball with your paddle to trigger a mandatory message.</span>
          </li>
          <li>
            <span className="howtoplay-icon">✍️</span>
            <span>You have <strong>30 seconds</strong> to type something — anything!</span>
          </li>
          <li>
            <span className="howtoplay-icon">💬</span>
            <span>Your dialogue appears in the feed below the game.</span>
          </li>
          <li>
            <span className="howtoplay-icon">🎯</span>
            <span>Score goals if you like — but the real point is the conversation.</span>
          </li>
        </ul>

        <div className="howtoplay-controls">
          <h3 className="howtoplay-controls-title">Controls</h3>
          <div className="howtoplay-controls-grid">
            <span className="howtoplay-player">Player 1</span>
            <span className="howtoplay-keys">W / S</span>
            <span className="howtoplay-player">Player 2</span>
            <span className="howtoplay-keys">↑ / ↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToPlay;
