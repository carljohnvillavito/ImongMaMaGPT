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
    typing.textContent = 'Pag huwat dong ha, badjakan taka ron...';
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

function copyCode(button) {
    const code = button.previousElementSibling.innerText;
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = '✅';
        setTimeout(() => button.textContent = '📋', 1000);
    });
}

function formatMessage(text) {
    // Escape HTML
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Bold (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic (*text*)
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code blocks: ```lang\ncode\n```
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const highlighted = `<pre class="code-block"><code class="language-${lang || 'plaintext'}">${code.trim()}</code><button class="copy-btn" onclick="copyCode(this)">📋</button></pre>`;
        return highlighted;
    });

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
}

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);

    const content = document.createElement('div');
    content.innerHTML = formatMessage(text); // Convert markdown/code to HTML

    const timestamp = document.createElement('time');
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(content);
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
