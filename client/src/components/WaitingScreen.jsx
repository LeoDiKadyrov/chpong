import React from 'react';
import '../styles/WaitingScreen.css';

/**
 * WaitingScreen — Shown while in matchmaking queue
 * Props: onCancel (callback to leave queue and return to menu)
 */
function WaitingScreen({ onCancel }) {
  return (
    <div className="waiting-container">
      <h1 className="waiting-title">Searching for Opponent...</h1>

      <div className="waiting-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>

      <p className="waiting-text">
        Finding your next conversation partner...
      </p>

      <button className="waiting-cancel-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export default WaitingScreen;
