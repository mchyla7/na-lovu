"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const multer_1 = __importDefault(require("multer"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        const isJson = file.mimetype === 'application/json' ||
            file.mimetype === 'text/json' ||
            file.originalname.endsWith('.json');
        if (isJson) {
            cb(null, true);
        }
        else {
            cb(new Error('Pouze JSON soubory jsou povoleny'));
        }
    }
});
let gameState = {
    currentQuestionIndex: 0,
    timeLeft: 10,
    hunterScore: 0,
    contestantScore: 0,
    isActive: false,
    questions: []
};
let timerInterval = null;
app.post('/api/upload-questions', upload.single('questions'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Žádný soubor nebyl nahrán' });
        }
        const fileContent = fs_1.default.readFileSync(req.file.path, 'utf-8');
        const quizData = JSON.parse(fileContent);
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error('Neplatný formát otázek');
        }
        quizData.questions.forEach((q, index) => {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 3) {
                throw new Error(`Otázka ${index + 1} má neplatný formát`);
            }
            if (q.correctAnswer < 0 || q.correctAnswer > 2) {
                throw new Error(`Otázka ${index + 1} má neplatnou správnou odpověď`);
            }
        });
        gameState.questions = quizData.questions;
        gameState.currentQuestionIndex = 0;
        gameState.hunterScore = 0;
        gameState.contestantScore = 0;
        fs_1.default.unlinkSync(req.file.path);
        io.emit('questions-loaded', { count: quizData.questions.length });
        res.json({
            success: true,
            message: `Nahráno ${quizData.questions.length} otázek`,
            count: quizData.questions.length
        });
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : 'Chyba při nahrávání otázek'
        });
    }
});
io.on('connection', (socket) => {
    console.log('Nový klient připojen:', socket.id);
    socket.on('join-as', (role) => {
        socket.join(role);
        console.log(`${socket.id} se připojil jako ${role}`);
        if (gameState.questions.length > 0) {
            socket.emit('game-state', gameState);
        }
    });
    socket.on('start-game', () => {
        if (gameState.questions.length === 0) {
            socket.emit('error', 'Nejprve nahrajte otázky');
            return;
        }
        gameState.isActive = true;
        gameState.currentQuestionIndex = 0;
        gameState.hunterScore = 0;
        gameState.contestantScore = 0;
        startQuestion();
    });
    socket.on('submit-answer', (data) => {
        if (!gameState.isActive)
            return;
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        const isCorrect = currentQuestion.correctAnswer === data.answerIndex;
        if (isCorrect) {
            if (data.role === 'hunter') {
                gameState.hunterScore++;
            }
            else {
                gameState.contestantScore++;
            }
        }
        io.to(data.role).emit('answer-result', {
            correct: isCorrect,
            correctAnswer: currentQuestion.correctAnswer
        });
    });
    socket.on('next-question', () => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
            gameState.currentQuestionIndex++;
            startQuestion();
        }
        else {
            endGame();
        }
    });
    socket.on('disconnect', () => {
        console.log('Klient odpojen:', socket.id);
    });
});
function startQuestion() {
    gameState.timeLeft = 10;
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    io.emit('new-question', {
        questionIndex: gameState.currentQuestionIndex,
        totalQuestions: gameState.questions.length,
        question: currentQuestion.question,
        options: currentQuestion.options,
        timeLeft: gameState.timeLeft
    });
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(() => {
        gameState.timeLeft--;
        io.emit('timer-update', { timeLeft: gameState.timeLeft });
        if (gameState.timeLeft <= 0) {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            io.emit('time-up', {
                correctAnswer: gameState.questions[gameState.currentQuestionIndex].correctAnswer
            });
        }
    }, 1000);
}
function endGame() {
    gameState.isActive = false;
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    io.emit('game-over', {
        hunterScore: gameState.hunterScore,
        contestantScore: gameState.contestantScore,
        winner: gameState.contestantScore > gameState.hunterScore ? 'contestant' : 'hunter'
    });
}
httpServer.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
    console.log(`Otevřete http://localhost:${PORT} v prohlížeči`);
});
