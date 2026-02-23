import React from 'react';

/**
 * RestartButton component - Button to reset game state
 */
function RestartButton({ onRestart }) {
  return (
    <button className="restart-button" onClick={onRestart}>
      Restart Game
    </button>
  );
}

export default RestartButton;
