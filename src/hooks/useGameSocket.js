import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const socket = io('http://192.168.1.35:5000');

export function useGameSocket(setGameState) {
  const [activeLobbies, setActiveLobbies] = useState([]);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [otherPlayers, setOtherPlayers] = useState({});

  useEffect(() => {
    socket.on('lobbyList', (lobbies) => setActiveLobbies(Array.isArray(lobbies) ? lobbies : []));
    socket.on('lobbyUpdate', (players) => setLobbyPlayers(Array.isArray(players) ? players : []));
    socket.on('matchStarted', () => setGameState('PLAYING'));

    socket.on('receiveChatMessage', (payload) => {
      const data = payload?.data || payload;
      
      // KORREKTUR: data.sender hinzugefügt, da der Server diesen Key nutzt
      const normalizedMsg = {
        playerName: data?.sender || data?.playerName || data?.user || data?.name || "UNKNOWN",
        message: data?.text || data?.message || data?.msg || (typeof payload === 'string' ? payload : ""),
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, normalizedMsg]);
    });

    socket.on('playerMoved', (p) => {
      if (p?.id) setOtherPlayers(prev => ({ ...prev, [p.id]: p }));
    });

    socket.on('playerLeft', (id) => {
      setOtherPlayers(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });

    return () => {
      socket.off('lobbyList');
      socket.off('lobbyUpdate');
      socket.off('matchStarted');
      socket.off('receiveChatMessage');
      socket.off('playerMoved');
      socket.off('playerLeft');
    };
  }, [setGameState]);

  return { activeLobbies, lobbyPlayers, chatMessages, otherPlayers };
}