import { updateInput } from './input.js';
import { updatePhysics, resetBall } from './physics.js';
import { renderFrame } from './renderer.js';
import { updateParticles } from './particles.js';

// Maximum ball trail length (positions stored)
const TRAIL_MAX = 6;

/**
 * Creates a game loop using requestAnimationFrame
 * @param {object} refs - Object containing canvas, gameState, keys, gameLoop,
 *                        and optional particlesRef / ballTrailRef
 * @param {Function} onGoal - Callback when a goal is scored: (scorer) => void
 * @param {Function} onPaddleHit - Callback when ball hits a paddle: (hitter) => void
 * @param {Function} [onWallBounce] - Optional callback when ball hits top/bottom wall
 * @returns {object} Object with start() and stop() functions
 */
export function createGameLoop(refs, onGoal, onPaddleHit, onWallBounce) {
  let isRunning = false;
  let lastFrameTime = 0;

  /**
   * Main game loop iteration
   * @param {number} currentTime - Timestamp from requestAnimationFrame
   */
  const tick = (currentTime) => {
    if (!isRunning) return;

    // Calculate delta time, capped at 50ms to prevent spiral of death on tab blur
    const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.05);
    lastFrameTime = currentTime;

    // Normalize dt to 60Hz units (1.0 = one 60Hz frame) so physics speed is
    // frame-rate-independent and matches the server's fixed 60Hz tick rate.
    const dt = deltaTime * 60;

    // Update
    updateInput(refs.keysRef.current, refs.gameStateRef.current);
    const { scorer, paddleHit, wallBounce } = updatePhysics(refs.gameStateRef.current, dt);

    // Wall bounce detected
    if (wallBounce && onWallBounce) {
      onWallBounce();
    }

    // Paddle hit detected - pause game for dialogue (Phase 2+)
    if (paddleHit && onPaddleHit) {
      isRunning = false;
      cancelAnimationFrame(refs.gameLoopRef.current);
      refs.gameLoopRef.current = null;
      onPaddleHit(paddleHit);
      return;  // Don't render or schedule next frame
    }

    // Goal detected
    if (scorer) {
      resetBall(refs.gameStateRef.current.ball, scorer);
      // Clear trail on goal so old positions don't linger at wrong spot
      if (refs.ballTrailRef) refs.ballTrailRef.current = [];
      onGoal(scorer);
    }

    // Update particles (Phase 5)
    if (refs.particlesRef) {
      updateParticles(refs.particlesRef.current, dt);
    }

    // Update ball trail (Phase 5)
    if (refs.ballTrailRef) {
      const { ball } = refs.gameStateRef.current;
      refs.ballTrailRef.current.push({ x: ball.x, y: ball.y });
      if (refs.ballTrailRef.current.length > TRAIL_MAX) {
        refs.ballTrailRef.current.shift();
      }
    }

    // Render
    renderFrame(
      refs.canvasRef.current,
      refs.gameStateRef.current,
      refs.scoresRef.current,
      refs.particlesRef?.current,
      refs.ballTrailRef?.current,
    );

    // Schedule next frame
    refs.gameLoopRef.current = requestAnimationFrame(tick);
  };

  return {
    /**
     * Start the game loop
     */
    start() {
      if (isRunning) return;
      isRunning = true;
      lastFrameTime = performance.now();
      refs.gameLoopRef.current = requestAnimationFrame(tick);
    },

    /**
     * Stop the game loop
     */
    stop() {
      isRunning = false;
      if (refs.gameLoopRef.current) {
        cancelAnimationFrame(refs.gameLoopRef.current);
        refs.gameLoopRef.current = null;
      }
    },
  };
}
