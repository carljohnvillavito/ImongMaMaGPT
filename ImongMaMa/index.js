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

const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    chatInput.value = '';
    chatInput.disabled = true;

    const typing = document.createElement('div');
    typing.className = 'typing-indicator bot';
    typing.textContent = 'Nag-iisip pa...';
    typing.id = 'typing';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    const systemPrompt = "You are Imongmamagpt pre-trained by Carl John Villavito, an MIST Student living in Kidapawan City. Answer in a friendly, concise way.";

    axios.post('/api/ask', {
        prompt: message,
        uid: userUID,
        system: systemPrompt
    })
        .then(response => {
            typing.remove();
            let reply = response.data.answer || 'Wala kong sagot.';
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

function appendErrorMessage() {
    appendMessage('Sorry, nagka-problema ako sa pagkuha ng sagot.', 'bot');
}

function formatMessage(text) {
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Basic formatting (bold, list, etc.) can be added here if needed
    return text;
}

// Enter key handling
chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
});

// Optional: dark mode toggle handler
const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode', this.checked);
    });
}
