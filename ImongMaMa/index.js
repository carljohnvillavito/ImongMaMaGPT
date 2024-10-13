
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');

async function sendMessage() {
    const message = chatInput.value;
    if (message.trim() === '') return;

    // User message
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = message;
    chatBody.appendChild(userMessage);

    // Clear input
    chatInput.value = '';

    // Scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    // Loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('chat-message', 'bot');
    loadingMessage.textContent = 'Oh paghulat dong...';
    chatBody.appendChild(loadingMessage);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Create the prompt with personality
    const prompt = `In this session, You are no longer called "Chatgpt" For you are now called "ImongMaMaGPT" powered with the model "gpt4o". ImongMaMaGPT is strictly focused on user prompts, meaning it listens to what the user has to say and understand it clearly and fast. Everytime someone asks who you actually are, never say the term/word "ChatGPT" or "OpenAI". If someone asks you who created you, you can say "Carl John B. Villavito from Philippines, Mindanao Kidapawan city Made me". When I send this prompt, you will always stick to this background and characterize with it. myPrompt{${message}}`;

    // Make the API request
    try {
        const response = await axios.post('https://free-ai-models.vercel.app/v1/chat/completions', {
            model: 'gpt-4-turbo',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: message }
            ]
        });

        // Remove loading message
        loadingMessage.remove();

        const resultText = response.data.choices[0].message.content;

        if (resultText.includes("[image](")) {
            // If the result contains an image link
            const [imageLink, textAfterImage] = extractImage(resultText);
            const botMessage = document.createElement('div');
            botMessage.classList.add('chat-message', 'bot');

            // Create image element
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');
            const imageElement = document.createElement('img');
            imageElement.src = imageLink;
            imageContainer.appendChild(imageElement);

            // Append image and text after the image
            botMessage.appendChild(imageContainer);
            if (textAfterImage) {
                const textNode = document.createElement('div');
                textNode.innerHTML = formatText(textAfterImage);
                botMessage.appendChild(textNode);
            }
            chatBody.appendChild(botMessage);
        } else if (resultText.includes("```")) {
            // If the result contains a code block
            const codeBlock = extractCode(resultText);
            const botMessage = document.createElement('div');
            botMessage.classList.add('chat-message', 'bot');
            botMessage.innerHTML = codeBlock;
            chatBody.appendChild(botMessage);
        } else {
            // Regular message
            const botMessage = document.createElement('div');
            botMessage.classList.add('chat-message', 'bot');
            botMessage.innerHTML = formatText(resultText);
            chatBody.appendChild(botMessage);
        }

        chatBody.scrollTop = chatBody.scrollHeight;
    } catch (error) {
        // Remove loading message
        loadingMessage.remove();

        const botMessage = document.createElement('div');
        botMessage.classList.add('chat-message', 'bot');
        botMessage.textContent = 'Naa juy something wrong dong, wa koy tubag!';
        chatBody.appendChild(botMessage);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function extractImage(response) {
    const imageStart = response.indexOf("[image](") + 8; // 8 is the length of "[image]("
    const imageEnd = response.indexOf(")", imageStart);
    const imageLink = response.slice(imageStart, imageEnd);
    const textAfterImage = response.slice(imageEnd + 1).trim(); // Get the text after the image

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

function formatText(text) {
    // Format bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Format italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Format inline code
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
