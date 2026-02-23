/**
 * Simple FIFO matchmaking queue
 * Pairs waiting players into rooms
 */

const waiting = []; // Array of { socket, joinedAt }

/**
 * Add a socket to the waiting queue
 * @param {Socket} socket - Socket.io socket
 */
export function addToQueue(socket) {
  waiting.push({ socket, joinedAt: Date.now() });
}

/**
 * Remove a socket from the queue
 * @param {string} socketId - Socket ID
 * @returns {boolean} True if removed, false if not found
 */
export function removeFromQueue(socketId) {
  const idx = waiting.findIndex((entry) => entry.socket.id === socketId);
  if (idx !== -1) {
    waiting.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Try to match two players from the queue
 * @returns {{ p1Socket, p2Socket }} or null if not enough players
 */
export function tryMatch() {
  if (waiting.length >= 2) {
    const p1Entry = waiting.shift();
    const p2Entry = waiting.shift();
    return {
      p1Socket: p1Entry.socket,
      p2Socket: p2Entry.socket,
    };
  }
  return null;
}

/**
 * Get current queue length
 * @returns {number}
 */
export function getQueueLength() {
  return waiting.length;
}
