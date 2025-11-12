import express from 'express';
import { Request, Response } from 'express';
import { Question } from '../types';
import fs from 'fs';
import path from 'path';

const router = express.Router();
let questions: Question[] = [];
let currentQuestionIndex = 0;
let timer: NodeJS.Timeout | null = null;

router.post('/upload', (req: Request, res: Response) => {
    const filePath = path.join(__dirname, '../../uploads/questions.json');
    const fileStream = fs.createWriteStream(filePath);

    req.pipe(fileStream);

    fileStream.on('finish', () => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Error reading the uploaded file.');
            }
            try {
                questions = JSON.parse(data);
                res.status(200).send('Questions uploaded successfully.');
            } catch (parseError) {
                res.status(400).send('Invalid JSON format.');
            }
        });
    });

    fileStream.on('error', () => {
        res.status(500).send('Error writing the uploaded file.');
    });
});

router.get('/start', (req: Request, res: Response) => {
    currentQuestionIndex = 0;
    startTimer();
    res.status(200).send(questions[currentQuestionIndex]);
});

router.get('/next', (req: Request, res: Response) => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        startTimer();
        res.status(200).send(questions[currentQuestionIndex]);
    } else {
        clearInterval(timer!);
        res.status(200).send({ message: 'Game over' });
    }
});

function startTimer() {
    clearInterval(timer!);
    let timeLeft = 10;
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer!);
            // Handle time up logic here
        } else {
            timeLeft--;
        }
    }, 1000);
}

export default router;