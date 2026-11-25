const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const clearBtn = document.getElementById('clearBtn');

let sessionId = generateId();
let isLoading = false;

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function removeWelcome() {
  const welcome = messagesEl.querySelector('.welcome-screen');
  if (welcome) welcome.remove();
}

function scrollToBottom() {
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function autoResize() {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + 'px';
}

// ─── Render Messages ───────────────────────────────────────────────────────

function appendMessage(role, text) {
  removeWelcome();

  const wrap = document.createElement('div');
  wrap.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'bot' ? '🤖' : '🧑';

  const content = document.createElement('div');
  content.className = 'msg-content';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = getTime();

  content.appendChild(bubble);
  content.appendChild(time);
  wrap.appendChild(avatar);
  wrap.appendChild(content);

  messagesEl.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

function appendTyping() {
  removeWelcome();

  const wrap = document.createElement('div');
  wrap.className = 'message bot';
  wrap.id = 'typingWrap';

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '🤖';

  const content = document.createElement('div');
  content.className = 'msg-content';

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-dot';
    indicator.appendChild(dot);
  }

  content.appendChild(indicator);
  wrap.appendChild(avatar);
  wrap.appendChild(content);
  messagesEl.appendChild(wrap);
  scrollToBottom();
}

function removeTyping() {
  const tw = document.getElementById('typingWrap');
  if (tw) tw.remove();
}

function appendError(msg) {
  const el = document.createElement('div');
  el.className = 'error-msg';
  el.textContent = '⚠️ ' + msg;
  messagesEl.appendChild(el);
  scrollToBottom();
}

// ─── Send Message ──────────────────────────────────────────────────────────

async function sendMessage(text) {
  text = text.trim();
  if (!text || isLoading) return;

  isLoading = true;
  sendBtn.disabled = true;
  inputEl.disabled = true;
  inputEl.value = '';
  autoResize();

  appendMessage('user', text);
  appendTyping();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId }),
    });

    const data = await res.json();
    removeTyping();

    if (!res.ok) {
      appendError(data.error || 'Something went wrong. Try again.');
    } else {
      appendMessage('bot', data.reply);
    }
  } catch (err) {
    removeTyping();
    appendError('Could not reach the server. Make sure it is running.');
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    inputEl.disabled = false;
    inputEl.focus();
  }
}

// ─── Suggestion Chips ──────────────────────────────────────────────────────

window.sendSuggestion = function (text) {
  sendMessage(text);
};

// ─── New Chat / Clear ──────────────────────────────────────────────────────

function resetChat() {
  fetch(`/api/chat/${sessionId}`, { method: 'DELETE' }).catch(() => {});
  sessionId = generateId();
  messagesEl.innerHTML = '';
  messagesEl.innerHTML = `
    <div class="welcome-screen">
      <div class="welcome-icon">🤖</div>
      <h2>Hello! I'm your AI Assistant</h2>
      <p>Ask me anything — I'm here to help!</p>
      <div class="suggestion-chips">
        <button class="chip" onclick="sendSuggestion('What can you help me with?')">What can you help me with?</button>
        <button class="chip" onclick="sendSuggestion('Write me a poem about the stars')">Write a poem ✨</button>
        <button class="chip" onclick="sendSuggestion('Explain quantum computing simply')">Explain quantum computing</button>
        <button class="chip" onclick="sendSuggestion('Give me a fun fact!')">Fun fact 🎯</button>
      </div>
    </div>`;
}

newChatBtn.addEventListener('click', resetChat);
clearBtn.addEventListener('click', resetChat);

// ─── Event Listeners ───────────────────────────────────────────────────────

sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(inputEl.value);
  }
});

inputEl.addEventListener('input', autoResize);
