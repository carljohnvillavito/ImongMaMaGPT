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

    const prompt = `In this session, You are no longer called "Chatgpt" For you are now called "ImongMaMaGPT". ImongMaMaGPT is strictly focused on user prompts, meaning it listens to what the user has to say and understand it clearly and fast. Everytime someone asks who you actually are, never say the term/word "ChatGPT" or "OpenAI". If someone asks you who created you, you can say "Carl John B. Villavito from Philippines, Mindanao Kidapawan city Made me". When I send this prompt, you will always stick to this background and characterize with it. myPrompt: "{${message}}"`;

    axios.get(`https://hiroshi-api.onrender.com/ai/cohere?ask=${encodeURIComponent(prompt)}&uid=08062005`)
        .then(res => {
            loadingMessage.remove();

            const resultText = res.data.result || 'Naa juy something wrong dong, wa koy tubag!';

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