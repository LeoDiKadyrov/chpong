/**
 * GameRoom — Server-side game instance
 * Owns authoritative game state and physics loop
 */

import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  BALL_RADIUS,
  BALL_INITIAL_SPEED,
  PADDLE_SPEED,
  PLAYER_1,
  PLAYER_2,
  SERVER_TICK_MS,
  DIALOGUE_TIMEOUT_MS,
  EV_GAME_STATE,
  EV_PADDLE_HIT,
  EV_GOAL,
  EV_OPPONENT_MESSAGE,
  EV_GAME_RESUME,
  EV_OPPONENT_LEFT,
} from '../../shared/constants.js';
import { updatePhysics, resetBall } from '../../shared/physics-server.js';
import { filterMessage } from '../profanity.js';
import { recordMessage } from '../analytics.js';

export class GameRoom {
  constructor(socket1, socket2, roomId, onEvent) {
    this.roomId = roomId;
    this.players = { player1: socket1, player2: socket2 };
    this.onEvent = onEvent; // callback to emit events

    // Game state
    this.gameState = {
      paddle1: {
        x: PADDLE_MARGIN,
        y: FIELD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        vy: 0,
      },
      paddle2: {
        x: FIELD_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
        y: FIELD_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        vy: 0,
      },
      ball: {
        x: FIELD_WIDTH / 2,
        y: FIELD_HEIGHT / 2,
        vx: -BALL_INITIAL_SPEED,
        vy: 0,
      },
    };

    this.scores = { player1: 0, player2: 0 };
    this.paused = false;
    this.interval = null;
    this.dialogueTimeout = null;   // server-side safety timer for dialogue
    this.dialoguePauseStart = null; // timestamp when dialogue pause began
  }

  /**
   * Start the physics loop (60Hz)
   * Clears any existing interval first to prevent double-ticking
   */
  start() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.paused = false;
    this.interval = setInterval(() => this.tick(), SERVER_TICK_MS);
  }

  /**
   * Physics tick
   */
  tick() {
    if (this.paused) return;

    const { scorer, paddleHit } = updatePhysics(this.gameState);

    // Paddle hit — pause for dialogue
    if (paddleHit) {
      this.paused = true;
      clearInterval(this.interval);
      this.interval = null;
      this.onEvent(EV_PADDLE_HIT, { hitter: paddleHit });

      // Record when dialogue pause started for analytics
      this.dialoguePauseStart = Date.now();

      // Server-side safety net: if client's auto-submit is lost in transit,
      // auto-resume after timeout + 2s grace period for network delay.
      this.dialogueTimeout = setTimeout(() => {
        console.log(`[Room ${this.roomId}] Dialogue timeout — auto-resuming`);
        this._resumeAfterMessage(paddleHit, '...');
      }, DIALOGUE_TIMEOUT_MS + 2000);

      return;
    }

    // Goal
    if (scorer) {
      resetBall(this.gameState.ball, scorer);
      const playerKey = scorer === PLAYER_1 ? 'player1' : 'player2';
      this.scores[playerKey]++;
      // Include ball state so clients can immediately snap to reset position
      this.onEvent(EV_GOAL, { scorer, scores: this.scores, ball: this.gameState.ball });
      return;
    }

    // Broadcast game state every tick
    this.onEvent(EV_GAME_STATE, {
      ball: this.gameState.ball,
      paddle1y: this.gameState.paddle1.y,
      paddle2y: this.gameState.paddle2.y,
    });
  }

  /**
   * Handle input from a player
   * @param {string} playerId - 'player1' or 'player2'
   * @param {number} direction - -1 (up), 0 (neutral), 1 (down)
   */
  handleInput(playerId, direction) {
    const paddle = playerId === PLAYER_1 ? this.gameState.paddle1 : this.gameState.paddle2;
    paddle.vy = direction * PADDLE_SPEED;
  }

  /**
   * Handle message submission from a player.
   * Clears the server-side timeout (message arrived before deadline).
   * @param {string} playerId - 'player1' or 'player2'
   * @param {string} text - Message text (already validated by index.js)
   */
  handleMessage(playerId, text) {
    if (this.dialogueTimeout) {
      clearTimeout(this.dialogueTimeout);
      this.dialogueTimeout = null;
    }
    this._resumeAfterMessage(playerId, text);
  }

  /**
   * Internal: broadcast message and resume physics loop.
   * Called by handleMessage() and by the server-side dialogue timeout.
   * @param {string} playerId - 'player1' or 'player2'
   * @param {string} text - Raw message text
   */
  _resumeAfterMessage(playerId, text) {
    // Track dialogue duration for analytics
    const dialogueDurationMs = this.dialoguePauseStart
      ? Date.now() - this.dialoguePauseStart
      : 0;
    this.dialoguePauseStart = null;
    recordMessage(dialogueDurationMs);

    const filtered = filterMessage(text);
    this.onEvent(EV_OPPONENT_MESSAGE, { player: playerId, text: filtered });
    this.paused = false;
    this.onEvent(EV_GAME_RESUME, {});
    this.start();
  }

  /**
   * Handle player disconnect
   * @param {string} socketId - Socket ID of disconnected player
   */
  handleDisconnect(socketId) {
    // Stop the loop
    clearInterval(this.interval);
    this.interval = null;

    // Notify the other player
    const otherSocket =
      socketId === this.players.player1.id
        ? this.players.player2
        : this.players.player1;

    if (otherSocket) {
      otherSocket.emit(EV_OPPONENT_LEFT, {});
    }
  }

  /**
   * Broadcast event to both players
   * @param {string} event - Event name
   * @param {object} data - Event data
   */
  broadcast(event, data) {
    this.players.player1.emit(event, data);
    this.players.player2.emit(event, data);
  }

  /**
   * Cleanup — stop all timers and intervals.
   */
  destroy() {
    clearInterval(this.interval);
    this.interval = null;
    if (this.dialogueTimeout) {
      clearTimeout(this.dialogueTimeout);
      this.dialogueTimeout = null;
    }
  }
}

/**
 * Factory function for creating a GameRoom
 * @param {Socket} socket1 - Player 1 socket
 * @param {Socket} socket2 - Player 2 socket
 * @param {string} roomId - Room ID
 * @param {Function} onEvent - Event callback
 * @returns {GameRoom}
 */
export function createGameRoom(socket1, socket2, roomId, onEvent) {
  const room = new GameRoom(socket1, socket2, roomId, onEvent);
  return room;
}
