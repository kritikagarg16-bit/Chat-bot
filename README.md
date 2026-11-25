# My AI Chatbot 🤖

A personal AI chatbot powered by [Groq](https://groq.com/) — blazing fast responses with Llama 3.3!

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd my-chatbot
npm install
```

### 2. Set up your API key
Edit the `.env` file and paste your Groq API key:
```
GROQ_API_KEY=your_key_here
```
Get a free key at: https://console.groq.com/keys

### 3. Run the chatbot
```bash
npm start
```

Then open **http://localhost:3000** in your browser. That's it! ✨

---

## ⚙️ Customization (`.env`)

| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | Your Groq API key | *(required)* |
| `PORT` | Server port | `3000` |
| `GROQ_MODEL` | AI model to use | `llama-3.3-70b-versatile` |
| `BOT_PERSONA` | Your bot's personality | Helpful assistant |
| `TEMPERATURE` | Creativity (0–1) | `0.7` |
| `MAX_TOKENS` | Max response length | `1024` |

### Available Models
- `llama-3.3-70b-versatile` — Best quality
- `llama-3.1-8b-instant` — Fastest responses
- `mixtral-8x7b-32768` — Great for long context

---

## 📁 Project Structure
```
my-chatbot/
├── .env              ← Your secrets (never share this!)
├── .env.example      ← Template for the .env file
├── server.js         ← Express backend
├── package.json
└── public/
    ├── index.html    ← Chat UI
    ├── style.css     ← Styling
    └── script.js     ← Frontend logic
```

## 🔒 Security
- Never commit your `.env` file to git
- Regenerate your API key if it gets exposed
