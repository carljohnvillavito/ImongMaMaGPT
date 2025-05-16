const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const darkModeToggle = document.getElementById('darkModeToggle');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
let uploadedImageBase64 = '';

function getOrCreateUID() {
    let uid = sessionStorage.getItem('uid');
    if (!uid) {
        uid = '';
        for (let i = 0; i < 15; i++) {
            uid += Math.floor(Math.random() * 10); // Generate 0–9
        }
        sessionStorage.setItem('uid', uid);
    }
    return uid;
}

const userUID = getOrCreateUID(); // use this in API requests

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

    axios.get(`/api/ask?ask=${encodeURIComponent(message)}&uid=${userUID}`)
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

    // Bullet lists: group consecutive * items
    text = text.replace(/(^|\n)(\* .+(\n\* .+)+)/g, (match, p1, listBlock) => {
        const items = listBlock
            .trim()
            .split('\n')
            .map(line => `<li>${line.replace(/^\* /, '')}</li>`)
            .join('');
        return `${p1}<ul>${items}</ul>`;
    });

    // Multiline code blocks: ```lang\n...\n```
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const safeCode = code
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/ /g, '&nbsp;')
            .replace(/\n/g, '<br>');
        return `
            <pre class="code-block">
                <code class="language-${lang || 'plaintext'}">${safeCode}</code>
                <button class="copy-btn" onclick="copyCode(this)">📋</button>
            </pre>
        `;
    });

    // Inline code
    text = text.replace(/`([^`\n]+?)`/g, '<code class="inline-code">$1</code>');

    // Bold / italic
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
