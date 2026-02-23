import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  CENTER_LINE_WIDTH,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  COLOR_BACKGROUND_START,
  COLOR_BACKGROUND_END,
  COLOR_CENTER_LINE,
  CENTER_LINE_ALPHA,
  COLOR_PADDLE_P1,
  COLOR_PADDLE_P2,
  COLOR_BALL,
  COLOR_TEXT,
  COLOR_TEXT_P2,
  PADDLE_GLOW_BLUR,
  BALL_GLOW_BLUR,
  FONT_FAMILY,
  FONT_SIZE_SCORE,
  FONT_SIZE_LABEL,
  GRAPHICS_QUALITY_KEY,
  GRAPHICS_QUALITY_HIGH,
} from '@shared/constants.js';
import { drawParticles } from './particles.js';

// Cache canvas 2D contexts — avoids repeated getContext() calls on the hot render path
const ctxCache = new WeakMap();
function getCtx(canvas) {
  if (!ctxCache.has(canvas)) ctxCache.set(canvas, canvas.getContext('2d'));
  return ctxCache.get(canvas);
}

// Graphics quality — read from localStorage, updated via setGraphicsQuality()
let _graphicsQuality =
  (typeof localStorage !== 'undefined' && localStorage.getItem(GRAPHICS_QUALITY_KEY)) ||
  GRAPHICS_QUALITY_HIGH;

/**
 * Change graphics quality at runtime.
 * 'high' = full glow/shadowBlur effects (default)
 * 'low'  = no shadowBlur (better performance on low-end devices)
 * @param {string} quality - 'high' | 'low'
 */
export function setGraphicsQuality(quality) {
  _graphicsQuality = quality;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(GRAPHICS_QUALITY_KEY, quality);
  }
}

function isHighQuality() {
  return _graphicsQuality === GRAPHICS_QUALITY_HIGH;
}

/**
 * Renders background with gradient
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function drawBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, FIELD_HEIGHT);
  gradient.addColorStop(0, COLOR_BACKGROUND_START);
  gradient.addColorStop(1, COLOR_BACKGROUND_END);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
}

/**
 * Renders dashed center line
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function drawCenterLine(ctx) {
  ctx.strokeStyle = COLOR_CENTER_LINE;
  ctx.globalAlpha = CENTER_LINE_ALPHA;
  ctx.lineWidth = CENTER_LINE_WIDTH;
  ctx.setLineDash([10, 10]);

  ctx.beginPath();
  ctx.moveTo(FIELD_WIDTH / 2, 0);
  ctx.lineTo(FIELD_WIDTH / 2, FIELD_HEIGHT);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

/**
 * Renders a paddle with glow effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} paddle - Paddle state
 * @param {string} color - Color hex code
 */
export function drawPaddle(ctx, paddle, color) {
  // Draw glow
  ctx.shadowColor = color;
  ctx.shadowBlur = isHighQuality() ? PADDLE_GLOW_BLUR : 0;
  ctx.fillStyle = color;
  ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Renders the ball with glow effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object} ball - Ball state
 */
export function drawBall(ctx, ball) {
  // Draw glow
  ctx.shadowColor = COLOR_BALL;
  ctx.shadowBlur = isHighQuality() ? BALL_GLOW_BLUR : 0;
  ctx.fillStyle = COLOR_BALL;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Renders score display for both players
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} score1 - Player 1 score
 * @param {number} score2 - Player 2 score
 */
export function drawScores(ctx, score1, score2) {
  ctx.font = `bold ${FONT_SIZE_SCORE}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';

  // Player 1 score (left side)
  ctx.fillStyle = COLOR_TEXT;
  ctx.fillText(score1.toString(), FIELD_WIDTH / 4, 60);

  // Player 2 score (right side)
  ctx.fillStyle = COLOR_TEXT_P2;
  ctx.fillText(score2.toString(), (FIELD_WIDTH * 3) / 4, 60);

  // Labels
  ctx.font = `${FONT_SIZE_LABEL}px ${FONT_FAMILY}`;
  ctx.fillStyle = COLOR_TEXT;
  ctx.fillText('P1', FIELD_WIDTH / 4, 85);
  ctx.fillStyle = COLOR_TEXT_P2;
  ctx.fillText('P2', (FIELD_WIDTH * 3) / 4, 85);
}

/**
 * Draws the ball motion trail — last N positions with decreasing alpha.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<{x: number, y: number}>} trail - Array of previous ball positions (oldest first)
 */
export function drawBallTrail(ctx, trail) {
  if (!trail || trail.length === 0) return;
  const steps = trail.length;
  for (let i = 0; i < steps; i++) {
    const alpha = ((i + 1) / steps) * 0.25; // 0 → 0.25 (most recent = most opaque)
    const size = BALL_RADIUS * ((i + 1) / steps) * 0.85;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = COLOR_BALL;
    ctx.shadowColor = COLOR_BALL;
    ctx.shadowBlur = isHighQuality() ? 4 : 0;
    ctx.beginPath();
    ctx.arc(trail[i].x, trail[i].y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Complete render pass - clears canvas and draws all elements
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {object} gameState - Game state
 * @param {object} scores - Score object { player1, player2 }
 * @param {object[]} [particles] - Optional particle array (Phase 5)
 * @param {Array<{x: number, y: number}>} [trail] - Optional ball trail (Phase 5)
 */
export function renderFrame(canvas, gameState, scores, particles, trail) {
  const ctx = getCtx(canvas);

  // Clear and background
  drawBackground(ctx);
  drawCenterLine(ctx);

  // Ball trail (behind ball)
  if (trail && trail.length > 0) drawBallTrail(ctx, trail);

  // Game elements
  drawPaddle(ctx, gameState.paddle1, COLOR_PADDLE_P1);
  drawPaddle(ctx, gameState.paddle2, COLOR_PADDLE_P2);
  drawBall(ctx, gameState.ball);

  // Particles (on top of everything)
  if (particles && particles.length > 0) drawParticles(ctx, particles);

  // UI
  drawScores(ctx, scores.player1, scores.player2);
}
