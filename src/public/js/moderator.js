// Připojení k Socket.IO serveru
const socket = io();

// DOM elementy
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const statusMessage = document.getElementById('status-message');
const startGameBtn = document.getElementById('start-game');
const nextQuestionBtn = document.getElementById('next-question');
const resetGameBtn = document.getElementById('reset-game');
const gameInfo = document.getElementById('game-info');
const questionCount = document.getElementById('question-count');
const currentQuestion = document.getElementById('current-question');
const timerDisplay = document.getElementById('timer-display');
const hunterScore = document.getElementById('hunter-score');
const contestantScore = document.getElementById('contestant-score');

// Stav hry
let questionsLoaded = false;
let gameActive = false;

// Připojení jako moderátor
socket.emit('join-as', 'moderator');

// Nahrání otázek
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const file = fileInput.files[0];
    if (!file) {
        showStatus('Prosím vyberte soubor', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('questions', file);

    try {
        const response = await fetch('/api/upload-questions', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showStatus(`✓ Úspěšně nahráno ${data.count} otázek`, 'success');
            questionsLoaded = true;
            startGameBtn.disabled = false;
            questionCount.textContent = data.count;
        } else {
            showStatus(`✗ Chyba: ${data.error}`, 'error');
        }
    } catch (error) {
        showStatus(`✗ Chyba při nahrávání: ${error.message}`, 'error');
    }
});

// Spuštění hry
startGameBtn.addEventListener('click', () => {
    if (questionsLoaded) {
        socket.emit('start-game');
        startGameBtn.disabled = true;
        gameInfo.style.display = 'block';
    }
});

// Další otázka
nextQuestionBtn.addEventListener('click', () => {
    socket.emit('next-question');
    nextQuestionBtn.disabled = true;
});

// Reset hry
resetGameBtn.addEventListener('click', () => {
    location.reload();
});

// Socket.IO události
socket.on('questions-loaded', (data) => {
    questionCount.textContent = data.count;
    questionsLoaded = true;
    startGameBtn.disabled = false;
});

socket.on('new-question', (data) => {
    currentQuestion.textContent = `${data.questionIndex + 1} / ${data.totalQuestions}`;
    timerDisplay.textContent = data.timeLeft;
    gameActive = true;
    nextQuestionBtn.disabled = true;
    resetGameBtn.disabled = false;
    showStatus(`Otázka: ${data.question}`, 'success');
});

socket.on('timer-update', (data) => {
    timerDisplay.textContent = data.timeLeft;
});

socket.on('time-up', (data) => {
    nextQuestionBtn.disabled = false;
    showStatus('⏱ Čas vypršel!', 'error');
});

socket.on('game-state', (state) => {
    hunterScore.textContent = state.hunterScore;
    contestantScore.textContent = state.contestantScore;
    if (state.questions.length > 0) {
        questionCount.textContent = state.questions.length;
        questionsLoaded = true;
        startGameBtn.disabled = !state.isActive;
        gameInfo.style.display = 'block';
    }
});

socket.on('game-over', (data) => {
    gameActive = false;
    nextQuestionBtn.disabled = true;
    startGameBtn.disabled = true;
    
    const winner = data.winner === 'hunter' ? 'Lovec' : 'Soutěžící';
    showStatus(`🎉 Konec hry! Vyhrál: ${winner} (${data.hunterScore} : ${data.contestantScore})`, 'success');
    
    hunterScore.textContent = data.hunterScore;
    contestantScore.textContent = data.contestantScore;
});

socket.on('error', (message) => {
    showStatus(`✗ Chyba: ${message}`, 'error');
});

// Pomocná funkce pro zobrazení statusu
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
    
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000);
}