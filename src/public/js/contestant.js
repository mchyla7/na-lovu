const contestantElement = document.getElementById('contestant');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const timerElement = document.getElementById('timer');
const submitButton = document.getElementById('submit');
let timer;
let currentQuestionIndex = 0;
let questions = [];

function startGame() {
    fetch('/api/questions')
        .then(response => response.json())
        .then(data => {
            questions = data;
            loadQuestion();
        });
}

function loadQuestion() {
    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        questionElement.textContent = currentQuestion.question;
        optionsElement.innerHTML = '';
        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.onclick = () => submitAnswer(index);
            optionsElement.appendChild(button);
        });
        startTimer();
    } else {
        endGame();
    }
}

function startTimer() {
    let timeLeft = 10;
    timerElement.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            submitAnswer(-1); // No answer submitted
        }
    }, 1000);
}

function submitAnswer(selectedIndex) {
    clearInterval(timer);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex;
    // Handle answer submission (e.g., send to server, update score)
    currentQuestionIndex++;
    loadQuestion();
}

function endGame() {
    contestantElement.innerHTML = '<h2>Game Over</h2>';
}

document.addEventListener('DOMContentLoaded', startGame);