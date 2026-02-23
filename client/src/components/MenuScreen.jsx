import React, { useState } from 'react';
import HowToPlay from './HowToPlay.jsx';
import '../styles/MenuScreen.css';

/**
 * MenuScreen — Main menu with Local / Online game options and HowToPlay modal
 */
function MenuScreen({ onLocal, onOnline }) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="menu-container">
      <h1 className="menu-title">Dialogue Pong</h1>
      <p className="menu-subtitle">Turn Pong into a conversation with strangers</p>

      <div className="menu-buttons">
        <button className="menu-button menu-local" onClick={onLocal}>
          <span className="menu-button-icon">🎮</span>
          <span className="menu-button-text">Play Local</span>
          <span className="menu-button-desc">2 players, same screen</span>
        </button>

        <button className="menu-button menu-online" onClick={onOnline}>
          <span className="menu-button-icon">🌐</span>
          <span className="menu-button-text">Play Online</span>
          <span className="menu-button-desc">Find a stranger, play a game</span>
        </button>
      </div>

      <div className="menu-footer">
        <p>Each paddle hit forces you to type a message.</p>
        <p>What will you say?</p>
      </div>

      <button
        className="menu-howtoplay-btn"
        onClick={() => setShowHowToPlay(true)}
        aria-label="How to play"
      >
        ?
      </button>

      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
}

export default MenuScreen;
