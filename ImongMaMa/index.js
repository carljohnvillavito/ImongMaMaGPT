const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');

function sendMessage() {
    const message = chatInput.value;
    if (message.trim() === '') return;

    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);

    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('chat-message', 'bot');
    loadingMessage.textContent = 'Oh paghulat dong...';
    chatBody.appendChild(loadingMessage);
    chatBody.scrollTop = chatBody.scrollHeight;

    axios.get(`https://hiroshi-api.onrender.com/ai/cohere?ask=${encodeURIComponent(message)}`)
        .then(response => {
            loadingMessage.remove();

            const resultText = response.data.response || 'Naa juy something wrong dong, wa koy tubag!';

            const botMessage = document.createElement('div');
            botMessage.classList.add('chat-message', 'bot');
            botMessage.textContent = resultText;
            chatBody.appendChild(botMessage);
            chatBody.scrollTop = chatBody.scrollHeight;
        })
        .catch(error => {
            console.error('API Error:', error);
            loadingMessage.remove();
            appendErrorMessage();
        });
}

function appendErrorMessage() {
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('chat-message', 'bot');
    errorMessage.textContent = 'Naa juy something wrong dong, wa koy tubag!';
    chatBody.appendChild(errorMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}
