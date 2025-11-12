"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/upload-questions', upload.single('questions'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const filePath = path_1.default.join(__dirname, '../uploads', req.file.filename);
    fs_1.default.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file.');
        }
        try {
            const questions = JSON.parse(data);
            // Here you would typically save the questions to a database or in-memory store
            // For now, we will just log them
            console.log(questions);
            res.status(200).send('Questions uploaded successfully.');
        }
        catch (parseError) {
            return res.status(400).send('Invalid JSON format.');
        }
    });
});
exports.default = router;
