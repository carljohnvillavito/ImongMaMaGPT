const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'ImongMaMa')));

app.get('/', (req, res) => {
    res.redirect('/chat');
});

// Serve index.html for the /chat route as well
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'ImongMaMa', 'index.html')); // Change to chat.html if you have specific content for chat
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
