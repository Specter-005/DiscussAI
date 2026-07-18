// ===== DiscussAI — Pure Static SPA v3.0 =====
// Auth, Voice Engine, Intelligent Debate, Professional Evaluation

(() => {
  'use strict';

  // ===== STATE =====
  const state = {
    theme: localStorage.getItem('discuss-ai-theme') || 'dark',
    currentPage: 'login',
    currentUser: null,
    // Setup
    topics: [],
    selectedTopicId: null,
    difficulty: 'medium',
    aiCount: 3,
    voiceStyle: 'female',
    // Session
    sessionActive: false,
    sessionTopic: null,
    sessionDifficulty: 'medium',
    sessionAiCount: 3,
    sessionMessages: [],
    sessionParticipants: [],
    turnsUsed: 0,
    timerRemaining: 0,
    timerInterval: null,
    typingPersona: null,
    sessionEnded: false,
    // TTS
    ttsMuted: false,
    ttsSpeaking: null,
    ttsQueue: [],
    ttsBusy: false,
    // Voice Input
    isRecording: false,
    liveTranscript: '',
    mediaRecorder: null,
    recognition: null,
    recordingTimer: null,
    recordingTime: 0,
    audioContext: null,
    analyser: null,
    animFrame: null,
  };

  // ===== CONFIG =====
  const DIFFICULTY_CONFIG = {
    easy: { timer: 300, turns: 8, label: '5-min session, 8 turns.' },
    medium: { timer: 480, turns: 6, label: '8-min session, 6 turns.' },
    hard: { timer: 720, turns: 4, label: '12-min session, 4 turns.' },
  };

  const AI_PROFILES = [
    { name:'Alex', emoji:'🧠', role:'Logical Thinker', color:'#00d4ff' },
    { name:'Jordan', emoji:'📊', role:'Data Analyst', color:'#a855f7' },
    { name:'Casey', emoji:'⚡', role:'Aggressive Debater', color:'#ef4444' },
    { name:'Morgan', emoji:'🔮', role:'The Visionary', color:'#22c55e' },
    { name:'Riley', emoji:'🎯', role:'The Skeptic', color:'#f59e0b' },
  ];

  const DEFAULT_TOPICS = [
    { id:1, title:"Is AI replacing human creativity?", category:"Technology" },
    { id:2, title:"Should social media be regulated?", category:"Social Issues" },
    { id:3, title:"Remote work vs office culture", category:"Business" },
    { id:4, title:"Is cryptocurrency the future of finance?", category:"Technology" },
    { id:5, title:"Climate change: individual vs systemic action", category:"Environment" },
    { id:6, title:"The ethics of genetic engineering", category:"Science" },
    { id:7, title:"Universal basic income: pros and cons", category:"Economics" },
    { id:8, title:"Mental health in the digital age", category:"Health" },
    { id:9, title:"Should there be a limit on personal wealth?", category:"Ethics" },
    { id:10, title:"Automation and the future of employment", category:"Business" },
    { id:11, title:"Are we too dependent on technology?", category:"Technology" },
    { id:12, title:"The role of government in education", category:"Education" },
    { id:13, title:"Should space exploration be prioritized?", category:"Science" },
    { id:14, title:"Impact of social media on democracy", category:"Politics" },
    { id:15, title:"Is traditional education obsolete?", category:"Education" },
    { id:16, title:"Should voting be mandatory?", category:"Politics" },
    { id:17, title:"Is cancel culture harmful?", category:"Social Issues" },
    { id:18, title:"Nuclear energy: savior or threat?", category:"Environment" },
    { id:19, title:"Privacy as a fundamental digital right", category:"Ethics" },
    { id:20, title:"Should college education be free?", category:"Education" },
    { id:21, title:"Electric vehicles: hype or revolution?", category:"Technology" },
    { id:22, title:"Does media play a fair role in elections?", category:"Politics" },
    { id:23, title:"Should euthanasia be legalized globally?", category:"Ethics" },
    { id:24, title:"Impact of IPL on cricket", category:"Sports" },
    { id:25, title:"Performance-enhancing drugs in sports", category:"Sports" },
  ];

  // ===== UTILS =====
  function $(sel, ctx=document) { return ctx.querySelector(sel); }
  function $$(sel, ctx=document) { return [...ctx.querySelectorAll(sel)]; }
  function el(tag, attrs={}, ...children) {
    const e = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) {
      if (k === 'className') e.className = v;
      else if (k === 'innerHTML') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    }
    for (const c of children) {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c) e.appendChild(c);
    }
    return e;
  }
  function showToast(title, desc, variant='default') {
    const container = $('#toast-container');
    const t = el('div', { className: 'toast' },
      el('div', {},
        el('div', { className: 'toast-title' }, title),
        desc ? el('div', { className: 'toast-desc' }, desc) : null
      )
    );
    if (variant === 'destructive') t.style.borderLeft = '4px solid var(--danger)';
    container.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }
  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  function timeAgo(date) { return new Date(date).toLocaleDateString(); }
  function getScoreColor(score) {
    if (score < 40) return 'var(--danger)';
    if (score < 65) return 'var(--warning)';
    return 'var(--success)';
  }
  function loadTopics() {
    const custom = JSON.parse(localStorage.getItem('discuss-ai-custom-topics') || '[]');
    state.topics = [...DEFAULT_TOPICS, ...custom];
  }
  function getSessionHistory() {
    const key = `discuss-ai-sessions-${state.currentUser?.username || 'guest'}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  function saveSessionHistory(record) {
    const key = `discuss-ai-sessions-${state.currentUser?.username || 'guest'}`;
    const h = getSessionHistory();
    const idx = h.findIndex(x => x.id === record.id);
    if (idx >= 0) h[idx] = record; else h.push(record);
    localStorage.setItem(key, JSON.stringify(h));
  }

  // ===== AUTH MANAGER =====
  const AuthManager = {
    _getUsers() { return JSON.parse(localStorage.getItem('discuss-ai-users') || '{}'); },
    _saveUsers(users) { localStorage.setItem('discuss-ai-users', JSON.stringify(users)); },
    async _hash(password, salt) {
      const data = new TextEncoder().encode(salt + password);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
    },
    async signup(username, displayName, password) {
      const users = this._getUsers();
      if (users[username]) return { ok: false, error: 'Username already exists' };
      if (username.length < 3) return { ok: false, error: 'Username must be at least 3 characters' };
      if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters' };
      const salt = crypto.getRandomValues(new Uint8Array(16)).join('');
      const hash = await this._hash(password, salt);
      users[username] = { displayName, salt, hash, created: Date.now() };
      this._saveUsers(users);
      return { ok: true };
    },
    async login(username, password) {
      const users = this._getUsers();
      const user = users[username];
      if (!user) return { ok: false, error: 'User not found' };
      const hash = await this._hash(password, user.salt);
      if (hash !== user.hash) return { ok: false, error: 'Incorrect password' };
      const session = { username, displayName: user.displayName, loggedInAt: Date.now() };
      localStorage.setItem('discuss-ai-session', JSON.stringify(session));
      return { ok: true, session };
    },
    logout() {
      localStorage.removeItem('discuss-ai-session');
      state.currentUser = null;
    },
    getSession() {
      try { return JSON.parse(localStorage.getItem('discuss-ai-session')); }
      catch { return null; }
    },
    isLoggedIn() { return !!this.getSession(); },
  };

  // ===== VOICE ENGINE =====
  const VoiceEngine = {
    voices: [],
    maleVoices: [],
    femaleVoices: [],
    init() {
      const loadVoices = () => {
        this.voices = speechSynthesis.getVoices();
        this.categorize();
      };
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    },
    categorize() {
      const femalePatterns = /female|zira|hazel|susan|linda|karen|samantha|fiona|moira|victoria|kate|princess|ava|allison|helena|sabina|paulina/i;
      const malePatterns = /male|david|james|daniel|richard|mark|george|alex|thomas|oliver|fred|ralph|lee|rishi|aaron/i;
      const enVoices = this.voices.filter(v => v.lang.startsWith('en'));
      this.femaleVoices = enVoices.filter(v => femalePatterns.test(v.name) && !malePatterns.test(v.name));
      this.maleVoices = enVoices.filter(v => malePatterns.test(v.name));
      // Fallback: if none categorized, split by index
      if (this.femaleVoices.length === 0 && enVoices.length > 0) {
        this.femaleVoices = enVoices.filter((_, i) => i % 2 === 0);
        this.maleVoices = enVoices.filter((_, i) => i % 2 === 1);
      }
      if (this.maleVoices.length === 0) this.maleVoices = enVoices;
      if (this.femaleVoices.length === 0) this.femaleVoices = enVoices;
    },
    getVoiceForPersona(personaName, style) {
      const pool = style === 'male' ? this.maleVoices : this.femaleVoices;
      if (pool.length === 0) return null;
      // Deterministic pick based on persona name
      const hash = personaName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      return pool[hash % pool.length];
    },
    getVoiceParams(personaName, style) {
      const configs = {
        female: {
          Alex: { rate: 0.95, pitch: 1.15 },
          Jordan: { rate: 1.05, pitch: 1.2 },
          Casey: { rate: 1.1, pitch: 1.3 },
          Morgan: { rate: 0.95, pitch: 1.1 },
          Riley: { rate: 0.9, pitch: 1.05 },
        },
        male: {
          Alex: { rate: 0.9, pitch: 0.8 },
          Jordan: { rate: 1.0, pitch: 0.85 },
          Casey: { rate: 1.05, pitch: 0.9 },
          Morgan: { rate: 0.9, pitch: 0.75 },
          Riley: { rate: 0.85, pitch: 0.7 },
        },
      };
      return (configs[style] || configs.female)[personaName] || { rate: 1, pitch: 1 };
    },
    preview(style) {
      speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance("Hello, I'm ready to debate. Let's begin.");
      const voice = this.getVoiceForPersona('Alex', style);
      if (voice) utt.voice = voice;
      const params = this.getVoiceParams('Alex', style);
      utt.rate = params.rate; utt.pitch = params.pitch; utt.volume = 0.8;
      speechSynthesis.speak(utt);
    },
  };

  // ===== THEME =====
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const btn = $('#theme-toggle');
    if (btn) btn.textContent = state.theme === 'dark' ? '🌙' : '☀️';
  }
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('discuss-ai-theme', state.theme);
    applyTheme();
  }

  // ===== ROUTING =====
  function navigate(page, data={}) {
    // Auth gate
    if (!['login','signup'].includes(page) && !AuthManager.isLoggedIn()) {
      page = 'login';
    }
    state.currentPage = page;
    $$('.page').forEach(p => p.classList.remove('active'));
    const target = $(`#${page}-page`);
    if (target) target.classList.add('active');

    const navbar = $('#main-navbar');
    navbar.style.display = ['session','login','signup'].includes(page) ? 'none' : 'flex';

    if (page === 'home') renderHome();
    else if (page === 'setup') renderSetup();
    else if (page === 'session') startSession(data);
    else if (page === 'feedback') renderFeedback(data);
    else if (page === 'analytics') renderAnalytics();
    else if (page === 'login') initLoginPage();
    else if (page === 'signup') initSignupPage();

    window.scrollTo(0, 0);
  }

  function updateUserBadge() {
    const session = AuthManager.getSession();
    if (!session) return;
    state.currentUser = session;
    const avatar = $('#user-avatar');
    const name = $('#user-display-name');
    if (avatar) avatar.textContent = session.displayName.charAt(0).toUpperCase();
    if (name) name.textContent = session.displayName;
  }

  // ===== AUTH PAGES =====
  function initLoginPage() {
    const form = $('#login-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const username = $('#login-username').value.trim();
      const password = $('#login-password').value;
      if (!username || !password) return;
      const btn = $('#login-submit-btn');
      btn.disabled = true; btn.textContent = 'SIGNING IN...';
      const result = await AuthManager.login(username, password);
      if (result.ok) {
        state.currentUser = result.session;
        updateUserBadge();
        showToast('Welcome back!', `Signed in as ${result.session.displayName}`);
        navigate('home');
        requestMicPermission();
      } else {
        showToast('Login Failed', result.error, 'destructive');
      }
      btn.disabled = false; btn.textContent = 'SIGN IN';
    };
    $('#goto-signup').onclick = (e) => { e.preventDefault(); navigate('signup'); };
  }

  function initSignupPage() {
    const form = $('#signup-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const username = $('#signup-username').value.trim();
      const displayName = $('#signup-displayname').value.trim();
      const password = $('#signup-password').value;
      const confirm = $('#signup-confirm').value;
      if (password !== confirm) {
        showToast('Error', 'Passwords do not match', 'destructive');
        return;
      }
      const btn = $('#signup-submit-btn');
      btn.disabled = true; btn.textContent = 'CREATING...';
      const result = await AuthManager.signup(username, displayName, password);
      if (result.ok) {
        showToast('Account Created!', 'You can now sign in.');
        navigate('login');
      } else {
        showToast('Signup Failed', result.error, 'destructive');
      }
      btn.disabled = false; btn.textContent = 'CREATE ACCOUNT';
    };
    $('#goto-login').onclick = (e) => { e.preventDefault(); navigate('login'); };
  }

  async function requestMicPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch {}
  }

  // ===== HOME PAGE =====
  function renderHome() { updateUserBadge(); }

  // ===== SETUP PAGE =====
  function renderSetup() {
    loadTopics();
    const topicsList = $('#topics-list');
    const searchInput = $('#topic-search');
    const summaryTopic = $('#summary-topic');
    const summaryDiff = $('#summary-diff');
    const summaryAi = $('#summary-ai');
    const summaryVoice = $('#summary-voice');
    const aiCountDisplay = $('#ai-count-display');
    const aiRange = $('#ai-range');
    const startBtn = $('#start-session-btn');

    state.selectedTopicId = null;
    state.difficulty = 'medium';
    state.aiCount = 3;
    state.voiceStyle = 'female';

    function renderTopics(filter = '') {
      topicsList.innerHTML = '';
      const q = filter.toLowerCase();
      const filtered = state.topics.filter(t => !q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
      if (filtered.length === 0) {
        topicsList.innerHTML = '<p style="text-align:center;padding:40px 0;color:var(--text-muted)">No topics found.</p>';
        return;
      }
      filtered.forEach(topic => {
        const isCustom = topic.id > 100;
        const item = el('button', {
          className: `topic-item ${state.selectedTopicId === topic.id ? 'selected' : ''}`,
          onClick: () => {
            state.selectedTopicId = topic.id;
            renderTopics(searchInput.value);
            summaryTopic.textContent = topic.title;
            startBtn.disabled = false;
          }
        },
          el('div', { className: 'title' }, topic.title, isCustom ? el('span', { className: 'badge-custom' }, 'Custom') : null),
          el('div', { className: 'category' }, `📁 ${topic.category}`)
        );
        topicsList.appendChild(item);
      });
    }

    renderTopics();
    searchInput.value = '';
    searchInput.oninput = () => renderTopics(searchInput.value);

    // Difficulty buttons
    $$('.diff-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.diff === state.difficulty);
      btn.onclick = () => {
        state.difficulty = btn.dataset.diff;
        $$('.diff-btn').forEach(b => b.classList.toggle('selected', b.dataset.diff === state.difficulty));
        summaryDiff.textContent = state.difficulty.toUpperCase();
        summaryDiff.style.color = state.difficulty === 'easy' ? 'var(--success)' : state.difficulty === 'medium' ? 'var(--warning)' : 'var(--danger)';
      };
    });

    // AI count
    aiCountDisplay.textContent = state.aiCount;
    aiRange.value = state.aiCount;
    aiRange.oninput = () => {
      state.aiCount = parseInt(aiRange.value);
      aiCountDisplay.textContent = state.aiCount;
      summaryAi.textContent = `${state.aiCount} AI + You`;
    };

    // Voice selector
    const femaleBtn = $('#voice-female-btn');
    const maleBtn = $('#voice-male-btn');
    femaleBtn.classList.add('selected');
    maleBtn.classList.remove('selected');
    femaleBtn.onclick = () => { state.voiceStyle = 'female'; femaleBtn.classList.add('selected'); maleBtn.classList.remove('selected'); summaryVoice.textContent = 'Female'; };
    maleBtn.onclick = () => { state.voiceStyle = 'male'; maleBtn.classList.add('selected'); femaleBtn.classList.remove('selected'); summaryVoice.textContent = 'Male'; };
    $('#voice-preview-btn').onclick = () => VoiceEngine.preview(state.voiceStyle);

    // Start button
    startBtn.disabled = true;
    startBtn.onclick = () => {
      if (!state.selectedTopicId) return;
      navigate('session', { topicId: state.selectedTopicId, difficulty: state.difficulty, aiCount: state.aiCount });
    };

    // Reset summary
    summaryTopic.textContent = 'Awaiting selection...';
    summaryDiff.textContent = 'MEDIUM';
    summaryDiff.style.color = 'var(--warning)';
    summaryAi.textContent = '3 AI + You';
    summaryVoice.textContent = 'Female';

    // Custom topic
    const createBtn = $('#create-topic-toggle');
    const createForm = $('#create-topic-form');
    createBtn.onclick = () => createForm.classList.toggle('hidden');
    $('#create-topic-submit').onclick = () => {
      const title = $('#new-topic-title').value.trim();
      const category = $('#new-topic-category').value;
      if (!title) return;
      const id = Date.now();
      const custom = JSON.parse(localStorage.getItem('discuss-ai-custom-topics') || '[]');
      custom.push({ id, title, category });
      localStorage.setItem('discuss-ai-custom-topics', JSON.stringify(custom));
      loadTopics();
      renderTopics(searchInput.value);
      $('#new-topic-title').value = '';
      createForm.classList.add('hidden');
      showToast('Topic Created!', 'Your custom topic is ready.');
    };
  }

  // ===== TTS =====
  function ttsSpeak(text, persona) {
    if (state.ttsMuted || !window.speechSynthesis) return;
    const clean = text.replace(/^(Alex|Jordan|Casey|Morgan|Riley):\s*/i, '');
    state.ttsQueue.push({ text: clean, persona });
    ttsProcessQueue();
  }
  function ttsProcessQueue() {
    if (state.ttsBusy || state.ttsQueue.length === 0) return;
    const { text, persona } = state.ttsQueue.shift();
    state.ttsBusy = true;
    state.ttsSpeaking = persona;
    updatePersonaSidebar();
    const utt = new SpeechSynthesisUtterance(text);
    const voice = VoiceEngine.getVoiceForPersona(persona, state.voiceStyle);
    if (voice) utt.voice = voice;
    const params = VoiceEngine.getVoiceParams(persona, state.voiceStyle);
    utt.rate = params.rate; utt.pitch = params.pitch; utt.volume = 0.8;
    utt.onend = utt.onerror = () => { state.ttsBusy = false; state.ttsSpeaking = null; updatePersonaSidebar(); ttsProcessQueue(); };
    speechSynthesis.speak(utt);
  }
  function ttsReplay(text, persona) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    state.ttsBusy = false; state.ttsQueue = [];
    state.ttsMuted = false;
    ttsSpeak(text, persona);
  }
  function ttsStopAll() {
    speechSynthesis?.cancel();
    state.ttsBusy = false; state.ttsSpeaking = null; state.ttsQueue = [];
    updatePersonaSidebar();
  }
  function ttsToggleMute() {
    state.ttsMuted = !state.ttsMuted;
    if (state.ttsMuted) ttsStopAll();
    const btn = $('#mute-btn');
    if (btn) { btn.textContent = state.ttsMuted ? '🔇' : '🔊'; btn.classList.toggle('muted', state.ttsMuted); }
  }

  // ===== SESSION =====
  function startSession({ topicId, difficulty, aiCount }) {
    const topic = state.topics.find(t => t.id === topicId);
    if (!topic) { navigate('home'); return; }

    state.sessionActive = true;
    state.sessionTopic = topic;
    state.sessionDifficulty = difficulty;
    state.sessionAiCount = aiCount;
    state.sessionMessages = [];
    state.turnsUsed = 0;
    state.sessionEnded = false;
    state.typingPersona = null;
    state.ttsMuted = false;
    state.ttsQueue = [];
    state.ttsBusy = false;
    state.ttsSpeaking = null;
    state.sessionParticipants = AI_PROFILES.slice(0, aiCount);

    if (typeof ResponseEngine !== 'undefined' && ResponseEngine.resetTracker) {
      ResponseEngine.resetTracker();
    }

    const cfg = DIFFICULTY_CONFIG[difficulty];
    state.timerRemaining = cfg.timer;
    renderSessionUI();
    startTimer();
  }

  function renderSessionUI() {
    const topic = state.sessionTopic;
    $('#session-topic-label').textContent = topic.title;
    updateTimerDisplay();
    updateTurnDisplay();

    const muteBtn = $('#mute-btn');
    muteBtn.textContent = '🔊';
    muteBtn.classList.remove('muted');
    muteBtn.onclick = ttsToggleMute;
    $('#terminate-btn').onclick = endSession;

    const sidebar = $('#persona-sidebar');
    sidebar.innerHTML = `<div class="sidebar-title">Active Personas (${state.sessionAiCount})</div>`;
    state.sessionParticipants.forEach(p => {
      sidebar.innerHTML += `
        <div class="persona-card" id="persona-card-${p.name}">
          <div class="persona-avatar" style="border-color:${p.color}">${p.emoji}</div>
          <div>
            <div class="persona-name">${p.name}</div>
            <div class="persona-role">${p.role}</div>
            <div class="speaking-badge hidden" id="speaking-${p.name}">SPEAKING...</div>
          </div>
        </div>`;
    });

    $('#messages-area').innerHTML = `
      <div style="text-align:center;padding:60px 0;color:var(--text-muted)">
        <div style="font-size:2rem;opacity:0.2;margin-bottom:12px">💬</div>
        <div style="font-family:var(--font-display);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.15em">Awaiting initial input...</div>
      </div>`;

    const chatInput = $('#chat-input');
    chatInput.value = '';
    chatInput.disabled = false;
    $('#chat-form').onsubmit = (e) => { e.preventDefault(); handleSendMessage(); };
    const micBtn = $('#mic-btn');
    micBtn.className = 'mic-btn';
    micBtn.textContent = '🎤';
    micBtn.onclick = handleVoiceToggle;
    $('#voice-preview').classList.add('hidden');
    $('#waveform-area').classList.add('hidden');
    $('#skip-ai-area').classList.add('hidden');

    // Remove pressure class
    $('.session-header').classList.remove('pressure');
  }

  function updatePersonaSidebar() {
    state.sessionParticipants.forEach(p => {
      const card = $(`#persona-card-${p.name}`);
      const badge = $(`#speaking-${p.name}`);
      if (!card || !badge) return;
      card.classList.toggle('speaking', state.ttsSpeaking === p.name);
      badge.classList.toggle('hidden', state.ttsSpeaking !== p.name);
    });
  }

  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      if (state.sessionEnded) return;
      state.timerRemaining--;
      updateTimerDisplay();
      // Pressure indicator
      const total = DIFFICULTY_CONFIG[state.sessionDifficulty].timer;
      const ratio = state.timerRemaining / total;
      const header = $('.session-header');
      if (header) {
        if (ratio <= 0.2) header.classList.add('pressure');
        else header.classList.remove('pressure');
      }
      if (state.timerRemaining <= 0) {
        clearInterval(state.timerInterval);
        showToast('⏱️ Time\'s up!', 'Session ended.', 'destructive');
        endSession();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const r = state.timerRemaining;
    const total = DIFFICULTY_CONFIG[state.sessionDifficulty].timer;
    const progress = r / total;
    let color = 'var(--success)';
    if (progress <= 0.2) color = 'var(--danger)';
    else if (progress <= 0.5) color = 'var(--warning)';
    const circumference = 2 * Math.PI * 22;
    const offset = circumference * (1 - progress);
    const timerRing = $('#timer-ring');
    timerRing.className = `timer-ring ${r <= 60 && r > 0 ? 'timer-flash' : ''}`;
    timerRing.innerHTML = `
      <svg width="56" height="56">
        <circle cx="28" cy="28" r="22" fill="none" stroke="var(--glass-border)" stroke-width="3"/>
        <circle cx="28" cy="28" r="22" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset 1s linear,stroke 0.5s"/>
      </svg>
      <div class="time-text" style="color:${color}">${formatTime(r)}</div>`;
  }

  function updateTurnDisplay() {
    const cfg = DIFFICULTY_CONFIG[state.sessionDifficulty];
    const remaining = cfg.turns - state.turnsUsed;
    const icons = $('#turn-icons');
    icons.innerHTML = '';
    for (let i = 0; i < cfg.turns; i++) {
      icons.innerHTML += `<span class="turn-icon ${i < state.turnsUsed ? 'used' : ''}">💬</span>`;
    }
    const left = $('#turns-left');
    left.textContent = `${remaining} left`;
    left.style.color = remaining <= 1 ? 'var(--danger)' : remaining <= 2 ? 'var(--warning)' : 'var(--primary)';
  }

  function addMessage(content, sender, isAi, personaColor=null) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    state.sessionMessages.push({ content, sender, isAi, time });
    const area = $('#messages-area');
    if (state.sessionMessages.length === 1) area.innerHTML = '';
    const msgEl = el('div', { className: `message ${isAi ? 'ai' : 'user'}` });
    const metaEl = el('div', { className: 'message-meta' }, el('span', {}, sender), el('span', {}, time));
    const contentEl = el('div', { className: 'message-content' });
    if (personaColor) contentEl.style.borderLeftColor = personaColor;
    contentEl.textContent = content;
    if (isAi) {
      const replayBtn = el('button', { className: 'replay-btn', title: 'Replay audio', onClick: () => ttsReplay(content, sender) }, '🔊');
      contentEl.appendChild(replayBtn);
    }
    const wrapper = el('div', {});
    wrapper.appendChild(metaEl);
    wrapper.appendChild(contentEl);
    msgEl.appendChild(wrapper);
    area.appendChild(msgEl);
    area.scrollTop = area.scrollHeight;
  }

  function showTypingIndicator(persona) {
    state.typingPersona = persona;
    const area = $('#messages-area');
    const indicator = el('div', { className: 'message ai typing-indicator', id: 'typing-indicator' });
    indicator.innerHTML = `<div><div class="message-meta">${persona}</div><div class="message-content"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>`;
    area.appendChild(indicator);
    area.scrollTop = area.scrollHeight;
  }

  function hideTypingIndicator() {
    state.typingPersona = null;
    const el = $('#typing-indicator');
    if (el) el.remove();
  }

  async function handleSendMessage() {
    const input = $('#chat-input');
    const content = input.value.trim();
    if (!content || state.sessionEnded) return;
    const cfg = DIFFICULTY_CONFIG[state.sessionDifficulty];
    if (state.turnsUsed >= cfg.turns) {
      showToast('No turns left!', 'Session ending...', 'destructive');
      endSession();
      return;
    }
    input.value = '';
    state.turnsUsed++;
    updateTurnDisplay();
    addMessage(content, 'You', false);
    $('#skip-ai-area').classList.remove('hidden');

    const numResponders = Math.min(1 + Math.floor(Math.random() * 2), state.sessionParticipants.length);
    const shuffled = [...state.sessionParticipants].sort(() => Math.random() - 0.5);
    const responders = shuffled.slice(0, numResponders);

    for (let i = 0; i < responders.length; i++) {
      if (state.sessionEnded) break;
      const ai = responders[i];
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
      if (state.sessionEnded) break;
      showTypingIndicator(ai.name);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
      if (state.sessionEnded) break;
      const prevAiMsg = i > 0 ? state.sessionMessages.filter(m => m.isAi).slice(-1)[0] : null;
      const response = ResponseEngine.generateResponse(ai, state.sessionTopic.title, state.sessionMessages, prevAiMsg);
      hideTypingIndicator();
      addMessage(response, ai.name, true, ai.color);
      ttsSpeak(response, ai.name);
    }
    $('#skip-ai-area').classList.add('hidden');
    if (state.turnsUsed >= cfg.turns) {
      setTimeout(() => { showToast('All turns used!', 'Session ending...', 'destructive'); endSession(); }, 2000);
    }
  }

  function endSession() {
    if (state.sessionEnded) return;
    state.sessionEnded = true;
    state.sessionActive = false;
    if (state.timerInterval) clearInterval(state.timerInterval);
    ttsStopAll();
    stopRecording();
    hideTypingIndicator();
    $('#skip-ai-area').classList.add('hidden');
    const id = Date.now();
    saveSessionHistory({
      id, topicTitle: state.sessionTopic.title,
      difficulty: state.sessionDifficulty, date: new Date().toISOString(),
      turnsUsed: state.turnsUsed,
    });
    setTimeout(() => navigate('feedback', { sessionId: id }), 500);
  }

  // ===== VOICE INPUT =====
  async function handleVoiceToggle() {
    if (state.isRecording) {
      stopRecording();
      if (state.liveTranscript.trim()) $('#chat-input').value = state.liveTranscript.trim();
    } else {
      try { await startRecordingFn(); }
      catch { showToast('Microphone Error', 'Please allow microphone access.', 'destructive'); }
    }
  }

  async function startRecordingFn() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.isRecording = true;
    state.liveTranscript = '';
    state.recordingTime = 0;
    const ctx = new AudioContext();
    state.audioContext = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    src.connect(analyser);
    state.analyser = analyser;
    const recorder = new MediaRecorder(stream);
    state.mediaRecorder = recorder;
    recorder.start(250);
    recorder.onstop = () => stream.getTracks().forEach(t => t.stop());
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const recog = new SR();
      recog.continuous = true; recog.interimResults = true; recog.lang = 'en-US';
      recog.onresult = (e) => {
        let t = '';
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        state.liveTranscript = t;
        const preview = $('#voice-transcript');
        if (preview) preview.textContent = t;
      };
      state.recognition = recog;
      try { recog.start(); } catch {}
    }
    state.recordingTimer = setInterval(() => {
      state.recordingTime++;
      const countdown = $('#voice-countdown');
      if (countdown) countdown.textContent = `${30 - state.recordingTime}s`;
      if (state.recordingTime >= 30) stopRecording();
    }, 1000);
    const waveEl = $('#waveform-bars');
    function updateWave() {
      if (!state.isRecording) return;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const bars = waveEl.children;
      for (let i = 0; i < Math.min(bars.length, data.length); i++) {
        bars[i].style.height = Math.max(4, (data[i] / 255) * 32) + 'px';
      }
      state.animFrame = requestAnimationFrame(updateWave);
    }
    updateWave();
    $('#mic-btn').className = 'mic-btn recording';
    $('#mic-btn').textContent = '⏹️';
    $('#voice-preview').classList.remove('hidden');
    $('#waveform-area').classList.remove('hidden');
    const countdown = $('#voice-countdown');
    if (countdown) countdown.textContent = '30s';
  }

  function stopRecording() {
    if (!state.isRecording) return;
    state.isRecording = false;
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') state.mediaRecorder.stop();
    if (state.recognition) try { state.recognition.stop(); } catch {}
    if (state.recordingTimer) clearInterval(state.recordingTimer);
    if (state.animFrame) cancelAnimationFrame(state.animFrame);
    if (state.audioContext) try { state.audioContext.close(); } catch {}
    $('#mic-btn').className = 'mic-btn';
    $('#mic-btn').textContent = '🎤';
    $('#voice-preview').classList.add('hidden');
    $('#waveform-area').classList.add('hidden');
  }

  // ===== FEEDBACK PAGE =====
  async function renderFeedback({ sessionId }) {
    const container = $('#feedback-content');
    container.innerHTML = `
      <div style="text-align:center;padding:80px 0">
        <div style="margin-bottom:24px;position:relative;width:96px;height:96px;margin:0 auto 24px">
          <div style="position:absolute;inset:0;border:4px solid var(--glass-border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite"></div>
          <div style="position:absolute;inset:8px;border:4px solid transparent;border-bottom-color:var(--secondary);border-radius:50%;animation:spin 1.5s linear infinite reverse"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.5rem;animation:pulse 2s infinite">⚖️</div>
        </div>
        <h2 style="font-size:1.5rem;font-family:var(--font-display);margin-bottom:8px">JUDGING PERFORMANCE</h2>
        <p style="color:var(--text-muted);max-width:400px;margin:0 auto">The judge panel is evaluating your argument strength, evidence usage, rebuttals, and delivery...</p>
      </div>`;

    await new Promise(r => setTimeout(r, 2000));
    const evalData = ResponseEngine.generateEvaluation(state.sessionMessages, state.sessionTopic?.title || 'Unknown');

    // Save
    const history = getSessionHistory();
    const record = history.find(h => h.id === sessionId) || { id: sessionId, topicTitle: state.sessionTopic?.title || 'Unknown', difficulty: state.sessionDifficulty, date: new Date().toISOString() };
    record.overallScore = evalData.overallScore;
    record.verdict = evalData.verdict;
    record.placementReadiness = evalData.placementReadiness;
    saveSessionHistory(record);

    const score = evalData.overallScore;
    const skills = [
      { name: 'Argument Strength', ...evalData.argumentStrength },
      { name: 'Evidence Usage', ...evalData.evidenceUsage },
      { name: 'Clarity', ...evalData.clarity },
      { name: 'Rebuttal Quality', ...evalData.rebuttalQuality },
      { name: 'Topic Adherence', ...evalData.topicAdherence },
      { name: 'Delivery', ...evalData.delivery },
    ];
    const readinessClass = { 'Not Ready':'badge-danger', 'Developing':'badge-warning', 'Almost Ready':'badge-success', 'Ready':'badge-primary' }[evalData.placementReadiness] || 'badge-primary';
    const verdictClass = evalData.verdict === 'WON' ? 'verdict-won' : evalData.verdict === 'LOST' ? 'verdict-lost' : 'verdict-draw';
    const verdictIcon = evalData.verdict === 'WON' ? '🏆' : evalData.verdict === 'LOST' ? '❌' : '🤝';
    const gaugeR = 72, gaugeC = 2 * Math.PI * gaugeR, gaugeOff = gaugeC * (1 - score / 100);

    let html = `
      <div class="feedback-header animate-in">
        <div class="sub">⚖️ Judge's Panel Evaluation</div>
        <h1>Debate <span class="gradient">Verdict</span></h1>
        ${state.sessionTopic ? `<p class="text-muted" style="margin-top:8px;font-size:0.9rem">Topic: ${state.sessionTopic.title}</p>` : ''}
      </div>
      <div class="verdict-banner ${verdictClass} animate-in animate-in-delay-1">
        <div class="verdict-icon">${verdictIcon}</div>
        <div class="verdict-text">
          <h2>YOU ${evalData.verdict}</h2>
          <p>${evalData.verdictReason}</p>
        </div>
      </div>
      <div class="judge-card animate-in animate-in-delay-2">
        <div class="judge-label">⚖️ Judge's Summary</div>
        <p>"${evalData.judgeSummary}"</p>
      </div>
      <div class="readiness-badge ${readinessClass} animate-in animate-in-delay-2">
        🏅 PLACEMENT READINESS: ${(evalData.placementReadiness || 'Developing').toUpperCase()}
      </div>
      <div class="feedback-grid">
        <div class="animate-in animate-in-delay-3">
          <div class="card gauge-card" style="margin-bottom:24px">
            <h4>Overall Score</h4>
            <div class="gauge-wrap">
              <svg width="176" height="176">
                <circle cx="88" cy="88" r="${gaugeR}" fill="none" stroke="var(--glass-border)" stroke-width="8"/>
                <circle cx="88" cy="88" r="${gaugeR}" fill="none" stroke="${getScoreColor(score)}" stroke-width="8" stroke-linecap="round"
                  stroke-dasharray="${gaugeC}" stroke-dashoffset="${gaugeOff}" class="gauge-animate"/>
              </svg>
              <div class="score-text">
                <div class="num" style="color:${getScoreColor(score)}">${score}</div>
                <div class="den">/100</div>
              </div>
            </div>
          </div>
          <div class="card" style="padding:16px">
            <canvas id="radar-chart" height="250"></canvas>
          </div>
        </div>
        <div class="animate-in animate-in-delay-4">
          <div class="card" style="margin-bottom:24px;padding:24px">
            <h3 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-muted);margin-bottom:20px">📈 Skill Breakdown (6 Categories)</h3>
            ${skills.map((s, i) => `
              <div class="skill-row">
                <div class="skill-header">
                  <span>${s.name}</span>
                  <span class="score" style="color:${getScoreColor(s.score)}">${s.score}/100</span>
                </div>
                <div class="skill-bar">
                  <div class="skill-bar-inner skill-bar-fill" style="width:${s.score}%;background:${getScoreColor(s.score)};animation-delay:${i * 0.15}s"></div>
                </div>
                <div class="skill-tip"><strong>Feedback:</strong> ${s.feedback}${s.tip ? `<br><strong>Tip:</strong> ${s.tip}` : ''}</div>
              </div>`).join('')}
          </div>`;

    // Weak Arguments
    if (evalData.weakArguments && evalData.weakArguments.length > 0) {
      html += `<div class="card" style="padding:20px;margin-bottom:20px">
        <h4 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--danger);margin-bottom:14px">❌ Your Weakest Arguments</h4>
        ${evalData.weakArguments.map(w => `
          <div class="quote-card">
            <div class="quote-text">"${w.quote}"</div>
            <div class="quote-reason">${w.reason}</div>
          </div>`).join('')}
      </div>`;
    }

    // Missed Opportunities
    if (evalData.missedOpportunities && evalData.missedOpportunities.length > 0) {
      html += `<div class="card" style="padding:20px;margin-bottom:20px">
        <h4 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--warning);margin-bottom:14px">⚠️ Missed Opportunities</h4>
        ${evalData.missedOpportunities.map(o => `<div class="opp-card">${o}</div>`).join('')}
      </div>`;
    }

    // Logical Fallacies
    if (evalData.fallacies && evalData.fallacies.length > 0) {
      html += `<div class="card" style="padding:20px;margin-bottom:20px">
        <h4 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--secondary);margin-bottom:14px">🧩 Logical Fallacies Detected</h4>
        ${evalData.fallacies.map(f => `
          <div class="fallacy-card">
            <div class="fallacy-name">${f.name}</div>
            <div class="fallacy-desc">${f.quote}</div>
          </div>`).join('')}
      </div>`;
    }

    // Transcript + Navigation
    html += `
          <button class="btn btn-ghost" id="toggle-transcript" style="margin-bottom:16px">📝 View Full Transcript</button>
          <div class="card transcript-area hidden" id="transcript-area">
            ${state.sessionMessages.map(m => `
              <div class="transcript-msg ${m.isAi ? 'ai-msg' : 'user-msg'}">
                <span class="name">${m.sender}:</span> ${m.content}
              </div>`).join('')}
          </div>
          <div style="display:flex;gap:12px;margin-top:24px">
            <button class="btn btn-primary" onclick="window.discussAI.navigate('setup')">Start New Session</button>
            <button class="btn btn-ghost" onclick="window.discussAI.navigate('analytics')">View Analytics</button>
          </div>
        </div>
      </div>`;

    container.innerHTML = html;

    $('#toggle-transcript').onclick = () => {
      const area = $('#transcript-area');
      area.classList.toggle('hidden');
      $('#toggle-transcript').textContent = area.classList.contains('hidden') ? '📝 View Full Transcript' : '📝 Hide Transcript';
    };

    // Radar chart
    setTimeout(() => {
      const canvas = document.getElementById('radar-chart');
      if (canvas && window.Chart) {
        new Chart(canvas.getContext('2d'), {
          type: 'radar',
          data: {
            labels: skills.map(s => s.name),
            datasets: [{ label: 'Score', data: skills.map(s => s.score),
              backgroundColor: 'rgba(0,240,255,0.15)', borderColor: 'var(--primary)', borderWidth: 2, pointBackgroundColor: 'var(--primary)' }]
          },
          options: {
            responsive: true,
            scales: { r: { min:0, max:100, grid:{color:'var(--chart-grid)'}, angleLines:{color:'var(--chart-grid)'}, ticks:{display:false}, pointLabels:{color:'var(--text-muted)',font:{size:10}} } },
            plugins: { legend: { display: false } }
          }
        });
      }
    }, 100);
  }

  // ===== ANALYTICS PAGE =====
  function renderAnalytics() {
    const sessions = getSessionHistory();
    const scored = sessions.filter(s => s.overallScore != null);
    const container = $('#analytics-content');
    if (sessions.length === 0) {
      container.innerHTML = `
        <div class="empty-state animate-in">
          <div class="icon">📊</div>
          <h2>No Sessions <span class="text-primary">Yet</span></h2>
          <p>Complete your first debate session to see your analytics.</p>
          <button class="btn btn-primary btn-lg" onclick="window.discussAI.navigate('setup')">Start Your First Session</button>
        </div>`;
      return;
    }
    const avgScore = scored.length ? Math.round(scored.reduce((s, x) => s + x.overallScore, 0) / scored.length) : 0;
    const bestScore = scored.length ? Math.max(...scored.map(s => s.overallScore)) : 0;
    const wins = scored.filter(s => s.verdict === 'WON').length;

    container.innerHTML = `
      <div class="animate-in" style="margin-bottom:32px">
        <div style="font-size:0.7rem;color:var(--primary);text-transform:uppercase;letter-spacing:0.15em;font-family:var(--font-display);margin-bottom:8px">📊 Progress Tracking</div>
        <h1 style="font-size:clamp(2rem,4vw,3rem);font-weight:900;text-transform:uppercase;letter-spacing:0.05em">Your <span class="gradient">Analytics</span></h1>
      </div>
      <div class="stats-grid">
        <div class="card stat-card glow-top-cyan animate-in animate-in-delay-1" style="position:relative">
          <div class="stat-label">🎯 Sessions</div>
          <div class="stat-value">${sessions.length}</div>
        </div>
        <div class="card stat-card animate-in animate-in-delay-2">
          <div class="stat-label">📈 Average</div>
          <div class="stat-value">${avgScore}<span class="stat-unit">/100</span></div>
        </div>
        <div class="card stat-card glow-top-purple animate-in animate-in-delay-3" style="position:relative">
          <div class="stat-label">🏆 Wins</div>
          <div class="stat-value text-success">${wins}</div>
        </div>
      </div>
      <div class="charts-grid">
        <div class="card chart-card animate-in animate-in-delay-4">
          <h3>Score Progress (Last 5)</h3>
          <canvas id="line-chart" height="260"></canvas>
        </div>
        <div class="card chart-card animate-in animate-in-delay-5">
          <h3>Best Score: ${bestScore}/100</h3>
          <canvas id="analytics-radar" height="260"></canvas>
        </div>
      </div>
      <div class="card animate-in animate-in-delay-5" style="padding:24px">
        <h3 style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-muted);margin-bottom:16px">📅 Recent Sessions</h3>
        <table class="history-table">
          <thead><tr><th>Date</th><th>Topic</th><th style="text-align:center">Score</th><th style="text-align:center">Verdict</th></tr></thead>
          <tbody>
            ${[...sessions].reverse().slice(0, 10).map(s => `
              <tr>
                <td style="color:var(--text-muted);font-size:0.8rem">${timeAgo(s.date)}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.topicTitle}</td>
                <td style="text-align:center;font-family:var(--font-display);font-weight:700">${s.overallScore ?? '—'}</td>
                <td style="text-align:center;font-size:0.75rem;font-weight:700" class="${s.verdict === 'WON' ? 'text-success' : s.verdict === 'LOST' ? 'text-danger' : 'text-warning'}">${s.verdict || '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    setTimeout(() => {
      if (!window.Chart) return;
      const last5 = scored.slice(-5);
      const lineCtx = document.getElementById('line-chart');
      if (lineCtx) {
        new Chart(lineCtx.getContext('2d'), {
          type: 'line',
          data: { labels: last5.map((_, i) => `Session ${i + 1}`), datasets: [{ label: 'Score', data: last5.map(s => s.overallScore), borderColor: 'var(--primary)', backgroundColor: 'var(--primary-dim)', borderWidth: 3, pointRadius: 5, tension: 0.3, fill: true }] },
          options: { responsive: true, scales: { y: { min:0, max:100, grid:{color:'var(--chart-grid)'}, ticks:{color:'var(--text-muted)'} }, x: { grid:{color:'var(--chart-grid)'}, ticks:{color:'var(--text-muted)'} } }, plugins: { legend: { display: false } } }
        });
      }
    }, 200);
  }

  // ===== QUICK START =====
  function quickStart() {
    loadTopics();
    const randomTopic = state.topics[Math.floor(Math.random() * state.topics.length)];
    navigate('session', { topicId: randomTopic.id, difficulty: 'medium', aiCount: 3 });
    showToast('⚡ Quick Start!', `Topic: ${randomTopic.title}`);
  }

  // ===== INIT =====
  function init() {
    applyTheme();
    loadTopics();
    VoiceEngine.init();

    // Theme toggle
    const themeBtn = $('#theme-toggle');
    if (themeBtn) themeBtn.onclick = toggleTheme;

    // Navigation clicks
    $$('[data-navigate]').forEach(el => {
      el.onclick = (e) => { e.preventDefault(); navigate(el.dataset.navigate); };
    });

    // Quick start
    const qsBtn = $('#quick-start-btn');
    if (qsBtn) qsBtn.onclick = quickStart;

    // Logout
    const logoutBtn = $('#logout-btn');
    if (logoutBtn) logoutBtn.onclick = () => {
      AuthManager.logout();
      showToast('Logged out', 'See you next time!');
      navigate('login');
    };

    // Skip AI button
    const skipBtn = $('#skip-ai-btn');
    if (skipBtn) skipBtn.onclick = () => {
      hideTypingIndicator();
      ttsStopAll();
      $('#skip-ai-area').classList.add('hidden');
    };

    // Check existing session
    if (AuthManager.isLoggedIn()) {
      state.currentUser = AuthManager.getSession();
      updateUserBadge();
      navigate('home');
    } else {
      navigate('login');
    }
  }

  window.discussAI = { navigate };
  document.addEventListener('DOMContentLoaded', init);
})();
