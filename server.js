const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use(express.static(path.join(__dirname, 'ImongMaMa')));

app.get('/', (req, res) => {
    res.redirect('/chat');
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'ImongMaMa', 'index.html'));
});

// Main chatbot proxy to new API (no model/image logic, only prompt, uid, and system prompt)
app.post('/api/ask', async (req, res) => {
    const { prompt, uid, system } = req.body;

    if (!prompt || !uid || !system) {
        return res.status(400).json({ error: 'Missing prompt, uid, or system' });
    }

    try {
        const apiUrl = `https://haji-mix-api.gleeze.com/api/gpt4o?ask=${encodeURIComponent(prompt)}&uid=${encodeURIComponent(uid)}&roleplay=${encodeURIComponent(system)}&api_key=12c8883f30b463857aabb5a76a9a4ce421a6497b580a347bdaf7666dc2191e25`;

        const response = await axios.get(apiUrl);

        // Your API returns: { user_ask: "...", answer: "..." }
        res.json({ answer: response.data.answer || "No response received." });
    } catch (error) {
        console.error('Proxy error:', error.response?.status, error.response?.data || error.message);
        res.status(500).json({
            error: 'Proxy failed to reach main API',
            status: error.response?.status || 500,
            message: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
