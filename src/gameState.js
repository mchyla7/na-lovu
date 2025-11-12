// Simple in-memory game state management for a single or multiple rooms
// Rooms keyed by roomCode. Not persistent; suitable for one running instance.

export class GameState {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomCode, moderatorSocketId, moderatorName = 'Moderátor') {
    if (this.rooms.has(roomCode)) {
      throw new Error('Room already exists');
    }
    const room = {
      code: roomCode,
      moderator: { id: moderatorSocketId, name: moderatorName },
      contestant: null, // { id, name }
      chaser: null, // { id, name }
      scores: { contestant: 0, chaser: 0 },
      question: null, // { text, options?, correctOption?, timeLimit, startedAt }
      answers: {}, // role -> { answer, at, correct? }
      timer: null,
      settings: {
        pointsPerCorrect: 1,
        allowOpenEnded: true
      }
    };
    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  ensureRoom(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) throw new Error('Room not found');
    return room;
  }

  deleteRoom(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return;
    if (room.timer) clearTimeout(room.timer);
    this.rooms.delete(roomCode);
  }

  setRole(roomCode, role, id, name) {
    const room = this.ensureRoom(roomCode);
    if (!['contestant', 'chaser', 'moderator'].includes(role)) {
      throw new Error('Invalid role');
    }
    if (role === 'moderator') {
      room.moderator = { id, name };
      return room;
    }
    const slot = room[role];
    if (slot && slot.id && slot.id !== id) {
      // Replace existing connection for that role
      room[role] = { id, name };
    } else {
      room[role] = { id, name };
    }
    return room;
  }

  startQuestion(roomCode, payload) {
    const room = this.ensureRoom(roomCode);
    if (room.timer) clearTimeout(room.timer);

    const timeLimit = Math.max(3, Math.min(120, Number(payload.timeLimit || 20)));
    room.question = {
      text: (payload.text || '').toString(),
      options: Array.isArray(payload.options) ? payload.options.slice(0, 8) : undefined,
      correctOption: typeof payload.correctOption === 'number' ? payload.correctOption : undefined,
      timeLimit,
      startedAt: Date.now()
    };
    room.answers = {};

    // Auto end after timeLimit
    room.timer = setTimeout(() => {
      room.timer = null;
    }, timeLimit * 1000);

    return room;
  }

  submitAnswer(roomCode, role, answer) {
    const room = this.ensureRoom(roomCode);
    if (!room.question) throw new Error('No active question');
    if (!['contestant', 'chaser'].includes(role)) throw new Error('Invalid role');

    if (!room.answers[role]) {
      room.answers[role] = { answer, at: Date.now() };
    }

    return room;
  }

  endQuestionAndScore(roomCode, manualMarks) {
    const room = this.ensureRoom(roomCode);
    const { question, answers, settings } = room;
    if (!question) return room;

    const result = { contestant: false, chaser: false };

    if (typeof question.correctOption === 'number' && Array.isArray(question.options)) {
      // Auto-evaluate multiple choice
      result.contestant = answers.contestant && String(answers.contestant.answer) === String(question.correctOption);
      result.chaser = answers.chaser && String(answers.chaser.answer) === String(question.correctOption);
    } else if (manualMarks && typeof manualMarks === 'object') {
      // Manual scoring provided by moderator
      if (typeof manualMarks.contestant === 'boolean') result.contestant = manualMarks.contestant;
      if (typeof manualMarks.chaser === 'boolean') result.chaser = manualMarks.chaser;
    }

    if (result.contestant) room.scores.contestant += settings.pointsPerCorrect;
    if (result.chaser) room.scores.chaser += settings.pointsPerCorrect;

    // Clear active question
    if (room.timer) clearTimeout(room.timer);
    room.timer = null;
    room.question = null;

    return { room, result };
  }
}

export const gameState = new GameState();
