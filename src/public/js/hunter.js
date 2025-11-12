const questionContainer = document.getElementById('question-container');
const timerDisplay = document.getElementById('timer');
const answerButtons = document.getElementById('answer-buttons');
let currentQuestionIndex = 0;
let timer;
let timeLeft = 10;

fetch('/path/to/questions.json')
    .then(response => response.json())
    .then(questions => {
        startGame(questions);
    });

function startGame(questions) {
    currentQuestionIndex = 0;
    timeLeft = 10;
    showQuestion(questions[currentQuestionIndex]);
}

function showQuestion(question) {
    questionContainer.innerText = question.question;
    answerButtons.innerHTML = '';
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        button.addEventListener('click', () => selectAnswer(answer));
        answerButtons.appendChild(button);
    });
    startTimer();
}

function startTimer() {
    timerDisplay.innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Time is up!');
            nextQuestion();
        }
    }, 1000);
}

function selectAnswer(answer) {
    clearInterval(timer);
    const correct = answer.correct;
    if (correct) {
        alert('Correct answer!');
    } else {
        alert('Wrong answer!');
    }
    nextQuestion();
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        timeLeft = 10;
        showQuestion(questions[currentQuestionIndex]);
    } else {
        alert('Game over!');
    }
}