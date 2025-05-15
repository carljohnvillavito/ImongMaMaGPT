const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const darkModeToggle = document.getElementById('darkModeToggle');

function sendMessage() {
    const message = chatInput.value;
    if (message.trim() === '') return;

    appendMessage(message, 'user');
    chatInput.value = '';
    chatInput.disabled = true;

    const typing = document.createElement('div');
    typing.className = 'typing-indicator bot';
    typing.textContent = 'Mag reply na ang kupal...';
    typing.id = 'typing';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    axios.get(`/api/ask?ask=${encodeURIComponent(message)}`)
        .then(response => {
            typing.remove();
            const fullResponse = response.data.result || 'Naa juy something wrong dong, wa koy tubag!';
            appendMessage(fullResponse, 'bot');
        })
        .catch(error => {
            typing.remove();
            appendErrorMessage();
        })
        .finally(() => {
            chatInput.disabled = false;
            chatInput.focus();
        });
}

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);

    const content = document.createElement('div');
    content.innerHTML = formatMessage(text);

    const timestamp = document.createElement('time');
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(content);

    if (sender === 'bot') {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-chat-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(content.innerText).then(() => {
                copyBtn.textContent = '✅';
                setTimeout(() => copyBtn.textContent = '📋', 1000);
            });
        };
        messageDiv.appendChild(copyBtn);
    }

    messageDiv.appendChild(timestamp);
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function formatMessage(text) {
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `
            <pre class="code-block">
                <code class="language-${lang || 'plaintext'}">${code.trim()}</code>
                <button class="copy-btn" onclick="copyCode(this)">📋</button>
            </pre>
        `;
    });

    // Inline code
    text = text.replace(/`([^`\n]+?)`/g, '<code class="inline-code">$1</code>');

    // Bold / Italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
}

function copyCode(button) {
    const code = button.previousElementSibling.innerText;
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = '✅';
        setTimeout(() => button.textContent = '📋', 1000);
    });
}

function appendErrorMessage() {
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('chat-message', 'bot');
    errorMessage.textContent = 'Naa juy something wrong dong, wa koy tubag!';
    chatBody.appendChild(errorMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Final working dark mode toggle
darkModeToggle.addEventListener('change', function () {
    document.body.classList.toggle('dark-mode', this.checked);
});
