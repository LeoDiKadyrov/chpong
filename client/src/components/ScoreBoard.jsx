import React from 'react';

/**
 * ScoreBoard component - Displays scores for both players
 * Used in Phase 1 only; removed when dialogue mechanics added
 */
function ScoreBoard({ score1, score2 }) {
  return (
    <div className="scoreboard">
      <div className="score-container">
        <p className="score-label">Player 1</p>
        <p className="score-value p1">{score1}</p>
      </div>
      <div className="score-container">
        <p className="score-label">Player 2</p>
        <p className="score-value p2">{score2}</p>
      </div>
    </div>
  );
}

export default ScoreBoard;
