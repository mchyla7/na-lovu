"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
let questions = [];
let currentQuestionIndex = 0;
let timer = null;
router.post('/upload', (req, res) => {
    const filePath = path_1.default.join(__dirname, '../../uploads/questions.json');
    const fileStream = fs_1.default.createWriteStream(filePath);
    req.pipe(fileStream);
    fileStream.on('finish', () => {
        fs_1.default.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Error reading the uploaded file.');
            }
            try {
                questions = JSON.parse(data);
                res.status(200).send('Questions uploaded successfully.');
            }
            catch (parseError) {
                res.status(400).send('Invalid JSON format.');
            }
        });
    });
    fileStream.on('error', () => {
        res.status(500).send('Error writing the uploaded file.');
    });
});
router.get('/start', (req, res) => {
    currentQuestionIndex = 0;
    startTimer();
    res.status(200).send(questions[currentQuestionIndex]);
});
router.get('/next', (req, res) => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        startTimer();
        res.status(200).send(questions[currentQuestionIndex]);
    }
    else {
        clearInterval(timer);
        res.status(200).send({ message: 'Game over' });
    }
});
function startTimer() {
    clearInterval(timer);
    let timeLeft = 10;
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            // Handle time up logic here
        }
        else {
            timeLeft--;
        }
    }, 1000);
}
exports.default = router;
