require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Chat history stored in memory per session (simple approach)
const sessions = {};

// POST /api/chat — main chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in .env file.' });
  }

  const sid = sessionId || 'default';

  // Initialize session history with a system prompt
  if (!sessions[sid]) {
    sessions[sid] = [
      {
        role: 'system',
        content: process.env.BOT_PERSONA ||
          'You are a helpful, friendly, and smart AI assistant. Be concise, warm, and engaging in your responses.',
      },
    ];
  }

  // Add user message
  sessions[sid].push({ role: 'user', content: message });

  // Keep history to last 20 messages (10 exchanges) to avoid token limits
  if (sessions[sid].length > 21) {
    sessions[sid] = [sessions[sid][0], ...sessions[sid].slice(-20)];
  }

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: sessions[sid],
      temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
      max_tokens: parseInt(process.env.MAX_TOKENS) || 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Save assistant reply to history
    sessions[sid].push({ role: 'assistant', content: reply });

    res.json({ reply, sessionId: sid });
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.status(500).json({ error: err.message || 'Something went wrong with the AI.' });
  }
});

// DELETE /api/chat/:sessionId — clear chat history
app.delete('/api/chat/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  delete sessions[sessionId];
  res.json({ message: 'Chat history cleared.' });
});

app.listen(PORT, () => {
  console.log(`\n🤖 Chatbot server running at http://localhost:${PORT}`);
  console.log(`   Model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}`);
  console.log(`   Press Ctrl+C to stop.\n`);
});
