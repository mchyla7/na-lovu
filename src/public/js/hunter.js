// Připojení k Socket.IO serveru
const socket = io();

// DOM elementy
const waiting = document.getElementById('waiting');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const timer = document.getElementById('timer');
const answerButtons = document.querySelectorAll('.answer-button');
const scoreDisplay = document.getElementById('score');
const gameOver = document.getElementById('game-over');
const resultMessage = document.getElementById('result-message');

// Stav hry
let currentScore = 0;
let selectedAnswer = null;
let answerSubmitted = false;

// Připojení jako lovec
socket.emit('join-as', 'hunter');

// Nastavení posluchačů pro tlačítka odpovědí
answerButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (answerSubmitted) return;
        
        const answerIndex = parseInt(button.dataset.index);
        selectAnswer(answerIndex, button);
    });
});

function selectAnswer(answerIndex, button) {
    if (answerSubmitted) return;
    
    // Označit vybranou odpověď
    answerButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    selectedAnswer = answerIndex;
    
    // Odeslat odpověď
    socket.emit('submit-answer', {
        role: 'hunter',
        answerIndex: answerIndex
    });
    
    answerSubmitted = true;
    
    // Deaktivovat všechna tlačítka
    answerButtons.forEach(btn => btn.disabled = true);
}

// Socket.IO události
socket.on('new-question', (data) => {
    // Skrýt čekání, zobrazit otázku
    waiting.style.display = 'none';
    questionContainer.classList.add('active');
    gameOver.classList.remove('active');
    
    // Nastavit otázku a možnosti
    questionText.textContent = data.question;
    timer.textContent = data.timeLeft;
    
    answerButtons.forEach((button, index) => {
        button.textContent = data.options[index];
        button.disabled = false;
        button.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Reset stavu
    selectedAnswer = null;
    answerSubmitted = false;
});

socket.on('timer-update', (data) => {
    timer.textContent = data.timeLeft;
    
    // Změna barvy časovače při nízkém čase
    if (data.timeLeft <= 3) {
        timer.style.color = '#dc3545';
    } else if (data.timeLeft <= 5) {
        timer.style.color = '#ffc107';
    } else {
        timer.style.color = '#e8491d';
    }
});

socket.on('time-up', (data) => {
    answerSubmitted = true;
    answerButtons.forEach(btn => btn.disabled = true);
    
    // Zobrazit správnou odpověď
    answerButtons.forEach((button, index) => {
        if (index === data.correctAnswer) {
            button.classList.add('correct');
        }
    });
});

socket.on('answer-result', (data) => {
    // Zobrazit výsledek odpovědi
    if (data.correct) {
        currentScore++;
        scoreDisplay.textContent = currentScore;
    }
    
    // Označit správnou odpověď
    answerButtons.forEach((button, index) => {
        if (index === data.correctAnswer) {
            button.classList.add('correct');
        } else if (index === selectedAnswer && !data.correct) {
            button.classList.add('incorrect');
        }
    });
});

socket.on('game-over', (data) => {
    questionContainer.classList.remove('active');
    gameOver.classList.add('active');
    
    const isWinner = data.winner === 'hunter';
    const message = isWinner 
        ? `🏆 Vyhrál jste! Skóre: ${data.hunterScore} : ${data.contestantScore}`
        : `Prohrál jste. Skóre: ${data.hunterScore} : ${data.contestantScore}`;
    
    resultMessage.textContent = message;
    resultMessage.style.background = isWinner ? '#d4edda' : '#f8d7da';
    resultMessage.style.color = isWinner ? '#155724' : '#721c24';
    
    currentScore = data.hunterScore;
    scoreDisplay.textContent = currentScore;
});

socket.on('game-state', (state) => {
    currentScore = state.hunterScore;
    scoreDisplay.textContent = currentScore;
    
    if (state.isActive) {
        waiting.style.display = 'none';
    }
});

socket.on('error', (message) => {
    alert('Chyba: ' + message);
});