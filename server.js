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

// Serve index.html at /chat
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'ImongMaMa', 'index.html'));
});

// Example proxy route to bypass CORS for bot API
app.get('/api/ask', async (req, res) => {
    const userMessage = req.query.ask;
    if (!userMessage) return res.status(400).json({ error: 'Missing "ask" parameter' });

    try {
        const botRes = await axios.get(`https://hiroshi-api.onrender.com/ai/cohere?ask=${encodeURIComponent(userMessage)}`);
        res.json(botRes.data);
    } catch (err) {
        console.error('Proxy error:', err.message);
        res.status(500).json({ error: 'Failed to fetch from Hiroshi API' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
