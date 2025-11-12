const socket = io();

const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const statusMessage = document.getElementById('status-message');
const startGameBtn = document.getElementById('start-game');
const nextQuestionBtn = document.getElementById('next-question');

socket.emit('join-as', 'moderator');

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const file = fileInput.files[0];
    if (!file) {
        statusMessage.textContent = 'Prosím vyberte JSON soubor';
        statusMessage.style.color = 'red';
        return;
    }

    const formData = new FormData();
    formData.append('questions', file);

    try {
        const response = await fetch('/api/upload-questions', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            statusMessage.textContent = result.message;
            statusMessage.style.color = 'green';
            startGameBtn.disabled = false;
        } else {
            statusMessage.textContent = 'Chyba: ' + result.error;
            statusMessage.style.color = 'red';
        }
    } catch (error) {
        statusMessage.textContent = 'Chyba při nahrávání: ' + error.message;
        statusMessage.style.color = 'red';
    }
});

startGameBtn.addEventListener('click', () => {
    socket.emit('start-game');
    statusMessage.textContent = 'Hra byla spuštěna!';
    statusMessage.style.color = 'blue';
    startGameBtn.disabled = true;
    nextQuestionBtn.disabled = false;
});

nextQuestionBtn.addEventListener('click', () => {
    socket.emit('next-question');
    statusMessage.textContent = 'Další otázka...';
    statusMessage.style.color = 'blue';
});

socket.on('questions-loaded', (data) => {
    statusMessage.textContent = `Nahráno ${data.count} otázek`;
    statusMessage.style.color = 'green';
    startGameBtn.disabled = false;
});

socket.on('new-question', (data) => {
    statusMessage.textContent = `Otázka ${data.questionIndex + 1}/${data.totalQuestions}: ${data.question}`;
    nextQuestionBtn.disabled = false;
});

socket.on('time-up', () => {
    statusMessage.textContent = 'Čas vypršel! Klikněte "Další otázka".';
});

socket.on('game-over', (data) => {
    statusMessage.textContent = `Hra skončila! Lovec: ${data.hunterScore}, Soutěžící: ${data.contestantScore}. Vyhrál: ${data.winner === 'hunter' ? 'Lovec' : 'Soutěžící'}`;
    nextQuestionBtn.disabled = true;
    startGameBtn.disabled = false;
});