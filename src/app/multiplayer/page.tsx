"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container, Box, Typography, Button, TextField } from "@mui/material";
import { usePageTitle } from '../../context/PageTitleContext';

export default function Multiplayer() {
  const { setTitle } = usePageTitle();
  const ws = useRef<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [secretNumber, setSecretNumber] = useState('');
  const [gameState, setGameState] = useState('waiting');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setTitle('Multiplayer');

    const connectWebSocket = () => {
      ws.current = new WebSocket('ws://localhost:8080');

      ws.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        const savedRoomId = localStorage.getItem('roomId');
        if (savedRoomId) {
          setRoomId(savedRoomId);
          ws.current?.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: savedRoomId }));
        }
      };

      ws.current.onmessage = (message) => {
        const data = JSON.parse(message.data);

        switch (data.type) {
          case 'ROOM_CREATED':
            setRoomId(data.roomId);
            localStorage.setItem('roomId', data.roomId);
            break;
          case 'PLAYER_JOINED':
            // Handle player joined
            break;
          case 'GAME_READY':
            setGameState('ready');
            // Start countdown
            break;
          // Handle other message types
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        localStorage.removeItem('roomId');
        // Optionally try to reconnect
        setTimeout(() => connectWebSocket(), 5000); // Reconnect after 5 seconds
      };
    };

    connectWebSocket();

    return () => {
      ws.current?.close();
    };
  }, [setTitle]);

  const createRoom = () => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({ type: 'CREATE_ROOM' }));
    }
  };

  const joinRoom = () => {
    const roomId = prompt('Enter Room ID');
    if (roomId && ws.current && isConnected) {
      ws.current.send(JSON.stringify({ type: 'JOIN_ROOM', roomId }));
      setRoomId(roomId);
      localStorage.setItem('roomId', roomId);
    }
  };

  const setSecret = () => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({ type: 'SET_SECRET', roomId, player: 'player1', secret: secretNumber }));
      setPlayerReady(true);
    }
  };

  const leaveRoom = () => {
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({ type: 'LEAVE_ROOM' }));
    }
    localStorage.removeItem('roomId');
    setRoomId(null);
    setGameState('waiting');
  };

  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" gap="20px">
        {roomId ? (
          <>
            <Typography variant="h4">Room ID: {roomId}</Typography>
            <Button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/multiplayer/${roomId}`)}>Copy Link</Button>
            {gameState === 'waiting' && (
              <>
                <Typography variant="h6">Waiting for opponent...</Typography>
                <TextField
                  label="Secret Number"
                  value={secretNumber}
                  onChange={(e) => setSecretNumber(e.target.value)}
                />
                <Button onClick={setSecret} disabled={playerReady}>
                  Set Secret Number
                </Button>
              </>
            )}
            {gameState === 'ready' && (
              <Typography variant="h6">Game is ready to start!</Typography>
            )}
            <Button onClick={leaveRoom}>Leave Room</Button>
          </>
        ) : (
          <>
            <Button variant="contained" onClick={createRoom}>
              Create Room
            </Button>
            <Button variant="contained" onClick={joinRoom}>
              Join Room
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
