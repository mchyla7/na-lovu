const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static('public'));

// Game state
let gameState = {
    round: 'waiting', // waiting, cashbuilder, headtohead, finalchase
    question: null,
    contestantPosition: 0,
    chaserPosition: -3,
    contestantScore: 0,
    timer: 0,
    answers: {
        contestant: null,
        chaser: null
    },
    finalChaseTeamPosition: 0,
    finalChaseChaserPosition: 0,
    finalChaseTime: 120,
    questionHistory: []
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/moderator', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'moderator.html'));
});

app.get('/contestant', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contestant.html'));
});

app.get('/chaser', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chaser.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Send current game state to new client
    socket.emit('gameState', gameState);

    // Moderator actions
    socket.on('startRound', (round) => {
        gameState.round = round;
        gameState.contestantPosition = 0;
        gameState.chaserPosition = -3;
        gameState.contestantScore = 0;
        gameState.answers = { contestant: null, chaser: null };
        gameState.finalChaseTeamPosition = 0;
        gameState.finalChaseChaserPosition = 0;
        gameState.questionHistory = [];
        io.emit('gameState', gameState);
    });

    socket.on('sendQuestion', (question) => {
        gameState.question = question;
        gameState.answers = { contestant: null, chaser: null };
        io.emit('newQuestion', question);
        io.emit('gameState', gameState);
    });

    socket.on('revealAnswer', (correctAnswer) => {
        const result = {
            correctAnswer,
            contestantAnswer: gameState.answers.contestant,
            chaserAnswer: gameState.answers.chaser,
            contestantCorrect: gameState.answers.contestant === correctAnswer,
            chaserCorrect: gameState.answers.chaser === correctAnswer
        };

        // Update positions based on round
        if (gameState.round === 'cashbuilder') {
            if (result.contestantCorrect) {
                gameState.contestantScore += 1000;
            }
        } else if (gameState.round === 'headtohead') {
            if (result.contestantCorrect) {
                gameState.contestantPosition++;
            }
            if (result.chaserCorrect) {
                gameState.chaserPosition++;
            }
        } else if (gameState.round === 'finalchase') {
            if (result.contestantCorrect) {
                gameState.finalChaseTeamPosition++;
            }
            if (result.chaserCorrect) {
                gameState.finalChaseChaserPosition++;
            }
        }

        gameState.questionHistory.push({
            question: gameState.question,
            ...result
        });

        io.emit('answerRevealed', result);
        io.emit('gameState', gameState);

        // Clear question after reveal
        gameState.question = null;
    });

    socket.on('resetGame', () => {
        gameState = {
            round: 'waiting',
            question: null,
            contestantPosition: 0,
            chaserPosition: -3,
            contestantScore: 0,
            timer: 0,
            answers: { contestant: null, chaser: null },
            finalChaseTeamPosition: 0,
            finalChaseChaserPosition: 0,
            finalChaseTime: 120,
            questionHistory: []
        };
        io.emit('gameState', gameState);
    });

    socket.on('setHeadToHeadStart', (position) => {
        gameState.contestantPosition = 0;
        gameState.chaserPosition = -position;
        io.emit('gameState', gameState);
    });

    // Contestant/Chaser answers
    socket.on('submitAnswer', (data) => {
        if (data.role === 'contestant') {
            gameState.answers.contestant = data.answer;
        } else if (data.role === 'chaser') {
            gameState.answers.chaser = data.answer;
        }
        io.emit('answerSubmitted', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Moderator: http://localhost:${PORT}/moderator`);
    console.log(`Contestant: http://localhost:${PORT}/contestant`);
    console.log(`Chaser: http://localhost:${PORT}/chaser`);
});
