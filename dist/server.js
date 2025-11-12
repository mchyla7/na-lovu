"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: {
        fileSize: 1 * 1024 * 1024 // 1 MB limit
    }
});
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.post('/upload-questions', upload.single('questions'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const filePath = path_1.default.join(__dirname, '../uploads', req.file.filename);
    fs_1.default.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file.');
        }
        try {
            const questions = JSON.parse(data);
            // Here you would typically save questions to a database or in-memory store
            res.status(200).send('Questions uploaded successfully.');
        }
        catch (parseError) {
            res.status(400).send('Invalid JSON format.');
        }
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
