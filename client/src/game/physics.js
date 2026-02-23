import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_MARGIN,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  BALL_MAX_SPEED,
  BALL_SPEED_INCREMENT,
  PADDLE_HIT_MAX_ANGLE,
  PADDLE_HIT_DEADZONE,
  SERVE_ANGLE_MAX,
  PLAYER_1,
  PLAYER_2,
} from '@shared/constants.js';

/**
 * Updates all physics for the game state
 * Moves paddles, ball, handles collisions, and goal detection
 * @param {object} gameState - Current game state
 * @param {number} dt - Delta time normalized to 60Hz (1.0 = one 60Hz frame). Defaults to 1.
 * @returns {object} { scorer, paddleHit } - Both are Player IDs or null (mutually exclusive per frame)
 */
export function updatePhysics(gameState, dt = 1) {
  const { paddle1, paddle2, ball } = gameState;
  let scorer = null;
  let paddleHit = null;
  let wallBounce = false;

  // Update paddle positions (clamped to field)
  paddle1.y = Math.max(0, Math.min(FIELD_HEIGHT - PADDLE_HEIGHT, paddle1.y + paddle1.vy * dt));
  paddle2.y = Math.max(0, Math.min(FIELD_HEIGHT - PADDLE_HEIGHT, paddle2.y + paddle2.vy * dt));

  // Update ball position
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Wall collisions (top and bottom)
  if (ball.y - BALL_RADIUS < 0) {
    ball.y = BALL_RADIUS;
    ball.vy = -ball.vy;
    wallBounce = true;
  }
  if (ball.y + BALL_RADIUS > FIELD_HEIGHT) {
    ball.y = FIELD_HEIGHT - BALL_RADIUS;
    ball.vy = -ball.vy;
    wallBounce = true;
  }

  // Paddle 1 collision (left side)
  if (
    ball.vx < 0 &&
    ball.x - BALL_RADIUS < paddle1.x + PADDLE_WIDTH &&
    ball.y > paddle1.y &&
    ball.y < paddle1.y + PADDLE_HEIGHT
  ) {
    handlePaddleCollision(ball, paddle1, 1);
    paddleHit = PLAYER_1;
  }

  // Paddle 2 collision (right side)
  if (
    ball.vx > 0 &&
    ball.x + BALL_RADIUS > paddle2.x &&
    ball.y > paddle2.y &&
    ball.y < paddle2.y + PADDLE_HEIGHT
  ) {
    handlePaddleCollision(ball, paddle2, -1);
    paddleHit = PLAYER_2;
  }

  // Goal detection
  if (ball.x + BALL_RADIUS < 0) scorer = PLAYER_2; // Player 2 scores
  if (ball.x - BALL_RADIUS > FIELD_WIDTH) scorer = PLAYER_1; // Player 1 scores

  return { scorer, paddleHit, wallBounce };
}

/**
 * Handles paddle collision physics
 * Calculates bounce angle based on where ball hits paddle
 * @param {object} ball - Ball state
 * @param {object} paddle - Paddle state
 * @param {number} direction - 1 for right-moving, -1 for left-moving
 */
function handlePaddleCollision(ball, paddle, direction) {
  // Push ball out of paddle to prevent tunneling
  const penetration = direction > 0
    ? paddle.x + PADDLE_WIDTH - (ball.x - BALL_RADIUS)
    : (ball.x + BALL_RADIUS) - paddle.x;
  ball.x += penetration * direction;

  // Calculate hit position on paddle (0 = center, -1 = top, 1 = bottom)
  const paddleCenter = paddle.y + PADDLE_HEIGHT / 2;
  const hitOffset = (ball.y - paddleCenter) / (PADDLE_HEIGHT / 2);
  const clampedOffset = Math.max(-1, Math.min(1, hitOffset));

  // Determine if hit is in deadzone (center = purely horizontal)
  const isDeadzone = Math.abs(clampedOffset) < PADDLE_HIT_DEADZONE;

  // Calculate bounce angle
  let angle = 0; // radians
  if (!isDeadzone) {
    // Scale offset to angle: edges hit at ±max angle
    const angleSign = clampedOffset > 0 ? 1 : -1;
    const angleAmount = (Math.abs(clampedOffset) - PADDLE_HIT_DEADZONE) / (1 - PADDLE_HIT_DEADZONE);
    angle = (angleAmount * PADDLE_HIT_MAX_ANGLE * Math.PI) / 180 * angleSign;
  }

  // Apply angle to velocity
  const speed = Math.min(
    Math.sqrt(ball.vx ** 2 + ball.vy ** 2) + BALL_SPEED_INCREMENT,
    BALL_MAX_SPEED
  );

  ball.vx = speed * Math.cos(angle) * direction;
  ball.vy = speed * Math.sin(angle);
}

/**
 * Resets ball to center with random serve angle toward scorer
 * @param {object} ball - Ball state
 * @param {string} scorer - PLAYER_1 or PLAYER_2 (who just scored)
 */
export function resetBall(ball, scorer) {
  ball.x = FIELD_WIDTH / 2;
  ball.y = FIELD_HEIGHT / 2;

  // Random angle: ±SERVE_ANGLE_MAX degrees
  const randomAngle = (Math.random() - 0.5) * 2 * SERVE_ANGLE_MAX;
  const angleRad = (randomAngle * Math.PI) / 180;

  // Serve toward opposite of scorer
  const serveDirection = scorer === PLAYER_1 ? -1 : 1;

  ball.vx = BALL_INITIAL_SPEED * Math.cos(angleRad) * serveDirection;
  ball.vy = BALL_INITIAL_SPEED * Math.sin(angleRad);
}
