/**
 * particles.test.js — Unit tests for client/src/game/particles.js
 * Tests particle spawning, life decay, gravity, movement, and removal.
 */

import { describe, it, expect } from 'vitest';
import { spawnParticles, updateParticles } from '../../client/src/game/particles.js';

describe('spawnParticles', () => {
  it('adds exactly count particles to the array', () => {
    const arr = [];
    spawnParticles(arr, 100, 200, '#00D9FF', 5);
    expect(arr).toHaveLength(5);
  });

  it('defaults to 10 particles when count is omitted', () => {
    const arr = [];
    spawnParticles(arr, 100, 200, '#FF006E');
    expect(arr).toHaveLength(10);
  });

  it('appends to an existing array without replacing', () => {
    const arr = [];
    spawnParticles(arr, 100, 200, '#FFF', 3);
    spawnParticles(arr, 200, 300, '#FFF', 4);
    expect(arr).toHaveLength(7);
  });

  it('every particle has the correct color', () => {
    const arr = [];
    spawnParticles(arr, 0, 0, '#ABCDEF', 8);
    arr.forEach((p) => expect(p.color).toBe('#ABCDEF'));
  });

  it('every particle starts at the spawn position', () => {
    const arr = [];
    spawnParticles(arr, 123, 456, '#FFF', 6);
    arr.forEach((p) => {
      expect(p.x).toBe(123);
      expect(p.y).toBe(456);
    });
  });

  it('every particle starts with life = 1', () => {
    const arr = [];
    spawnParticles(arr, 0, 0, '#FFF', 5);
    arr.forEach((p) => expect(p.life).toBe(1.0));
  });

  it('particles have non-zero velocity (spread out)', () => {
    const arr = [];
    spawnParticles(arr, 0, 0, '#FFF', 20);
    const hasNonZeroVx = arr.some((p) => p.vx !== 0);
    const hasNonZeroVy = arr.some((p) => p.vy !== 0);
    expect(hasNonZeroVx).toBe(true);
    expect(hasNonZeroVy).toBe(true);
  });
});

describe('updateParticles', () => {
  it('decreases life for all particles each tick', () => {
    const arr = [];
    spawnParticles(arr, 0, 0, '#FFF', 5);
    updateParticles(arr, 1);
    arr.forEach((p) => expect(p.life).toBeLessThan(1));
  });

  it('moves particles by their velocity', () => {
    // Manually create a particle with known velocity
    const arr = [{ x: 100, y: 200, vx: 3, vy: -2, life: 1, decay: 0.01, size: 2, color: '#FFF' }];
    updateParticles(arr, 1);
    expect(arr[0].x).toBeCloseTo(103);
    // gravity updates vy AFTER position: y = 200 + (-2)*1 = 198, then vy becomes -1.85
    expect(arr[0].y).toBeCloseTo(198);
  });

  it('applies gravity — vy increases each tick', () => {
    const arr = [{ x: 0, y: 0, vx: 0, vy: 0, life: 1, decay: 0.01, size: 2, color: '#FFF' }];
    updateParticles(arr, 1);
    expect(arr[0].vy).toBeCloseTo(0.15);
  });

  it('scales movement with dt', () => {
    const arr1 = [{ x: 0, y: 0, vx: 4, vy: 0, life: 1, decay: 0.001, size: 2, color: '#FFF' }];
    const arr2 = [{ x: 0, y: 0, vx: 4, vy: 0, life: 1, decay: 0.001, size: 2, color: '#FFF' }];
    updateParticles(arr1, 1);
    updateParticles(arr2, 2);
    expect(arr2[0].x).toBeCloseTo(arr1[0].x * 2, 0);
  });

  it('removes particles when life drops to 0 or below', () => {
    // Particle with very high decay will die in one tick
    const arr = [{ x: 0, y: 0, vx: 0, vy: 0, life: 0.01, decay: 0.5, size: 1, color: '#FFF' }];
    updateParticles(arr, 1);
    expect(arr).toHaveLength(0);
  });

  it('keeps particles that still have life remaining', () => {
    const arr = [
      { x: 0, y: 0, vx: 0, vy: 0, life: 0.9, decay: 0.01, size: 1, color: '#FFF' },
      { x: 0, y: 0, vx: 0, vy: 0, life: 0.01, decay: 0.5, size: 1, color: '#FFF' }, // dies
    ];
    updateParticles(arr, 1);
    expect(arr).toHaveLength(1);
    expect(arr[0].life).toBeGreaterThan(0);
  });

  it('handles an empty array without throwing', () => {
    expect(() => updateParticles([], 1)).not.toThrow();
  });
});
