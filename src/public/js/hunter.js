const socket = io();

const questionText = document.getElementById('question-text');
const answerButtons = document.querySelectorAll('.answer-button');
const timerDisplay = document.getElementById('timer');
const scoreValue = document.getElementById('score-value');
const feedback = document.getElementById('feedback');

let score = 0;
let answered = false;

socket.emit('join-as', 'hunter');

socket.on('game-state', (state) => {
    score = state.hunterScore;
    scoreValue.textContent = score;
});

socket.on('new-question', (data) => {
    answered = false;
    questionText.textContent = data.question;
    feedback.textContent = '';
    feedback.className = '';
    
    answerButtons.forEach((button, index) => {
        button.textContent = data.options[index];
        button.disabled = false;
        button.className = 'answer-button';
    });
});

socket.on('timer-update', (data) => {
    timerDisplay.textContent = data.timeLeft;
});

socket.on('time-up', (data) => {
    answerButtons.forEach((button, index) => {
        button.disabled = true;
        if (index === data.correctAnswer) {
            button.classList.add('correct');
        }
    });
    feedback.textContent = 'Čas vypršel!';
    feedback.className = 'time-up';
});

socket.on('answer-result', (data) => {
    if (data.correct) {
        score++;
        scoreValue.textContent = score;
        feedback.textContent = 'Správně!';
        feedback.className = 'correct';
    } else {
        feedback.textContent = 'Špatně!';
        feedback.className = 'incorrect';
    }
    
    answerButtons.forEach((button, index) => {
        button.disabled = true;
        if (index === data.correctAnswer) {
            button.classList.add('correct');
        }
    });
});

socket.on('game-over', (data) => {
    questionText.textContent = 'Hra skončila!';
    answerButtons.forEach(button => {
        button.style.display = 'none';
    });
    
    const winner = data.winner === 'hunter' ? 'Lovec vyhrál!' : 'Soutěžící vyhrál!';
    feedback.textContent = `${winner} Skóre: Lovec ${data.hunterScore} - ${data.contestantScore} Soutěžící`;
    feedback.className = 'game-over';
});

answerButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!answered) {
            answered = true;
            const answerIndex = parseInt(button.dataset.index);
            socket.emit('submit-answer', { role: 'hunter', answerIndex });
        }
    });
});