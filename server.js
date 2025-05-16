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

// Fixed proxy with conditional image + debug
app.post('/api/ask', async (req, res) => {
    const { prompt, uid, img, system } = req.body;

    if (!prompt || !uid || !system) {
        return res.status(400).json({ error: 'Missing prompt, uid, or system' });
    }

    const payload = { prompt, uid, system };
    if (img && img.startsWith('data:image')) {
        payload.img = img;
    }

    try {
        console.log('[Proxy] Sending payload to Claude API:', payload);

        const response = await axios.post(
            'https://zaikyoov3-up.up.railway.app/api/anthropic-claude-3-7-sonnet',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('[Proxy] Received response:', response.data);
        res.json({ reply: response.data.reply });
    } catch (error) {
        console.error('Proxy error:', error.response?.status, error.response?.data || error.message);
        res.status(500).json({
            error: 'Proxy failed to reach Claude API',
            status: error.response?.status || 500,
            message: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
