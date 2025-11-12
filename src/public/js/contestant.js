const socket = io();

const questionElement = document.getElementById('question');
const optionButtons = document.querySelectorAll('.option');
const timerElement = document.getElementById('timer');
const scoreValue = document.getElementById('score-value');
const feedback = document.getElementById('feedback');

let score = 0;
let answered = false;

socket.emit('join-as', 'contestant');

socket.on('game-state', (state) => {
    score = state.contestantScore;
    scoreValue.textContent = score;
});

socket.on('new-question', (data) => {
    answered = false;
    questionElement.textContent = data.question;
    feedback.textContent = '';
    feedback.className = '';
    
    optionButtons.forEach((button, index) => {
        button.textContent = data.options[index];
        button.disabled = false;
        button.className = 'option';
    });
});

socket.on('timer-update', (data) => {
    timerElement.textContent = data.timeLeft;
});

socket.on('time-up', (data) => {
    optionButtons.forEach((button, index) => {
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
    
    optionButtons.forEach((button, index) => {
        button.disabled = true;
        if (index === data.correctAnswer) {
            button.classList.add('correct');
        }
    });
});

socket.on('game-over', (data) => {
    questionElement.textContent = 'Hra skončila!';
    optionButtons.forEach(button => {
        button.style.display = 'none';
    });
    
    const winner = data.winner === 'contestant' ? 'Vyhrál jsi!' : 'Lovec vyhrál!';
    feedback.textContent = `${winner} Skóre: Lovec ${data.hunterScore} - ${data.contestantScore} Soutěžící`;
    feedback.className = 'game-over';
});

optionButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!answered) {
            answered = true;
            const answerIndex = parseInt(button.dataset.index);
            socket.emit('submit-answer', { role: 'contestant', answerIndex });
        }
    });
});