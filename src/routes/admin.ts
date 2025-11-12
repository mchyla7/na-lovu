import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Question } from '../types';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-questions', upload.single('questions'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file.');
        }

        try {
            const questions: Question[] = JSON.parse(data);
            // Here you would typically save the questions to a database or in-memory store
            // For now, we will just log them
            console.log(questions);
            res.status(200).send('Questions uploaded successfully.');
        } catch (parseError) {
            return res.status(400).send('Invalid JSON format.');
        }
    });
});

export default router;