const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

let lobbies = {}; 

io.on('connection', (socket) => {
  const broadcastLobbyList = () => {
    const list = Object.keys(lobbies)
      .filter(id => !lobbies[id].started)
      .map(id => {
        const lobby = lobbies[id];
        const host = lobby.players.find(p => p.isHost);
        return { 
          id, 
          playerCount: lobby.players.length,
          hostName: host ? host.name : "Unbekannt"
        };
      });
    io.emit('lobbyList', list);
  };

  socket.on('requestLobbyList', broadcastLobbyList);

  socket.on('createLobby', ({ lobbyId, playerName }) => {
    socket.join(lobbyId);
    lobbies[lobbyId] = {
      id: lobbyId, 
      host: socket.id, 
      started: false,
      players: [{ id: socket.id, name: playerName, isHost: true, pos: [10, 3, 10], rot: [0, 0, 0] }]
    };
    socket.emit('lobbyUpdate', lobbies[lobbyId].players);
    broadcastLobbyList();
  });

  socket.on('joinLobby', ({ lobbyId, playerName }) => {
    const lobby = lobbies[lobbyId];
    if (lobby && !lobby.started) {
      socket.join(lobbyId);
      lobby.players.push({ id: socket.id, name: playerName, isHost: false, pos: [10, 3, 10], rot: [0, 0, 0] });
      io.to(lobbyId).emit('lobbyUpdate', lobby.players);
      broadcastLobbyList();
    }
  });

  socket.on('startMatch', (lobbyId) => {
    const lobby = lobbies[lobbyId];
    if (lobby && lobby.host === socket.id) {
      lobby.started = true;
      io.to(lobbyId).emit('matchStarted');
      broadcastLobbyList();
    }
  });

  // NEU: Animationen/Spezial-Aktionen verteilen
  socket.on('playerAction', ({ lobbyId, command }) => {
    if (lobbyId) {
      // Sendet den Befehl an alle anderen in der Lobby
      socket.to(lobbyId).emit('remoteAction', { id: socket.id, command });
    }
  });

  socket.on('sendChatMessage', ({ lobbyId, message, playerName }) => {
    if (lobbyId && message.trim()) {
      io.to(lobbyId).emit('receiveChatMessage', {
        sender: playerName, text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  });

  socket.on('playerMovement', (data) => {
    const rooms = Array.from(socket.rooms);
    const lobbyId = rooms.find(r => r !== socket.id);
    if (lobbyId) {
      socket.to(lobbyId).emit('playerMoved', { id: socket.id, ...data });
    }
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach(room => {
      if (lobbies[room]) {
        const lobby = lobbies[room];
        lobby.players = lobby.players.filter(p => p.id !== socket.id);
        io.to(room).emit('playerLeft', socket.id);
        
        if (lobby.players.length === 0) {
          delete lobbies[room];
        } else if (lobby.host === socket.id) {
          lobby.host = lobby.players[0].id;
          lobby.players[0].isHost = true;
          io.to(room).emit('lobbyUpdate', lobby.players);
        }
      }
    });
  });

  socket.on('disconnect', broadcastLobbyList);
});

server.listen(5000, () => console.log(`Server läuft auf Port 5000`));