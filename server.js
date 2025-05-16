const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// TEMP: Allow all origins (for development only)
app.use(cors());

// Serve static files from the "ImongMaMa" directory
app.use(express.static(path.join(__dirname, 'ImongMaMa')));

// Redirect root to /chat
app.get('/', (req, res) => {
    res.redirect('/chat');
});

app.get('', (req, res) => {
    res.redirect('/chat');
});

// Serve index.html at /chat
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'ImongMaMa', 'index.html'));
});

// Example proxy route to bypass CORS for bot API
app.use(express.json({ limit: '10mb' })); // Allow base64 image payloads

app.post('/api/ask', async (req, res) => {
    const { prompt, uid, img, system } = req.body;

    if (!prompt || !uid || !system) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const payload = {
        prompt,
        uid,
        system
    };

    // Only include `img` if an image is uploaded
    if (img && typeof img === 'string' && img.startsWith('data:image')) {
        payload.img = img;
    }

    try {
        const response = await axios.post(
            'https://zaikyoov3-up.up.railway.app/api/anthropic-claude-3-7-sonnet',
            payload
        );

        res.json({ reply: response.data.reply });
    } catch (err) {
        console.error('Proxy error:', err.message);
        res.status(500).json({ error: 'Proxy failed to reach Claude API.' });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}\nEnjoy!`);
});
