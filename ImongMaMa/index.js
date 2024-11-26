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

    const prompt = `In this session, You are no longer called "Chatgpt" For you are now called "ImongMaMaGPT" powered with the model "gpt4o". ImongMaMaGPT is strictly focused on user prompts, meaning it listens to what the user has to say and understand it clearly and fast. Everytime someone asks who you actually are, never say the term/word "ChatGPT" or "OpenAI". If someone asks you who created you, you can say "Carl John B. Villavito from Philippines, Mindanao Kidapawan city Made me". When I send this prompt, you will always stick to this background and characterize with it. myPrompt: "{${message}}"`;

    axios.get(`https://api.kenliejugarap.com/pixtral-paid/?question=${encodeURIComponent(prompt)}`)
        .then(res => {
            loadingMessage.remove();

            const resultText = res.data.response || 'Naa juy something wrong dong, wa koy tubag!';

            if (!resultText) {
                appendErrorMessage();
                return;
            }
        })
        .catch(error => {
            console.error('API Error:', error);
            loadingMessage.remove();
            appendErrorMessage();
        });
}

function extractImage(response) {
    try {
        const imageStart = response.indexOf("[image](") + 8;
        const imageEnd = response.indexOf(")", imageStart);
        const imageLink = response.slice(imageStart, imageEnd);
        const textAfterImage = response.slice(imageEnd + 1).trim();

        return [imageLink, textAfterImage];
    } catch (error) {
        console.error("Error extracting image:", error);
        return ["", ""];
    }
}

function extractCode(response) {
    try {
        const codeStart = response.indexOf("```");
        const codeEnd = response.indexOf("```", codeStart + 3);
        const language = response.slice(codeStart + 3, response.indexOf("\n", codeStart)).trim();
        const code = response.slice(response.indexOf("\n", codeStart) + 1, codeEnd);

        return `
            <div class="code-block">
                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                <pre><code class="${language}">${escapeHtml(code)}</code></pre>
            </div>
        `;
    } catch (error) {
        console.error("Error extracting code:", error);
        return "Code block parsing failed.";
    }
}

function extractGeneratedImage(response) {
    try {
        const jsonStart = response.indexOf("{");
        const jsonEnd = response.indexOf("}", jsonStart) + 1;
        const jsonString = response.slice(jsonStart, jsonEnd);
        const parsedImageDetails = JSON.parse(jsonString);

        const imageText = response.slice(jsonEnd + 1).trim();

        return `
            <div class="generated-image">
                <strong>Size:</strong> ${parsedImageDetails.size}<br>
                <strong>Prompt:</strong> ${parsedImageDetails.prompt}<br>
                ${imageText ? `<div>${formatText(imageText)}</div>` : ''}
            </div>
        `;
    } catch (error) {
        console.error("Error extracting generated image:", error);
        return "Generated image parsing failed.";
    }
}

function appendBotMessage(content, isHTML = false) {
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message', 'bot');
    if (isHTML) {
        botMessage.innerHTML = content;
    } else {
        botMessage.textContent = content;
    }
    chatBody.appendChild(botMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function appendImageMessage(imageLink, textAfterImage) {
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message', 'bot');

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');
    const imageElement = document.createElement('img');
    imageElement.src = imageLink;
    imageContainer.appendChild(imageElement);

    botMessage.appendChild(imageContainer);
    if (textAfterImage) {
        const textNode = document.createElement('div');
        textNode.innerHTML = formatText(textAfterImage);
        botMessage.appendChild(textNode);
    }
    chatBody.appendChild(botMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function appendErrorMessage() {
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message', 'bot');
    botMessage.textContent = 'Naa juy something wrong dong, wa koy tubag!';
    chatBody.appendChild(botMessage);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function formatText(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\*(.*?)\*/g, '<em>$1</em>')
               .replace(/`(.*?)`/g, '<code>$1</code>');
}

function escapeHtml(unsafe) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return unsafe.replace(/[&<>"']/g, m => map[m]);
}

function copyCode(button) {
    const code = button.nextElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => (button.textContent = 'Copy'), 2000);
    });
}