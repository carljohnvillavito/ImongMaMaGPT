const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const darkModeToggle = document.getElementById('darkModeToggle');
const modelSelect = document.getElementById('modelSelect');

const availableModels = [
    "gemma2-9b-it",
    "compound-beta-mini",
    "compound-beta",
    "llama-guard-3-8b",
    "llama-3.1-8b-instant",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "mistral-saba-24b",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "deepseek-r1-distill-llama-70b"
];

// Populate model dropdown
availableModels.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
});

function getOrCreateUID() {
    let uid = sessionStorage.getItem('uid');
    if (!uid) {
        uid = '';
        for (let i = 0; i < 15; i++) {
            uid += Math.floor(Math.random() * 10);
        }
        sessionStorage.setItem('uid', uid);
    }
    return uid;
}

const userUID = getOrCreateUID();

function sendMessage() {
    const message = chatInput.value.trim();
    const selectedModel = modelSelect.value;

    if (!message) return;
    if (!selectedModel || selectedModel === "Select Model") {
        alert("Please select a model first.");
        return;
    }

    appendMessage(message, 'user');
    chatInput.value = '';
    chatInput.disabled = true;

    const typing = document.createElement('div');
    typing.className = 'typing-indicator bot';
    typing.textContent = 'Mag reply na ang kupal...';
    typing.id = 'typing';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    const systemPrompt = "You are Imongmamagpt pre-trained by Carl John Villavito, an MIST Student lives in Kidapawan City. My model is Claude 3.7 Sonnet.";

    const url = `https://api.zetsu.xyz/api/groq?prompt=${encodeURIComponent(message)}&uid=${userUID}&model=${encodeURIComponent(selectedModel)}`;

    axios.get(url)
        .then(response => {
            typing.remove();
            let reply = response.data.message || 'Wa koy tubag.';
            reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            appendMessage(reply, 'bot');
        })
        .catch(error => {
            typing.remove();
            console.error('API Error:', error);
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

    text = text.replace(/(^|\n)(\* .+(\n\* .+)+)/g, (match, p1, listBlock) => {
        const items = listBlock
            .trim()
            .split('\n')
            .map(line => `<li>${line.replace(/^\* /, '')}</li>`)
            .join('');
        return `${p1}<ul>${items}</ul>`;
    });

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

    text = text.replace(/`([^`\n]+?)`/g, '<code class="inline-code">$1</code>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
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

darkModeToggle.addEventListener('change', function () {
    document.body.classList.toggle('dark-mode', this.checked);
});
