import React, { useRef, useEffect } from 'react';
import { PLAYER_1, COLOR_PADDLE_P1, COLOR_PADDLE_P2 } from '@shared/constants.js';
import '../styles/ChatFeed.css';

/**
 * ChatFeed - Displays the running conversation between players
 * Auto-scrolls to show newest messages
 */
function ChatFeed({ messages }) {
  const feedRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-feed" ref={feedRef} aria-live="polite" aria-label="Conversation feed">
      {messages.length === 0 ? (
        <p className="chat-empty">Hit the ball to start the conversation...</p>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message chat-message-${msg.player}`}
            style={{
              borderLeftColor:
                msg.player === PLAYER_1 ? COLOR_PADDLE_P1 : COLOR_PADDLE_P2,
            }}
          >
            <span
              className="chat-player"
              style={{
                color: msg.player === PLAYER_1 ? COLOR_PADDLE_P1 : COLOR_PADDLE_P2,
              }}
            >
              {msg.player === PLAYER_1 ? 'P1' : 'P2'}
            </span>
            <span className="chat-text">{msg.text}</span>
          </div>
        ))
      )}
    </div>
  );
}

export default ChatFeed;
