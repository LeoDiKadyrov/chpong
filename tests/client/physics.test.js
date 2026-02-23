/**
 * physics.test.js — Unit tests for client/src/game/physics.js
 * Tests ball movement, wall bounces, paddle collisions, goal detection,
 * speed increments, and ball reset behaviour.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { updatePhysics, resetBall } from '../../client/src/game/physics.js';
import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  BALL_MAX_SPEED,
  PLAYER_1,
  PLAYER_2,
} from '@shared/constants.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Creates a default game state. Ball starts at centre, moving right. */
function makeState(overrides = {}) {
  return {
    paddle1: {
      x: PADDLE_MARGIN,
      y: FIELD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      vy: 0,
      ...overrides.paddle1,
    },
    paddle2: {
      x: FIELD_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
      y: FIELD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      vy: 0,
      ...overrides.paddle2,
    },
    ball: {
      x: FIELD_WIDTH / 2,
      y: FIELD_HEIGHT / 2,
      vx: 4,
      vy: 0,
      ...overrides.ball,
    },
  };
}

// ─── Ball Movement ───────────────────────────────────────────────────────────

describe('ball movement', () => {
  it('moves by its velocity each tick (dt=1)', () => {
    const state = makeState({ ball: { x: 400, y: 300, vx: 5, vy: 3 } });
    updatePhysics(state, 1);
    expect(state.ball.x).toBeCloseTo(405);
    expect(state.ball.y).toBeCloseTo(303);
  });

  it('scales distance with dt (dt=2 moves twice as far)', () => {
    const s1 = makeState({ ball: { x: 400, y: 300, vx: 5, vy: 0 } });
    const s2 = makeState({ ball: { x: 400, y: 300, vx: 5, vy: 0 } });
    updatePhysics(s1, 1);
    updatePhysics(s2, 2);
    expect(s2.ball.x - 400).toBeCloseTo(2 * (s1.ball.x - 400));
  });
});

// ─── Wall Bounces ────────────────────────────────────────────────────────────

describe('wall bounces', () => {
  it('bounces off the top wall — vy reverses', () => {
    const state = makeState({ ball: { x: 400, y: BALL_RADIUS, vx: 0, vy: -5 } });
    const { wallBounce } = updatePhysics(state, 1);
    expect(state.ball.vy).toBeGreaterThan(0);
    expect(wallBounce).toBe(true);
  });

  it('bounces off the bottom wall — vy reverses', () => {
    const state = makeState({ ball: { x: 400, y: FIELD_HEIGHT - BALL_RADIUS, vx: 0, vy: 5 } });
    const { wallBounce } = updatePhysics(state, 1);
    expect(state.ball.vy).toBeLessThan(0);
    expect(wallBounce).toBe(true);
  });

  it('does NOT set wallBounce when ball is in the middle', () => {
    const state = makeState({ ball: { x: 400, y: 300, vx: 2, vy: 2 } });
    const { wallBounce } = updatePhysics(state, 1);
    expect(wallBounce).toBe(false);
  });

  it('clamps ball.y to BALL_RADIUS after top bounce', () => {
    const state = makeState({ ball: { x: 400, y: 0, vx: 0, vy: -5 } });
    updatePhysics(state, 1);
    expect(state.ball.y).toBeGreaterThanOrEqual(BALL_RADIUS);
  });
});

// ─── Paddle Collisions ───────────────────────────────────────────────────────

describe('paddle collisions', () => {
  it('detects paddle1 hit and reverses vx', () => {
    // Place ball just touching paddle1's right edge, moving left
    const state = makeState({
      ball: {
        x: PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS - 1,
        y: FIELD_HEIGHT / 2,
        vx: -6,
        vy: 0,
      },
    });
    const { paddleHit } = updatePhysics(state, 1);
    expect(paddleHit).toBe(PLAYER_1);
    expect(state.ball.vx).toBeGreaterThan(0);
  });

  it('detects paddle2 hit and reverses vx', () => {
    const paddle2x = FIELD_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;
    const state = makeState({
      ball: {
        x: paddle2x - BALL_RADIUS + 1,
        y: FIELD_HEIGHT / 2,
        vx: 6,
        vy: 0,
      },
    });
    const { paddleHit } = updatePhysics(state, 1);
    expect(paddleHit).toBe(PLAYER_2);
    expect(state.ball.vx).toBeLessThan(0);
  });

  it('does NOT detect paddle1 hit when ball is moving away (vx > 0)', () => {
    const state = makeState({
      ball: {
        x: PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS - 1,
        y: FIELD_HEIGHT / 2,
        vx: 6,  // moving RIGHT — away from paddle1
        vy: 0,
      },
    });
    const { paddleHit } = updatePhysics(state, 1);
    expect(paddleHit).toBeNull();
  });

  it('increases ball speed on paddle hit (capped at BALL_MAX_SPEED)', () => {
    const state = makeState({
      ball: {
        x: PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS - 1,
        y: FIELD_HEIGHT / 2,
        vx: -6,
        vy: 0,
      },
    });
    const speedBefore = Math.sqrt(6 ** 2);
    updatePhysics(state, 1);
    const speedAfter = Math.sqrt(state.ball.vx ** 2 + state.ball.vy ** 2);
    expect(speedAfter).toBeGreaterThanOrEqual(speedBefore);
    expect(speedAfter).toBeLessThanOrEqual(BALL_MAX_SPEED + 0.01);
  });

  it('hitting the centre deadzone produces near-zero vy', () => {
    const state = makeState({
      ball: {
        x: PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS - 1,
        y: FIELD_HEIGHT / 2, // dead centre
        vx: -6,
        vy: 0,
      },
    });
    updatePhysics(state, 1);
    expect(Math.abs(state.ball.vy)).toBeLessThan(1);
  });
});

// ─── Goal Detection ──────────────────────────────────────────────────────────

describe('goal detection', () => {
  it('scores for PLAYER_2 when ball exits the left wall', () => {
    // y: 50 — above the paddle (paddle spans ~260–340), so no collision is triggered
    const state = makeState({ ball: { x: -BALL_RADIUS - 1, y: 50, vx: -4, vy: 0 } });
    const { scorer } = updatePhysics(state, 1);
    expect(scorer).toBe(PLAYER_2);
  });

  it('scores for PLAYER_1 when ball exits the right wall', () => {
    // y: 50 — above the paddle, so no collision is triggered
    const state = makeState({ ball: { x: FIELD_WIDTH + BALL_RADIUS + 1, y: 50, vx: 4, vy: 0 } });
    const { scorer } = updatePhysics(state, 1);
    expect(scorer).toBe(PLAYER_1);
  });

  it('returns null scorer when ball is in play', () => {
    const state = makeState();
    const { scorer } = updatePhysics(state, 1);
    expect(scorer).toBeNull();
  });
});

// ─── resetBall ───────────────────────────────────────────────────────────────

describe('resetBall', () => {
  it('places the ball at the centre of the field', () => {
    const ball = { x: 100, y: 100, vx: 5, vy: 5 };
    resetBall(ball, PLAYER_1);
    expect(ball.x).toBe(FIELD_WIDTH / 2);
    expect(ball.y).toBe(FIELD_HEIGHT / 2);
  });

  it('gives the ball at least BALL_INITIAL_SPEED', () => {
    const ball = { x: 0, y: 0, vx: 0, vy: 0 };
    resetBall(ball, PLAYER_1);
    const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
    expect(speed).toBeCloseTo(BALL_INITIAL_SPEED, 1);
  });

  it('serves toward PLAYER_2 side (vx < 0) when PLAYER_1 scored', () => {
    // When P1 scores, P2 gets the serve — ball goes left (toward P1 goal)
    const ball = { x: 0, y: 0, vx: 0, vy: 0 };
    resetBall(ball, PLAYER_1);
    expect(ball.vx).toBeLessThan(0);
  });

  it('serves toward PLAYER_1 side (vx > 0) when PLAYER_2 scored', () => {
    const ball = { x: 0, y: 0, vx: 0, vy: 0 };
    resetBall(ball, PLAYER_2);
    expect(ball.vx).toBeGreaterThan(0);
  });
});
