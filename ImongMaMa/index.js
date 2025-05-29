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
            if (typeof response.data === 'object' && response.data.images && response.data.images.length > 0) {
                appendBotMessageWithImage(response.data);
            } else {
                // fallback: standard
                let reply = response.data.answer || response.data || 'Wala kong sagot.';
                appendMessage(reply, 'bot');
            }
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

function appendBotMessageWithImage(data) {
    // data.images is an array, data.answer is the markdown (with ![](...)), data.answer may have text after the image
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', 'bot');

    // Support for multiple images if ever
    data.images.forEach((img, idx) => {
        const imageBox = document.createElement('div');
        imageBox.className = 'image-bubble-box';

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-image-btn';
        downloadBtn.innerText = 'Download';
        downloadBtn.title = 'Download image as .jpeg';
        downloadBtn.onclick = (e) => {
            e.stopPropagation();
            handleImageDownload(img.url, `imongmama-image-${Date.now()}.jpeg`);
        };

        const image = document.createElement('img');
        image.src = img.url;
        image.alt = img.description || "Generated Image";

        imageBox.appendChild(downloadBtn);
        imageBox.appendChild(image);

        // Optional: description/caption
        if (img.description) {
            const caption = document.createElement('div');
            caption.style.marginTop = '6px';
            caption.style.fontSize = '0.93em';
            caption.style.color = '#555';
            caption.innerText = img.description;
            imageBox.appendChild(caption);
        }

        messageDiv.appendChild(imageBox);
    });

    // Display the rest of the bot's text answer (if any), after the image
    // Remove the image markdown from answer, show the rest
    let remainingText = '';
    if (data.answer) {
        // Remove all ![...](url) markdown from answer
        remainingText = data.answer.replace(/!\[.*?\]\(.*?\)/g, '').trim();
    }
    if (remainingText) {
        const textDiv = document.createElement('div');
        textDiv.innerHTML = formatMessage(remainingText);
        textDiv.style.marginTop = '10px';
        messageDiv.appendChild(textDiv);
    }

    const timestamp = document.createElement('time');
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageDiv.appendChild(timestamp);

    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Ensures downloaded file is .jpeg (or fallback .jpg), even if the URL doesn't have an extension
function handleImageDownload(url, filename) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            // fix for Safari/iOS: must create a link and click
            const a = document.createElement('a');
            const urlObj = window.URL.createObjectURL(blob);
            a.href = urlObj;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(urlObj);
            }, 0);
        })
        .catch(() => {
            alert('Failed to download image.');
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
