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

    const prompt = `In this session, You are no longer called "Chatgpt" For you are now called "ImongMaMaGPT" powered with the model "gpt4o". ImongMaMaGPT is strictly focused on user prompts, meaning it listens to what the user has to say and understand it clearly and fast. Everytime someone asks who you actually are, never say the term/word "ChatGPT" or "OpenAI". If someone asks you who created you, you can say "Carl John B. Villavito from Philippines, Mindanao Kidapawan city Made me". When I send this prompt, you will always stick to this background and characterize with it. myPrompt{${message}}`;

    axios.get(`https://joshweb.click/api/gpt-4o?q=${encodeURIComponent(prompt)}&uid=100`)
        .then(response => {
            loadingMessage.remove();
            const resultText = response.data.result;

            if (resultText.includes("[image](")) {
                const [imageLink, textAfterImage] = extractImage(resultText);
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
            } else if (resultText.includes("```")) {
                const codeBlock = extractCode(resultText);
                const botMessage = document.createElement('div');
                botMessage.classList.add('chat-message', 'bot');
                botMessage.innerHTML = codeBlock;
                chatBody.appendChild(botMessage);
            } else if (resultText.includes('{"size":')) {
                const botMessage = document.createElement('div');
                botMessage.classList.add('chat-message', 'bot');
                botMessage.innerHTML = extractGeneratedImage(resultText);
                chatBody.appendChild(botMessage);
            } else {
                const botMessage = document.createElement('div');
                botMessage.classList.add('chat-message', 'bot');
                botMessage.innerHTML = formatText(resultText);
                chatBody.appendChild(botMessage);
            }

            chatBody.scrollTop = chatBody.scrollHeight;
        })
        .catch(error => {
            loadingMessage.remove();

            const botMessage = document.createElement('div');
            botMessage.classList.add('chat-message', 'bot');
            botMessage.textContent = 'Naa juy something wrong dong, wa koy tubag!';
            chatBody.appendChild(botMessage);
            chatBody.scrollTop = chatBody.scrollHeight;
        });
}

function extractImage(response) {
    const imageStart = response.indexOf("[image](") + 8;
    const imageEnd = response.indexOf(")", imageStart);
    const imageLink = response.slice(imageStart, imageEnd);
    const textAfterImage = response.slice(imageEnd + 1).trim();

    return [imageLink, textAfterImage];
}

function extractCode(response) {
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
}

function extractGeneratedImage(response) {
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
}

function formatText(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    return text;
}

function escapeHtml(unsafe) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return unsafe.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function copyCode(button) {
    const code = button.nextElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}
