import React, { useState } from 'react';
import { getSocket, connectSocket, disconnectSocket, resetSocket } from './network/socket.js';
import { EV_JOIN_QUEUE, EV_LEAVE_QUEUE, EV_MATCH_FOUND } from '@shared/constants.js';
import MenuScreen from './components/MenuScreen.jsx';
import LocalGame from './components/LocalGame.jsx';
import WaitingScreen from './components/WaitingScreen.jsx';
import NetworkGame from './components/NetworkGame.jsx';
import './App.css';

function App() {
  // Game mode: 'menu' | 'local' | 'waiting' | 'online'
  const [mode, setMode] = useState('menu');
  const [networkSession, setNetworkSession] = useState(null); // { socket, playerId, roomId }

  /**
   * Handle Local game button
   */
  const handlePlayLocal = () => {
    setMode('local');
  };

  /**
   * Handle Online game button
   */
  const handlePlayOnline = () => {
    const socket = getSocket();

    // Setup match found listener before joining queue
    socket.once(EV_MATCH_FOUND, (data) => {
      console.log('[App] Match found:', data);
      setNetworkSession({
        socket,
        playerId: data.playerId,
        roomId: data.roomId,
      });
      setMode('online');
    });

    connectSocket();
    socket.emit(EV_JOIN_QUEUE, {});
    setMode('waiting');
  };

  /**
   * Handle leaving waiting queue
   */
  const handleLeaveQueue = () => {
    const socket = getSocket();
    socket.emit(EV_LEAVE_QUEUE, {});
    disconnectSocket();
    resetSocket();
    setMode('menu');
  };

  /**
   * Handle leaving online game
   */
  const handleLeaveOnline = () => {
    const socket = getSocket();
    socket.disconnect();
    resetSocket();
    setNetworkSession(null);
    setMode('menu');
  };

  /**
   * Handle "Play Again" from GameOverScreen — disconnect current session and rejoin queue
   */
  const handlePlayAgain = () => {
    const socket = getSocket();
    socket.disconnect();
    resetSocket();
    setNetworkSession(null);
    handlePlayOnline();
  };

  /**
   * Handle returning from local game
   */
  const handleBackToMenu = () => {
    setMode('menu');
  };

  return (
    <div id="root">
      {mode === 'menu' && (
        <MenuScreen
          onLocal={handlePlayLocal}
          onOnline={handlePlayOnline}
        />
      )}

      {mode === 'local' && (
        <LocalGame onBack={handleBackToMenu} />
      )}

      {mode === 'waiting' && (
        <WaitingScreen onCancel={handleLeaveQueue} />
      )}

      {mode === 'online' && networkSession && (
        <NetworkGame
          socket={networkSession.socket}
          playerId={networkSession.playerId}
          roomId={networkSession.roomId}
          onLeave={handleLeaveOnline}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;
