/**
 * particles.js — Canvas-based particle system for Dialogue Pong
 * Spawns sparks on paddle hits; particles fade out and die over ~0.4s.
 * All state lives in a plain array (no React state) so it runs inside the game loop.
 */

/**
 * Create a single particle at (x, y) in a given color.
 * @param {number} x
 * @param {number} y
 * @param {string} color - CSS hex color
 * @returns {object} Particle state
 */
function createParticle(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 5 + 1.5;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1.0,         // 1 = full life, 0 = dead
    decay: Math.random() * 0.04 + 0.04,  // how fast life drains per frame
    size: Math.random() * 2.5 + 1,
    color,
  };
}

/**
 * Spawn n particles at (x, y) in the given color and push them into the array.
 * Mutates the particles array in place (append).
 * @param {object[]} particles - Existing particle array (mutated)
 * @param {number} x
 * @param {number} y
 * @param {string} color - CSS hex color
 * @param {number} count - Number of particles to spawn (default 10)
 */
export function spawnParticles(particles, x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(x, y, color));
  }
}

/**
 * Update all particles — move and drain life. Remove dead particles.
 * Mutates the particles array in place (removes dead entries).
 * @param {object[]} particles - Particle array (mutated)
 * @param {number} dt - Delta time in 60Hz units (1.0 = one 60Hz frame)
 */
export function updateParticles(particles, dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    // Gravity — slight downward pull for natural feel
    p.vy += 0.15 * dt;
    p.life -= p.decay * dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

/**
 * Draw all particles onto the canvas context.
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {object[]} particles - Particle array
 */
export function drawParticles(ctx, particles) {
  if (particles.length === 0) return;

  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
}
