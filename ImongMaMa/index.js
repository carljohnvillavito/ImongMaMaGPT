const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');

function sendMessage() {
    const message = chatInput.value;
    if (message.trim() === '') return;

    appendMessage(message, 'user');

    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    const typing = document.createElement('div');
    typing.className = 'typing-indicator bot';
    typing.textContent = 'ImongMamaGPT is typing...';
    typing.id = 'typing';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    axios.get(`/api/ask?ask=${encodeURIComponent(message)}`)
        .then(response => {
            typing.remove();
            const resultText = response.data.result || 'Naa juy something wrong dong, wa koy tubag!';
            appendMessage(resultText, 'bot');
        })
        .catch(error => {
            console.error('API Error:', error);
            typing.remove();
            appendErrorMessage();
        });
}

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);

    const timestamp = document.createElement('time');
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.textContent = text;
    messageDiv.appendChild(timestamp);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Dark mode toggle
document.getElementById('toggleMode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const modeBtn = document.getElementById('toggleMode');
    modeBtn.textContent = document.body.classList.contains('dark-mode') ? 'Light' : 'Dark';
});

function appendErrorMessage() {
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('chat-message', 'bot');
    errorMessage.textContent = 'Naa juy something wrong dong, wa koy tubag!';
    chatBody.appendChild(errorMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}
