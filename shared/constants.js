/**
 * Dialogue Pong — Shared Constants
 * Single source of truth for all game configuration
 */

// Field dimensions
export const FIELD_WIDTH = 800;
export const FIELD_HEIGHT = 600;
export const CENTER_LINE_WIDTH = 2;

// Paddle dimensions & physics
export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 80;
export const PADDLE_SPEED = 7; // pixels per frame
export const PADDLE_MARGIN = 10; // distance from left/right edge

// Ball physics
export const BALL_RADIUS = 6;
export const BALL_INITIAL_SPEED = 8; // pixels per frame
export const BALL_MAX_SPEED = 16;
export const BALL_SPEED_INCREMENT = 0.05; // added per paddle hit

// Paddle collision angles
export const PADDLE_HIT_MAX_ANGLE = 75; // degrees
export const PADDLE_HIT_DEADZONE = 0.1; // fraction of paddle where angle = 0

// Colors (neon cyberpunk theme)
export const COLOR_BACKGROUND_START = '#0A0E27';
export const COLOR_BACKGROUND_END = '#1A1F3A';
export const COLOR_CENTER_LINE = '#FFFFFF';
export const CENTER_LINE_ALPHA = 0.2;
export const COLOR_PADDLE_P1 = '#00D9FF'; // Cyan
export const COLOR_PADDLE_P2 = '#FF006E'; // Magenta
export const COLOR_BALL = '#FFFFFF';
export const COLOR_TEXT = '#00D9FF';
export const COLOR_TEXT_P2 = '#FF006E';

// Glow effects (shadow blur)
export const PADDLE_GLOW_BLUR = 12;
export const BALL_GLOW_BLUR = 8;

// Typography
export const FONT_FAMILY = '"Courier New", monospace';
export const FONT_SIZE_SCORE = 48;
export const FONT_SIZE_LABEL = 16;

// Game mechanics
export const SERVE_ANGLE_MAX = 15; // degrees random angle after goal

// Player IDs
export const PLAYER_1 = 'player1';
export const PLAYER_2 = 'player2';

// Input keycodes
export const KEY_P1_UP = 'KeyW';
export const KEY_P1_DOWN = 'KeyS';
export const KEY_P2_UP = 'ArrowUp';
export const KEY_P2_DOWN = 'ArrowDown';

// Dialogue mechanics (Phase 2+)
export const DIALOGUE_TIMEOUT_MS = 30000; // 30 second timer
export const MESSAGE_MIN_LENGTH = 1;
export const MESSAGE_MAX_LENGTH = 200;

// Audio settings (Phase 5+)
export const SOUND_DEFAULT_MASTER = 0.8;
export const SOUND_DEFAULT_MUSIC  = 0.4;
export const SOUND_DEFAULT_SFX    = 0.7;
export const SOUND_DIALOGUE_MUSIC_DUCK = 0.08; // music volume during dialogue input

// Server & networking (Phase 3+)
export const SERVER_PORT = 3001;
export const SERVER_URL = 'http://localhost:3001'; // Used by client; override via env in production
export const SERVER_TICK_MS = 1000 / 60; // ~16.67ms — server physics runs at 60Hz

// Socket.io event names (shared between client and server)
export const EV_JOIN_QUEUE = 'join_queue';
export const EV_LEAVE_QUEUE = 'leave_queue';
export const EV_MATCH_FOUND = 'match_found';
export const EV_INPUT = 'input';
export const EV_GAME_STATE = 'game_state';
export const EV_PADDLE_HIT = 'paddle_hit';
export const EV_GOAL = 'goal';
export const EV_MESSAGE = 'message';
export const EV_OPPONENT_MESSAGE = 'opponent_message';
export const EV_GAME_RESUME = 'game_resume';
export const EV_OPPONENT_LEFT = 'opponent_left';

// Graphics quality setting (Phase 6 performance optimization)
export const GRAPHICS_QUALITY_KEY = 'dialoguePong_graphicsQuality';
export const GRAPHICS_QUALITY_HIGH = 'high';
export const GRAPHICS_QUALITY_LOW = 'low';
