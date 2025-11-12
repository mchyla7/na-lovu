import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { gameState } from './gameState.js';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

function safeRoomSnapshot(room) {
  if (!room) return null;
  return {
    code: room.code,
    moderator: room.moderator && !!room.moderator.id,
    contestant: room.contestant && room.contestant.name || null,
    chaser: room.chaser && room.chaser.name || null,
    scores: room.scores,
    question: room.question ? {
      text: room.question.text,
      options: room.question.options,
      timeLimit: room.question.timeLimit,
      startedAt: room.question.startedAt
    } : null,
    answers: Object.keys(room.answers),
  };
}

io.on('connection', (socket) => {
  socket.on('createRoom', ({ roomCode, name }) => {
    try {
      const code = (roomCode || '').trim().toUpperCase() || Math.random().toString(36).substring(2, 7).toUpperCase();
      const room = gameState.createRoom(code, socket.id, name || 'Moderátor');
      socket.join(code);
      socket.emit('roomCreated', { code });
      io.to(code).emit('roomUpdate', safeRoomSnapshot(room));
    } catch (e) {
      socket.emit('errorMessage', e.message);
    }
  });

  socket.on('joinRoom', ({ roomCode, role, name }) => {
    try {
      const code = (roomCode || '').trim().toUpperCase();
      const room = gameState.getRoom(code);
      if (!room) throw new Error('Místnost neexistuje');
      if (!['contestant', 'chaser'].includes(role)) throw new Error('Neplatná role');
      gameState.setRole(code, role, socket.id, name || role);
      socket.join(code);
      io.to(code).emit('roomUpdate', safeRoomSnapshot(room));
    } catch (e) {
      socket.emit('errorMessage', e.message);
    }
  });

  socket.on('moderatorJoin', ({ roomCode, name }) => {
    try {
      const code = (roomCode || '').trim().toUpperCase();
      const room = gameState.getRoom(code);
      if (!room) throw new Error('Místnost neexistuje');
      gameState.setRole(code, 'moderator', socket.id, name || 'Moderátor');
      socket.join(code);
      io.to(code).emit('roomUpdate', safeRoomSnapshot(room));
    } catch (e) {
      socket.emit('errorMessage', e.message);
    }
  });

  socket.on('startQuestion', ({ roomCode, question }) => {
    try {
      const code = (roomCode || '').trim().toUpperCase();
      const room = gameState.getRoom(code);
      if (!room) throw new Error('Místnost neexistuje');
      if (room.moderator.id !== socket.id) throw new Error('Jen moderátor může spouštět otázku');
      gameState.startQuestion(code, question);
      io.to(code).emit('roomUpdate', safeRoomSnapshot(room));
    } catch (e) { socket.emit('errorMessage', e.message); }
  });

  socket.on('submitAnswer', ({ roomCode, role, answer }) => {
    try {
      const code = (roomCode || '').trim().toUpperCase();
      const room = gameState.getRoom(code);
      if (!room) throw new Error('Místnost neexistuje');
      if (!room.question) throw new Error('Žádná aktivní otázka');
      if (!['contestant', 'chaser'].includes(role)) throw new Error('Neplatná role');
      // Ensure socket id matches role
      if (!room[role] || room[role].id !== socket.id) throw new Error('Socket neodpovídá roli');
      gameState.submitAnswer(code, role, answer);
      io.to(code).emit('roomUpdate', safeRoomSnapshot(room));
    } catch (e) { socket.emit('errorMessage', e.message); }
  });

  socket.on('endQuestion', ({ roomCode, marks }) => {
    try {
      const code = (roomCode || '').trim().toUpperCase();
      const room = gameState.getRoom(code);
      if (!room) throw new Error('Místnost neexistuje');
      if (room.moderator.id !== socket.id) throw new Error('Jen moderátor může ukončit otázku');
      const { result } = gameState.endQuestionAndScore(code, marks);
      io.to(code).emit('questionResult', result);
      io.to(code).emit('roomUpdate', safeRoomSnapshot(room));
    } catch (e) { socket.emit('errorMessage', e.message); }
  });

  socket.on('disconnect', () => {
    // Soft handling: we don't remove role immediately; reconnection possible.
  });
});

app.get('/health', (req, res) => res.json({ ok: true }));

server.listen(PORT, () => {
  console.log(`Na lovu server běží na portu ${PORT}`);
});
