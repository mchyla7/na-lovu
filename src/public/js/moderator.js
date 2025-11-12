const moderatorForm = document.getElementById('moderator-form');
const uploadButton = document.getElementById('upload-button');
const messageBox = document.getElementById('message-box');

uploadButton.addEventListener('click', () => {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        messageBox.textContent = 'Please select a JSON file to upload.';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const questions = JSON.parse(event.target.result);
            // Validate the structure of the questions
            if (Array.isArray(questions) && questions.every(q => 
                q.question && 
                Array.isArray(q.options) && 
                q.options.length === 3 && 
                q.correctAnswer)) {
                // Send the questions to the server
                fetch('/api/admin/upload-questions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(questions)
                })
                .then(response => {
                    if (response.ok) {
                        messageBox.textContent = 'Questions uploaded successfully!';
                    } else {
                        messageBox.textContent = 'Failed to upload questions. Please try again.';
                    }
                })
                .catch(error => {
                    messageBox.textContent = 'Error uploading questions: ' + error.message;
                });
            } else {
                messageBox.textContent = 'Invalid question format. Please check your JSON file.';
            }
        } catch (error) {
            messageBox.textContent = 'Error reading file: ' + error.message;
        }
    };

    reader.readAsText(file);
});