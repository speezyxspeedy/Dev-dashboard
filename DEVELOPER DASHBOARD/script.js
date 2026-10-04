/**
 * DevPulse — Developer Productivity Dashboard
 * 365-Day Build-in-Public Challenge Suite
 * 
 * Pure Vanilla JavaScript (No frameworks, no external libraries)
 * Storage: LocalStorage
 */

// ==========================================================================
// 1. STATE & STORAGE KEYS
// ==========================================================================
const STORAGE_KEYS = {
  USER: 'devpulse_user',
  TASKS: 'devpulse_tasks',
  LOGS: 'devpulse_logs',
  STATS: 'devpulse_stats',
  SETTINGS: 'devpulse_settings',
  DAYS: 'devpulse_days',
  TIMER: 'devpulse_timer'
};

// Initial Default State (Seed Data)
const DEFAULT_USER = {
  name: 'Developer',
  avatar: 'DEV',
  currentDay: 1,
  startDate: new Date().toISOString().split('T')[0]
};

const DEFAULT_SETTINGS = {
  theme: 'dark',
  dailyGoal: 2.0,
  soundEnabled: true,
  confettiEnabled: true
};

const DEFAULT_STATS = {
  streak: 1,
  longestStreak: 1,
  totalHours: 2.5,
  problemsSolved: 3,
  projectsBuilt: 1,
  completedDays: 1,
  pomodoroSessions: 1
};

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Practice C++ fundamentals & memory pointers',
    category: 'Learning',
    priority: 'high',
    completed: true,
    createdAt: Date.now() - 3600000 * 4,
    completedAt: Date.now() - 3600000 * 2
  },
  {
    id: 'task-2',
    title: 'Solve 3 DSA problems (Binary Trees & DFS)',
    category: 'DSA',
    priority: 'high',
    completed: true,
    createdAt: Date.now() - 3600000 * 3,
    completedAt: Date.now() - 3600000 * 1
  },
  {
    id: 'task-3',
    title: 'Commit today’s work to GitHub repository',
    category: 'General',
    priority: 'medium',
    completed: true,
    createdAt: Date.now() - 3600000 * 2,
    completedAt: Date.now() - 3600000 * 0.5
  },
  {
    id: 'task-4',
    title: 'Write Day 1 build-in-public dev log',
    category: 'Project',
    priority: 'high',
    completed: true,
    createdAt: Date.now() - 3600000 * 1,
    completedAt: Date.now() - 600000
  },
  {
    id: 'task-5',
    title: 'Implement 365-day contribution calendar matrix',
    category: 'Project',
    priority: 'medium',
    completed: false,
    createdAt: Date.now()
  }
];

const DEFAULT_LOGS = [
  {
    id: 'log-day-1',
    challengeDay: 1,
    date: new Date().toISOString().split('T')[0],
    hours: 2.5,
    problems: 3,
    mood: '🚀 Productive',
    learned: 'Deep-dived into CSS Grid layout techniques, responsive SVGs, and synthesized audio frequencies using the native Web Audio API.',
    built: 'Kicked off Day 1 of my 365-day challenge by architecting DevPulse — a portfolio-grade developer productivity dashboard with a Pomodoro timer and contribution graph.',
    problemsFaced: 'Calibrating the 53-week calendar matrix so day columns and month labels stay aligned across desktop, tablet, and mobile screens without external charting libraries.',
    tomorrowGoal: 'Refine analytics charts, add custom goal tracking, and conquer 3 graph traversal problems on LeetCode.',
    createdAt: Date.now()
  }
];

// In-Memory App State
let appState = {
  user: { ...DEFAULT_USER },
  settings: { ...DEFAULT_SETTINGS },
  stats: { ...DEFAULT_STATS },
  tasks: [...DEFAULT_TASKS],
  logs: [...DEFAULT_LOGS],
  days: {} // dayNumber (1-365) => day object
};

// ==========================================================================
// 2. FOCUS TIMER ENGINE (POMODORO)
// ==========================================================================
const TIMER_DURATIONS = {
  'focus': 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60
};

let timerState = {
  mode: 'focus', // 'focus' | 'short-break' | 'long-break'
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  isRunning: false,
  intervalId: null
};

// ==========================================================================
// 3. SOUND SYNTHESIS ENGINE (Web Audio API - No external mp3 files needed)
// ==========================================================================
class SoundSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSuccess() {
    if (!appState.settings.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Soft uplifting major triad: C5 (523Hz), E5 (659Hz), G5 (784Hz)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.7);
      });
    } catch (e) {
      console.warn('Audio playback suppressed', e);
    }
  }

  playChime() {
    if (!appState.settings.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio chime suppressed', e);
    }
  }

  playClick() {
    if (!appState.settings.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }
}
const sound = new SoundSynth();

// ==========================================================================
// 4. MICRO-CONFETTI CELEBRATION ENGINE (Pure Canvas)
// ==========================================================================
class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(originX = window.innerWidth / 2, originY = window.innerHeight / 3) {
    if (!appState.settings.confettiEnabled || !this.ctx) return;

    const colors = ['#3b82f6', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        life: 1
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.rotation += p.rotationSpeed;
      p.alpha -= 0.015;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }
}
let confetti;

// ==========================================================================
// 5. DATA PERSISTENCE & LOCALSTORAGE
// ==========================================================================
function loadData() {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) appState.user = JSON.parse(storedUser);

    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (storedSettings) appState.settings = JSON.parse(storedSettings);

    const storedStats = localStorage.getItem(STORAGE_KEYS.STATS);
    if (storedStats) appState.stats = JSON.parse(storedStats);

    const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (storedTasks) appState.tasks = JSON.parse(storedTasks);

    const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (storedLogs) appState.logs = JSON.parse(storedLogs);

    const storedDays = localStorage.getItem(STORAGE_KEYS.DAYS);
    if (storedDays) {
      appState.days = JSON.parse(storedDays);
    } else {
      initializeDaysSeed();
    }
  } catch (err) {
    console.error('Failed to parse localStorage data:', err);
    initializeDaysSeed();
  }
}

function saveData(key = null) {
  try {
    if (!key || key === STORAGE_KEYS.USER) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.user));
    }
    if (!key || key === STORAGE_KEYS.SETTINGS) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appState.settings));
    }
    if (!key || key === STORAGE_KEYS.STATS) {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(appState.stats));
    }
    if (!key || key === STORAGE_KEYS.TASKS) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(appState.tasks));
    }
    if (!key || key === STORAGE_KEYS.LOGS) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(appState.logs));
    }
    if (!key || key === STORAGE_KEYS.DAYS) {
      localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(appState.days));
    }
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

/**
 * Initialize 365 days matrix seed data.
 * Marks Day 1 as completed with high activity, and past warm-up days if needed.
 */
function initializeDaysSeed() {
  appState.days = {};
  for (let i = 1; i <= 365; i++) {
    appState.days[i] = {
      dayNumber: i,
      hours: 0,
      tasksCompleted: 0,
      problemsSolved: 0,
      level: 0,
      logId: null
    };
  }

  // Pre-seed Day 1
  appState.days[1] = {
    dayNumber: 1,
    hours: 2.5,
    tasksCompleted: 4,
    problemsSolved: 3,
    level: 3,
    logId: 'log-day-1'
  };

  saveData(STORAGE_KEYS.DAYS);
}

// ==========================================================================
// 6. UI RENDERERS & VIEW ROUTING
// ==========================================================================

/**
 * Switch top-level view tabs without page reloads.
 */
function switchView(viewName) {
  // Update view containers
  const views = document.querySelectorAll('.app-view');
  views.forEach(view => {
    view.classList.toggle('active', view.id === `view-${viewName}`);
  });

  // Update sidebar links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewName);
  });

  // Update mobile bottom nav links
  const mobBtns = document.querySelectorAll('.mob-nav-btn');
  mobBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Re-render view-specific visuals when activated
  if (viewName === 'dashboard') {
    renderDashboard();
  } else if (viewName === 'tasks') {
    renderTasksView();
  } else if (viewName === 'daily-log') {
    renderLogs();
  } else if (viewName === 'progress') {
    renderProgressView();
  } else if (viewName === 'settings') {
    renderSettingsView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Update dynamic greetings, badges, and top-level stats.
 */
function renderDashboard() {
  const currentDay = appState.user.currentDay || 1;
  const userName = appState.user.name || 'Developer';

  // Greeting based on time of day
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 || hour < 5) timeOfDay = 'evening';

  const greetingEl = document.getElementById('header-greeting');
  if (greetingEl) {
    greetingEl.innerHTML = `Good ${timeOfDay}, ${escapeHtml(userName)} 👋`;
  }

  const subtitleEl = document.getElementById('header-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = `Day ${currentDay} of your 365-day build-in-public journey.`;
  }

  const dayTag = document.getElementById('header-day-tag');
  if (dayTag) dayTag.textContent = `Day ${currentDay} / 365`;

  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.textContent = userName;

  const sidebarAvatar = document.getElementById('sidebar-avatar');
  if (sidebarAvatar) {
    const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
    sidebarAvatar.textContent = initials || 'DEV';
  }

  const sidebarDay = document.getElementById('sidebar-user-day');
  if (sidebarDay) sidebarDay.textContent = `Day ${currentDay} of 365`;

  const mobStreak = document.getElementById('mobile-streak-val');
  if (mobStreak) mobStreak.textContent = `${appState.stats.streak}d`;

  // Render 4 Main Stat Cards
  updateStatsCards();

  // Render 365-Day Contribution Calendar
  renderCalendar();

  // Render Dashboard Task Preview
  renderDashboardTasks();

  // Render Dashboard Recent Logs
  renderDashboardRecentLogs();
}

/**
 * Render the 4 key stat cards with accurate values and progress fills.
 */
function updateStatsCards() {
  const stats = appState.stats;
  const currentDay = appState.user.currentDay || 1;
  const dailyGoal = appState.settings.dailyGoal || 2.0;

  // 1. Streak Card
  const currentStreakEl = document.getElementById('stat-current-streak');
  if (currentStreakEl) {
    currentStreakEl.innerHTML = `${stats.streak} <span class="stat-unit">${stats.streak === 1 ? 'Day' : 'Days'}</span>`;
  }
  const bestStreakPill = document.getElementById('stat-longest-streak-pill');
  if (bestStreakPill) {
    bestStreakPill.textContent = `Best: ${stats.longestStreak} ${stats.longestStreak === 1 ? 'Day' : 'Days'}`;
  }
  const streakBarFill = document.getElementById('streak-bar-fill');
  if (streakBarFill) {
    // 7-day target visual ratio
    const streakPct = Math.min(100, Math.max(10, (stats.streak / 7) * 100));
    streakBarFill.style.width = `${streakPct}%`;
  }

  // 2. Coding Hours Card
  const totalHoursEl = document.getElementById('stat-total-hours');
  if (totalHoursEl) {
    totalHoursEl.innerHTML = `${stats.totalHours.toFixed(1)} <span class="stat-unit">hrs</span>`;
  }
  const todayRecord = appState.days[currentDay] || { hours: 0 };
  const todayHoursBadge = document.getElementById('stat-today-hours-badge');
  if (todayHoursBadge) {
    todayHoursBadge.textContent = `+${todayRecord.hours.toFixed(1)} hrs today`;
  }
  const goalNote = document.getElementById('stat-goal-note');
  if (goalNote) {
    goalNote.textContent = `Goal: ${dailyGoal.toFixed(1)} hrs/day`;
  }
  const hoursBarFill = document.getElementById('hours-bar-fill');
  if (hoursBarFill) {
    const hoursPct = Math.min(100, Math.round((todayRecord.hours / dailyGoal) * 100));
    hoursBarFill.style.width = `${hoursPct}%`;
  }

  // 3. Problems Solved Card
  const problemsEl = document.getElementById('stat-problems-solved');
  if (problemsEl) {
    problemsEl.innerHTML = `${stats.problemsSolved} <span class="stat-unit">solved</span>`;
  }
  const problemsToday = document.getElementById('stat-problems-today');
  if (problemsToday) {
    problemsToday.textContent = `+${todayRecord.problemsSolved || 0} logged today`;
  }
  const problemsBarFill = document.getElementById('problems-bar-fill');
  if (problemsBarFill) {
    const probPct = Math.min(100, Math.max(15, (stats.problemsSolved / 10) * 100));
    problemsBarFill.style.width = `${probPct}%`;
  }

  // 4. Projects & Challenge Card
  const projectsEl = document.getElementById('stat-projects-count');
  if (projectsEl) {
    projectsEl.innerHTML = `${stats.projectsBuilt} <span class="stat-unit">${stats.projectsBuilt === 1 ? 'built' : 'built'}</span>`;
  }
  const challengeDayPill = document.getElementById('stat-challenge-day-pill');
  if (challengeDayPill) {
    challengeDayPill.textContent = `Day ${currentDay} of 365`;
  }
  const percentDone = ((currentDay / 365) * 100).toFixed(1);
  const percentDoneEl = document.getElementById('stat-percent-done');
  if (percentDoneEl) {
    percentDoneEl.textContent = `${percentDone}% completed`;
  }
  const challengeBarFill = document.getElementById('challenge-bar-fill');
  if (challengeBarFill) {
    challengeBarFill.style.width = `${percentDone}%`;
  }

  // Badges in sidebar nav
  const pendingTasksCount = appState.tasks.filter(t => !t.completed).length;
  const navTaskPill = document.getElementById('nav-task-count');
  if (navTaskPill) navTaskPill.textContent = pendingTasksCount;

  const navLogPill = document.getElementById('nav-log-count');
  if (navLogPill) navLogPill.textContent = appState.logs.length;
}

// ==========================================================================
// 7. 365-DAY CHALLENGE CONTRIBUTION CALENDAR (DYNAMIC JAVASCRIPT GENERATION)
// ==========================================================================
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthsRow = document.getElementById('calendar-months-row');
  if (!grid || !monthsRow) return;

  grid.innerHTML = '';
  monthsRow.innerHTML = '';

  const currentDay = appState.user.currentDay || 1;
  const totalDays = 365;
  const daysCompleted = Object.values(appState.days).filter(d => d.hours > 0 || d.tasksCompleted > 0 || d.level > 0).length;
  const daysRemaining = Math.max(0, totalDays - daysCompleted);
  const completionPct = ((daysCompleted / totalDays) * 100).toFixed(1);

  // Update calendar summary pills
  const calDone = document.getElementById('cal-completed-days');
  if (calDone) calDone.textContent = daysCompleted;

  const calRem = document.getElementById('cal-days-remaining');
  if (calRem) calRem.textContent = daysRemaining;

  const calPct = document.getElementById('cal-completion-pct');
  if (calPct) calPct.textContent = `${completionPct}%`;

  const todayText = document.getElementById('cal-today-text');
  if (todayText) todayText.textContent = `Today (Day ${currentDay})`;

  // Months label header row (approximate month distribution across 53 weeks)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthNames.forEach(m => {
    const monthSpan = document.createElement('span');
    monthSpan.className = 'calendar-month-label';
    monthSpan.textContent = m;
    monthsRow.appendChild(monthSpan);
  });

  // Total columns required for 365 days (53 columns of 7 rows = 371 cells max)
  const totalCells = 53 * 7;

  for (let cellIndex = 0; cellIndex < totalCells; cellIndex++) {
    const dayNumber = cellIndex + 1;
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';

    if (dayNumber <= 365) {
      const dayData = appState.days[dayNumber] || {
        dayNumber,
        hours: 0,
        tasksCompleted: 0,
        problemsSolved: 0,
        level: 0
      };

      // Assign activity intensity class (0 to 4)
      cell.classList.add(`level-${dayData.level}`);

      // Highlight today
      if (dayNumber === currentDay) {
        cell.classList.add('today-cell');
      }

      // Accessible tooltip and metadata
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('tabindex', '0');
      cell.dataset.day = dayNumber;
      cell.title = `Day ${dayNumber}: ${dayData.hours.toFixed(1)} hrs, ${dayData.tasksCompleted} tasks, ${dayData.problemsSolved} problems`;

      // Click to open Day Activity Details Modal
      cell.addEventListener('click', () => openDayModal(dayNumber));
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDayModal(dayNumber);
        }
      });
    } else {
      // Filler cells past 365 to fill the 53rd week grid gracefully
      cell.classList.add('level-0');
      cell.style.opacity = '0.15';
      cell.style.pointerEvents = 'none';
    }

    grid.appendChild(cell);
  }
}

/**
 * Open Day Activity Modal
 */
function openDayModal(dayNumber) {
  const modal = document.getElementById('modal-day-details');
  const modalBody = document.getElementById('modal-day-body');
  const modalBadge = document.getElementById('modal-day-badge');
  const modalTitle = document.getElementById('modal-day-title');
  const shortcutBtn = document.getElementById('modal-day-log-shortcut');
  if (!modal || !modalBody) return;

  const dayData = appState.days[dayNumber] || {
    dayNumber,
    hours: 0,
    tasksCompleted: 0,
    problemsSolved: 0,
    level: 0,
    logId: null
  };

  const isToday = dayNumber === appState.user.currentDay;
  const isFuture = dayNumber > appState.user.currentDay;

  modalBadge.textContent = `Challenge Day ${dayNumber} of 365`;
  modalTitle.textContent = isToday ? "Today's Activity" : `Day ${dayNumber} Overview`;

  // Find linked daily log if one exists
  const linkedLog = appState.logs.find(l => l.challengeDay === dayNumber);

  modalBody.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
      <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-sm); text-align: center;">
        <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Time Coded</div>
        <div style="font-family: var(--font-mono); font-size: 1.35rem; font-weight: 700; color: var(--cyan);">${dayData.hours.toFixed(1)}h</div>
      </div>
      <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-sm); text-align: center;">
        <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Tasks Done</div>
        <div style="font-family: var(--font-mono); font-size: 1.35rem; font-weight: 700; color: var(--emerald);">${dayData.tasksCompleted}</div>
      </div>
      <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-sm); text-align: center;">
        <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Problems</div>
        <div style="font-family: var(--font-mono); font-size: 1.35rem; font-weight: 700; color: var(--violet);">${dayData.problemsSolved}</div>
      </div>
    </div>

    ${linkedLog ? `
      <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <strong style="color: var(--text-main); font-size: 0.9rem;">📝 Daily Log Record</strong>
          <span style="font-size: 0.75rem; color: var(--emerald); font-weight: 600;">${linkedLog.mood || 'Productive'}</span>
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem;"><strong>Learned:</strong> ${escapeHtml(linkedLog.learned)}</p>
        <p style="font-size: 0.82rem; color: var(--text-secondary);"><strong>Built:</strong> ${escapeHtml(linkedLog.built)}</p>
      </div>
    ` : `
      <div style="text-align: center; padding: 1rem; color: var(--text-muted); font-size: 0.85rem;">
        ${isFuture ? '📅 Future challenge day. Keep coding each day to reach this milestone!' : 'No written log saved yet for this day.'}
      </div>
    `}
  `;

  // Shortcut button handler
  shortcutBtn.onclick = () => {
    closeModal(modal);
    switchView('daily-log');
    const dayInput = document.getElementById('log-hours-input');
    if (dayInput && isToday) dayInput.focus();
  };

  openModal(modal);
}

// ==========================================================================
// 8. FOCUS TIMER ENGINE (POMODORO)
// ==========================================================================
function initTimer() {
  updateTimerDisplay();

  // Mode buttons
  const modeBtns = document.querySelectorAll('.timer-mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      switchTimerMode(mode);
    });
  });

  // Toggle button (Start / Pause)
  const toggleBtn = document.getElementById('timer-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTimer);
  }

  // Reset button
  const resetBtn = document.getElementById('timer-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetTimer);
  }

  // Skip button
  const skipBtn = document.getElementById('timer-skip-btn');
  if (skipBtn) {
    skipBtn.addEventListener('click', skipTimer);
  }

  // Quick sidebar timer button
  const stQuickBtn = document.getElementById('st-quick-btn');
  if (stQuickBtn) {
    stQuickBtn.addEventListener('click', toggleTimer);
  }

  // Mobile timer pill jump
  const mobTimerPill = document.getElementById('mobile-timer-pill');
  if (mobTimerPill) {
    mobTimerPill.addEventListener('click', () => {
      switchView('dashboard');
      document.getElementById('section-timer')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function switchTimerMode(mode) {
  if (timerState.isRunning) {
    pauseTimer();
  }

  timerState.mode = mode;
  timerState.totalSeconds = TIMER_DURATIONS[mode] || 25 * 60;
  timerState.remainingSeconds = timerState.totalSeconds;

  // Update UI modes
  document.querySelectorAll('.timer-mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });

  const modeBadge = document.getElementById('timer-mode-badge');
  const stModeLabel = document.getElementById('st-mode-label');

  if (mode === 'focus') {
    if (modeBadge) modeBadge.textContent = 'Focus Session';
    if (stModeLabel) stModeLabel.textContent = 'Focus Session';
  } else if (mode === 'short-break') {
    if (modeBadge) modeBadge.textContent = 'Short Break';
    if (stModeLabel) stModeLabel.textContent = 'Short Break';
  } else if (mode === 'long-break') {
    if (modeBadge) modeBadge.textContent = 'Long Break';
    if (stModeLabel) stModeLabel.textContent = 'Long Break';
  }

  updateTimerDisplay();
}

function toggleTimer() {
  sound.playClick();
  if (timerState.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (timerState.isRunning) return;
  timerState.isRunning = true;

  updateTimerControlsUI();

  timerState.intervalId = setInterval(() => {
    if (timerState.remainingSeconds > 0) {
      timerState.remainingSeconds--;
      updateTimerDisplay();
    } else {
      onTimerCompleted();
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerState.isRunning) return;
  timerState.isRunning = false;
  clearInterval(timerState.intervalId);
  timerState.intervalId = null;
  updateTimerControlsUI();
}

function resetTimer() {
  sound.playClick();
  pauseTimer();
  timerState.remainingSeconds = timerState.totalSeconds;
  updateTimerDisplay();
}

function skipTimer() {
  sound.playClick();
  pauseTimer();
  if (timerState.mode === 'focus') {
    switchTimerMode('short-break');
  } else {
    switchTimerMode('focus');
  }
}

function onTimerCompleted() {
  pauseTimer();

  if (timerState.mode === 'focus') {
    // Automatically credit +25 mins = 0.42 hrs to today's coding hours
    const minutesAdded = 25;
    const hoursAdded = +(minutesAdded / 60).toFixed(2);
    appState.stats.totalHours = +(appState.stats.totalHours + hoursAdded).toFixed(2);
    appState.stats.pomodoroSessions = (appState.stats.pomodoroSessions || 0) + 1;

    // Update today's calendar day record
    const currentDay = appState.user.currentDay || 1;
    if (!appState.days[currentDay]) {
      appState.days[currentDay] = { dayNumber: currentDay, hours: 0, tasksCompleted: 0, problemsSolved: 0, level: 0 };
    }
    appState.days[currentDay].hours = +(appState.days[currentDay].hours + hoursAdded).toFixed(2);
    // Recalculate level
    appState.days[currentDay].level = calculateActivityLevel(appState.days[currentDay].hours);

    saveData();
    renderDashboard();

    sound.playSuccess();
    confetti.fire();

    showToast('🎉 Focus Session Completed!', `Awesome job! +${minutesAdded}m added to today's coding hours.`);

    // Automatically transition to Short Break
    switchTimerMode('short-break');
  } else {
    sound.playChime();
    showToast('☕ Break Time Over', 'Ready to get back into the flow? Starting focus mode.');
    switchTimerMode('focus');
  }
}

function updateTimerDisplay() {
  const mins = Math.floor(timerState.remainingSeconds / 60);
  const secs = timerState.remainingSeconds % 60;
  const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Main countdown
  const countdownEl = document.getElementById('timer-countdown');
  if (countdownEl) countdownEl.textContent = timeString;

  // Sidebar mini timer
  const stTimeEl = document.getElementById('st-time-display');
  if (stTimeEl) stTimeEl.textContent = timeString;

  // Mobile pill timer
  const mobTimeVal = document.getElementById('mobile-timer-val');
  if (mobTimeVal) mobTimeVal.textContent = timeString;

  // Browser Tab Title
  document.title = `${timeString} (${timerState.mode === 'focus' ? 'Focus' : 'Break'}) — DevPulse`;

  // SVG Circular Ring Progress
  // Perimeter of circle with r=95: 2 * Math.PI * 95 = ~596.90
  const circumference = 2 * Math.PI * 95;
  const progressRing = document.getElementById('timer-progress-ring');
  if (progressRing) {
    const fraction = timerState.remainingSeconds / timerState.totalSeconds;
    const offset = circumference * (1 - fraction);
    progressRing.style.strokeDashoffset = offset;

    // Mode-specific color stroke
    if (timerState.mode === 'focus') {
      progressRing.style.stroke = 'var(--cyan)';
    } else {
      progressRing.style.stroke = 'var(--emerald)';
    }
  }
}

function updateTimerControlsUI() {
  const toggleBtn = document.getElementById('timer-toggle-btn');
  const toggleText = document.getElementById('timer-toggle-text');
  const toggleIcon = document.getElementById('timer-toggle-icon');
  const stPulseDot = document.getElementById('st-pulse-dot');
  const stBtnText = document.getElementById('st-btn-text');

  if (timerState.isRunning) {
    if (toggleText) toggleText.textContent = 'Pause';
    if (toggleIcon) {
      toggleIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
    }
    if (stPulseDot) stPulseDot.classList.add('running');
    if (stBtnText) stBtnText.textContent = 'Pause';
  } else {
    if (toggleText) toggleText.textContent = timerState.remainingSeconds === timerState.totalSeconds ? 'Start Focus' : 'Resume';
    if (toggleIcon) {
      toggleIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
    }
    if (stPulseDot) stPulseDot.classList.remove('running');
    if (stBtnText) stBtnText.textContent = 'Start Focus';
  }
}

// ==========================================================================
// 9. TASK MANAGER (CRUD & ANIMATIONS)
// ==========================================================================
let currentTaskFilter = 'all'; // 'all' | 'active' | 'completed'

function initTasks() {
  // Quick task add form on dashboard
  const quickForm = document.getElementById('task-quick-form');
  if (quickForm) {
    quickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('task-quick-input');
      const catSelect = document.getElementById('task-quick-category');
      if (input && input.value.trim()) {
        addTask(input.value.trim(), catSelect ? catSelect.value : 'Project', 'medium');
        input.value = '';
      }
    });
  }

  // Full task add form on tasks page
  const fullForm = document.getElementById('task-full-form');
  if (fullForm) {
    fullForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('task-title-input');
      const catSelect = document.getElementById('task-category-select');
      const priSelect = document.getElementById('task-priority-select');
      if (titleInput && titleInput.value.trim()) {
        addTask(titleInput.value.trim(), catSelect.value, priSelect.value);
        titleInput.value = '';
      }
    });
  }

  // Filter tabs on tasks page
  const filterTabs = document.querySelectorAll('.task-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTaskFilter = tab.dataset.filter;
      renderTasksView();
    });
  });

  // Clear completed button
  const clearBtn = document.getElementById('btn-clear-completed-tasks');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const initialCount = appState.tasks.length;
      appState.tasks = appState.tasks.filter(t => !t.completed);
      const cleared = initialCount - appState.tasks.length;
      if (cleared > 0) {
        saveData(STORAGE_KEYS.TASKS);
        renderTasksView();
        renderDashboardTasks();
        showToast('Tasks Cleaned', `Removed ${cleared} completed tasks.`);
      }
    });
  }

  // Link from dashboard to full task manager
  const linkAllTasks = document.getElementById('link-view-all-tasks');
  if (linkAllTasks) {
    linkAllTasks.addEventListener('click', () => switchView('tasks'));
  }
}

function addTask(title, category = 'Project', priority = 'medium') {
  const newTask = {
    id: 'task-' + Date.now(),
    title,
    category,
    priority,
    completed: false,
    createdAt: Date.now()
  };

  appState.tasks.unshift(newTask);
  saveData(STORAGE_KEYS.TASKS);

  sound.playClick();
  showToast('Task added successfully', `"${title}" has been placed in your queue.`);

  renderTasksView();
  renderDashboardTasks();
  updateStatsCards();
}

function toggleTask(id) {
  const task = appState.tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  if (task.completed) {
    task.completedAt = Date.now();
    sound.playSuccess();
    confetti.fire();
    showToast('Task Completed! 🎯', `Great progress on "${task.title}"`);

    // Increment completed tasks count for current day
    const currentDay = appState.user.currentDay || 1;
    if (!appState.days[currentDay]) {
      appState.days[currentDay] = { dayNumber: currentDay, hours: 0, tasksCompleted: 0, problemsSolved: 0, level: 0 };
    }
    appState.days[currentDay].tasksCompleted = (appState.days[currentDay].tasksCompleted || 0) + 1;
    appState.days[currentDay].level = calculateActivityLevel(appState.days[currentDay].hours, appState.days[currentDay].tasksCompleted);
  } else {
    task.completedAt = null;
    sound.playClick();
  }

  saveData();
  renderTasksView();
  renderDashboardTasks();
  updateStatsCards();
  renderCalendar();
}

function deleteTask(id) {
  const taskIndex = appState.tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return;

  appState.tasks.splice(taskIndex, 1);
  saveData(STORAGE_KEYS.TASKS);
  sound.playClick();

  renderTasksView();
  renderDashboardTasks();
  updateStatsCards();
  showToast('Task Deleted', 'The task was removed from your list.');
}

function renderDashboardTasks() {
  const list = document.getElementById('dashboard-task-list');
  if (!list) return;

  list.innerHTML = '';
  const total = appState.tasks.length;
  const completed = appState.tasks.filter(t => t.completed).length;

  const countCompletedEl = document.getElementById('task-preview-completed-count');
  const countTotalEl = document.getElementById('task-preview-total-count');
  if (countCompletedEl) countCompletedEl.textContent = completed;
  if (countTotalEl) countTotalEl.textContent = total;

  if (appState.tasks.length === 0) {
    list.innerHTML = `<li style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No tasks yet today. Add your first goal above!</li>`;
    return;
  }

  // Show top 5 tasks in dashboard preview
  const previewTasks = appState.tasks.slice(0, 5);
  previewTasks.forEach(task => {
    const li = createTaskItemElement(task);
    list.appendChild(li);
  });
}

function renderTasksView() {
  const list = document.getElementById('tasks-full-list');
  const emptyState = document.getElementById('tasks-empty-state');
  if (!list) return;

  list.innerHTML = '';

  const total = appState.tasks.length;
  const completedCount = appState.tasks.filter(t => t.completed).length;
  const activeCount = total - completedCount;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  // Tab counts
  document.getElementById('count-all-tasks').textContent = total;
  document.getElementById('count-active-tasks').textContent = activeCount;
  document.getElementById('count-completed-tasks').textContent = completedCount;

  // Progress bar
  const barFill = document.getElementById('task-bar-fill');
  const barPct = document.getElementById('task-bar-pct');
  const summaryText = document.getElementById('tasks-summary-text');

  if (barFill) barFill.style.width = `${pct}%`;
  if (barPct) barPct.textContent = `${pct}%`;
  if (summaryText) summaryText.textContent = `${completedCount} / ${total} Completed (${pct}%)`;

  let filteredTasks = appState.tasks;
  if (currentTaskFilter === 'active') {
    filteredTasks = appState.tasks.filter(t => !t.completed);
  } else if (currentTaskFilter === 'completed') {
    filteredTasks = appState.tasks.filter(t => t.completed);
  }

  if (filteredTasks.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    filteredTasks.forEach(task => {
      const li = createTaskItemElement(task);
      list.appendChild(li);
    });
  }
}

function createTaskItemElement(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;
  li.dataset.id = task.id;

  const categoryClass = (task.category || 'general').toLowerCase();

  li.innerHTML = `
    <div class="task-checkbox-wrap">
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task complete">
    </div>
    <div class="task-body">
      <span class="task-title">${escapeHtml(task.title)}</span>
      <div class="task-tags-group">
        <span class="task-priority-dot ${task.priority || 'medium'}" title="Priority: ${task.priority}"></span>
        <span class="task-tag ${categoryClass}">${escapeHtml(task.category || 'General')}</span>
      </div>
    </div>
    <button class="task-delete-btn" aria-label="Delete task">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  // Attach event listeners
  const checkbox = li.querySelector('.task-checkbox');
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const deleteBtn = li.querySelector('.task-delete-btn');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  });

  return li;
}

// ==========================================================================
// 10. DAILY DEV LOG (BUILD-IN-PUBLIC JOURNAL)
// ==========================================================================
function initLogs() {
  const form = document.getElementById('daily-log-form');
  const dateInput = document.getElementById('log-date-input');

  // Set default date to today in YYYY-MM-DD
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveDailyLog();
    });
  }

  // Search input filter
  const searchInput = document.getElementById('log-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderLogs(e.target.value.trim().toLowerCase());
    });
  }

  // Dashboard quick log button
  const headerQuickLog = document.getElementById('header-quick-log-btn');
  if (headerQuickLog) {
    headerQuickLog.addEventListener('click', () => switchView('daily-log'));
  }
  const btnDashNewLog = document.getElementById('btn-dash-new-log');
  if (btnDashNewLog) {
    btnDashNewLog.addEventListener('click', () => switchView('daily-log'));
  }
}

function saveDailyLog() {
  const dateInput = document.getElementById('log-date-input');
  const hoursInput = document.getElementById('log-hours-input');
  const problemsInput = document.getElementById('log-problems-input');
  const moodSelect = document.getElementById('log-mood-select');
  const learnedInput = document.getElementById('log-learned');
  const builtInput = document.getElementById('log-built');
  const problemsText = document.getElementById('log-problems');
  const goalsInput = document.getElementById('log-goals');

  const hours = parseFloat(hoursInput.value) || 0;
  const problems = parseInt(problemsInput.value) || 0;
  const currentDay = appState.user.currentDay || 1;

  const newLog = {
    id: 'log-' + Date.now(),
    challengeDay: currentDay,
    date: dateInput.value || new Date().toISOString().split('T')[0],
    hours: hours,
    problems: problems,
    mood: moodSelect.value,
    learned: learnedInput.value.trim(),
    built: builtInput.value.trim(),
    problemsFaced: problemsText.value.trim(),
    tomorrowGoal: goalsInput.value.trim(),
    createdAt: Date.now()
  };

  // Add to logs array (prepend)
  appState.logs.unshift(newLog);

  // Update total stats
  appState.stats.totalHours = +(appState.stats.totalHours + hours).toFixed(2);
  appState.stats.problemsSolved += problems;

  // Check & update streak
  appState.stats.streak = (appState.stats.streak || 1) + 1;
  if (appState.stats.streak > appState.stats.longestStreak) {
    appState.stats.longestStreak = appState.stats.streak;
  }

  // Update 365 days record
  if (!appState.days[currentDay]) {
    appState.days[currentDay] = { dayNumber: currentDay, hours: 0, tasksCompleted: 0, problemsSolved: 0, level: 0 };
  }
  appState.days[currentDay].hours = +(appState.days[currentDay].hours + hours).toFixed(2);
  appState.days[currentDay].problemsSolved += problems;
  appState.days[currentDay].logId = newLog.id;
  appState.days[currentDay].level = calculateActivityLevel(appState.days[currentDay].hours, appState.days[currentDay].tasksCompleted);

  saveData();
  sound.playSuccess();
  confetti.fire();

  showToast("Today's progress has been saved.", `Day ${currentDay} logged! Streak is now 🔥 ${appState.stats.streak} Days.`);

  // Reset textareas but keep date
  learnedInput.value = '';
  builtInput.value = '';
  problemsText.value = '';
  goalsInput.value = '';

  renderLogs();
  renderDashboard();
}

function renderLogs(searchQuery = '') {
  const container = document.getElementById('log-history-list');
  const streakBadge = document.getElementById('log-streak-badge');
  const totalBadge = document.getElementById('log-total-badge');
  if (!container) return;

  if (streakBadge) streakBadge.textContent = `🔥 ${appState.stats.streak} Day Streak`;
  if (totalBadge) totalBadge.textContent = `📚 ${appState.logs.length} Total Logs`;

  let logsToRender = appState.logs;
  if (searchQuery) {
    logsToRender = appState.logs.filter(l => 
      (l.learned && l.learned.toLowerCase().includes(searchQuery)) ||
      (l.built && l.built.toLowerCase().includes(searchQuery)) ||
      (l.problemsFaced && l.problemsFaced.toLowerCase().includes(searchQuery)) ||
      (l.tomorrowGoal && l.tomorrowGoal.toLowerCase().includes(searchQuery))
    );
  }

  if (logsToRender.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h4 class="empty-title">No build logs found</h4>
        <p class="empty-desc">${searchQuery ? 'Try another search term.' : 'Write and save your first log above!'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  logsToRender.forEach(log => {
    const card = document.createElement('div');
    card.className = 'log-card-detailed';

    card.innerHTML = `
      <div class="log-detailed-header">
        <div class="log-badges-wrap">
          <span class="log-date-tag">Day ${log.challengeDay || 1} &bull; ${log.date}</span>
          <span class="badge-pill green">${log.mood || '🚀 Productive'}</span>
          <span class="badge-pill">⏱️ ${log.hours || 0} hrs</span>
          <span class="badge-pill">🧩 ${log.problems || 0} problems</span>
        </div>
        <div class="log-actions-wrap">
          <button class="btn btn-secondary btn-sm" onclick="deleteLog('${log.id}')" title="Delete log">Delete</button>
        </div>
      </div>

      <div class="log-detailed-grid">
        <div class="log-detail-box">
          <h5>💡 What I Learned</h5>
          <p>${escapeHtml(log.learned || '—')}</p>
        </div>
        <div class="log-detail-box">
          <h5>🛠️ What I Built</h5>
          <p>${escapeHtml(log.built || '—')}</p>
        </div>
        ${log.problemsFaced ? `
          <div class="log-detail-box">
            <h5>⚠️ Blockers & Problems</h5>
            <p>${escapeHtml(log.problemsFaced)}</p>
          </div>
        ` : ''}
        ${log.tomorrowGoal ? `
          <div class="log-detail-box">
            <h5>🎯 Tomorrow's Goal</h5>
            <p>${escapeHtml(log.tomorrowGoal)}</p>
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function deleteLog(logId) {
  const index = appState.logs.findIndex(l => l.id === logId);
  if (index === -1) return;

  appState.logs.splice(index, 1);
  saveData(STORAGE_KEYS.LOGS);
  sound.playClick();
  renderLogs();
  renderDashboardRecentLogs();
  showToast('Log Deleted', 'The build log entry was removed.');
}

function renderDashboardRecentLogs() {
  const container = document.getElementById('dashboard-recent-logs');
  if (!container) return;

  if (appState.logs.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        No logs recorded yet. Click "Write Daily Log" to log today's coding reflections!
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  // Show top 2 most recent logs
  appState.logs.slice(0, 2).forEach(log => {
    const item = document.createElement('div');
    item.className = 'recent-log-item';
    item.innerHTML = `
      <div class="log-meta-bar">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="log-date-tag">Day ${log.challengeDay || 1} &bull; ${log.date}</span>
          <span style="font-size: 0.75rem;">${log.mood || '🚀 Productive'}</span>
        </div>
        <span class="log-metrics-pill">+${log.hours || 0} hrs &bull; ${log.problems || 0} solved</span>
      </div>
      <div class="log-snippet-grid">
        <div class="log-snippet-col">
          <div class="log-snippet-label">What I Learned:</div>
          <div class="log-snippet-text">${escapeHtml(log.learned || '—')}</div>
        </div>
        <div class="log-snippet-col">
          <div class="log-snippet-label">What I Built:</div>
          <div class="log-snippet-text">${escapeHtml(log.built || '—')}</div>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

// ==========================================================================
// 11. PROGRESS & VISUAL ANALYTICS (PURE HTML/CSS/JS, NO EXTERNAL CHART LIBS)
// ==========================================================================
function renderProgressView() {
  const currentDay = appState.user.currentDay || 1;
  const daysCompleted = Object.values(appState.days).filter(d => d.hours > 0 || d.tasksCompleted > 0 || d.level > 0).length;
  const daysLeft = Math.max(0, 365 - daysCompleted);
  const totalHrs = appState.stats.totalHours;
  const avgHrs = daysCompleted > 0 ? (totalHrs / daysCompleted).toFixed(1) : '0.0';

  // Hero Card Elements
  document.getElementById('prog-current-day').textContent = currentDay;
  document.getElementById('prog-days-done').textContent = daysCompleted;
  document.getElementById('prog-days-left').textContent = daysLeft;
  document.getElementById('prog-total-hrs').textContent = `${totalHrs.toFixed(1)} hrs`;
  document.getElementById('prog-avg-hrs').textContent = `${avgHrs} hrs`;

  // Hero 365-Day Completion Gauge (Circumference: 2 * PI * 80 = 502.65)
  const gaugeCircle = document.getElementById('prog-gauge-circle');
  const gaugeVal = document.getElementById('prog-gauge-val');
  const completionPct = ((daysCompleted / 365) * 100);
  if (gaugeVal) gaugeVal.textContent = `${completionPct.toFixed(1)}%`;
  if (gaugeCircle) {
    const circum = 2 * Math.PI * 80;
    const offset = circum * (1 - (completionPct / 100));
    gaugeCircle.style.strokeDashoffset = offset;
  }

  // Pure HTML/CSS Weekly Bar Chart
  renderWeeklyChart();

  // Problem Breakdown
  const totalProblems = appState.stats.problemsSolved || 3;
  document.getElementById('total-dsa-badge').textContent = `${totalProblems} Solved`;
  document.getElementById('cat-dsa-val').textContent = `${totalProblems} problems (100%)`;

  // Milestones Check & Update
  checkMilestones();
}

function renderWeeklyChart() {
  const chart = document.getElementById('weekly-bar-chart');
  if (!chart) return;

  chart.innerHTML = '';
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Seed sample week distribution leading to today
  const dailyGoal = appState.settings.dailyGoal || 2.0;
  document.getElementById('chart-daily-target').textContent = `${dailyGoal.toFixed(1)} hrs`;

  const currentDayHours = (appState.days[appState.user.currentDay] || {}).hours || 2.5;
  // Dynamic weekly hours mapping
  const weeklyData = [
    { day: 'Mon', hours: 2.0 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 2.5 },
    { day: 'Fri', hours: 4.0 },
    { day: 'Sat', hours: 2.0 },
    { day: 'Sun', hours: currentDayHours }
  ];

  let sumHours = 0;
  const maxHours = Math.max(5, ...weeklyData.map(d => d.hours));

  weeklyData.forEach(item => {
    sumHours += item.hours;
    const heightPct = Math.round((item.hours / maxHours) * 100);

    const group = document.createElement('div');
    group.className = 'chart-bar-group';

    group.innerHTML = `
      <div class="chart-bar-tooltip">${item.hours.toFixed(1)} hrs</div>
      <div class="chart-bar-col">
        <div class="chart-bar-fill" style="height: ${heightPct}%;"></div>
      </div>
      <span class="chart-day-label">${item.day}</span>
    `;
    chart.appendChild(group);
  });

  const totalWeekly = document.getElementById('weekly-total-hours');
  if (totalWeekly) totalWeekly.textContent = `${sumHours.toFixed(1)} hrs`;
}

function checkMilestones() {
  const stats = appState.stats;

  // 1. 7-Day Streak
  const badge7 = document.getElementById('badge-7day');
  const badge7Status = document.getElementById('badge-7day-status');
  if (stats.streak >= 7) {
    badge7.className = 'achievement-badge unlocked';
    badge7Status.textContent = 'Unlocked';
  } else {
    badge7.className = 'achievement-badge';
    badge7Status.textContent = `${stats.streak} / 7 Days`;
  }

  // 2. 10 Hours
  const badge10h = document.getElementById('badge-10hrs');
  const badge10hStatus = document.getElementById('badge-10hrs-status');
  if (stats.totalHours >= 10) {
    badge10h.className = 'achievement-badge unlocked';
    badge10hStatus.textContent = 'Unlocked';
  } else {
    badge10h.className = 'achievement-badge';
    badge10hStatus.textContent = `${stats.totalHours.toFixed(1)} / 10 hrs`;
  }

  // 3. 10 Problems
  const badge10p = document.getElementById('badge-10probs');
  const badge10pStatus = document.getElementById('badge-10probs-status');
  if (stats.problemsSolved >= 10) {
    badge10p.className = 'achievement-badge unlocked';
    badge10pStatus.textContent = 'Unlocked';
  } else {
    badge10p.className = 'achievement-badge';
    badge10pStatus.textContent = `${stats.problemsSolved} / 10 Solved`;
  }
}

// ==========================================================================
// 12. SETTINGS & DATA PORTABILITY (EXPORT, IMPORT, RESET)
// ==========================================================================
function initSettings() {
  // Profile settings form
  const profileForm = document.getElementById('settings-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('setting-dev-name');
      const dayInput = document.getElementById('setting-current-day');
      const goalInput = document.getElementById('setting-daily-goal');

      appState.user.name = nameInput.value.trim() || 'Developer';
      appState.user.currentDay = parseInt(dayInput.value) || 1;
      appState.settings.dailyGoal = parseFloat(goalInput.value) || 2.0;

      saveData();
      sound.playSuccess();
      showToast('Settings Saved', 'Your developer preferences were updated.');
      renderDashboard();
    });
  }

  // Theme Pickers
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeVal = btn.dataset.themeVal;
      setTheme(themeVal);
    });
  });

  // Sound Toggle
  const soundToggle = document.getElementById('setting-sound-toggle');
  if (soundToggle) {
    soundToggle.checked = appState.settings.soundEnabled;
    soundToggle.addEventListener('change', () => {
      appState.settings.soundEnabled = soundToggle.checked;
      saveData(STORAGE_KEYS.SETTINGS);
      if (soundToggle.checked) sound.playSuccess();
    });
  }

  // Confetti Toggle
  const confettiToggle = document.getElementById('setting-confetti-toggle');
  if (confettiToggle) {
    confettiToggle.checked = appState.settings.confettiEnabled;
    confettiToggle.addEventListener('change', () => {
      appState.settings.confettiEnabled = confettiToggle.checked;
      saveData(STORAGE_KEYS.SETTINGS);
      if (confettiToggle.checked) confetti.fire();
    });
  }

  // Data Export (JSON Download)
  const exportBtn = document.getElementById('btn-export-data');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }

  // Data Import (JSON File Upload)
  const importInput = document.getElementById('file-import-input');
  if (importInput) {
    importInput.addEventListener('change', importData);
  }

  // Load sample demo data button
  const loadSampleBtn = document.getElementById('btn-load-sample-data');
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', () => {
      seedRichDemoData();
      showToast('Demo Data Loaded', 'Sample streak, logs, and calendar data populated.');
    });
  }

  // Reset Data Modal
  initResetModal();
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  appState.settings.theme = theme;
  saveData(STORAGE_KEYS.SETTINGS);

  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.themeVal === theme);
  });
}

function renderSettingsView() {
  document.getElementById('setting-dev-name').value = appState.user.name || 'Developer';
  document.getElementById('setting-current-day').value = appState.user.currentDay || 1;
  document.getElementById('setting-daily-goal').value = appState.settings.dailyGoal || 2.0;

  // Sync theme active class
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.themeVal === (appState.settings.theme || 'dark'));
  });
}

function exportData() {
  const exportObject = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    user: appState.user,
    settings: appState.settings,
    stats: appState.stats,
    tasks: appState.tasks,
    logs: appState.logs,
    days: appState.days
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `devpulse_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast('Export Completed', 'Your 365-day challenge data was downloaded.');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (imported.user) appState.user = imported.user;
      if (imported.settings) appState.settings = imported.settings;
      if (imported.stats) appState.stats = imported.stats;
      if (imported.tasks) appState.tasks = imported.tasks;
      if (imported.logs) appState.logs = imported.logs;
      if (imported.days) appState.days = imported.days;

      saveData();
      setTheme(appState.settings.theme || 'dark');
      renderDashboard();
      showToast('Import Successful', 'All DevPulse challenge data restored!');
    } catch (err) {
      alert('Invalid JSON file format.');
    }
  };
  reader.readAsText(file);
}

function seedRichDemoData() {
  appState.user.currentDay = 14;
  appState.stats = {
    streak: 14,
    longestStreak: 14,
    totalHours: 38.5,
    problemsSolved: 24,
    projectsBuilt: 2,
    completedDays: 14,
    pomodoroSessions: 28
  };

  // Seed calendar activity across first 14 days
  for (let i = 1; i <= 14; i++) {
    const hrs = (Math.sin(i) * 2 + 2.5).toFixed(1);
    appState.days[i] = {
      dayNumber: i,
      hours: parseFloat(hrs),
      tasksCompleted: 3,
      problemsSolved: 2,
      level: Math.floor(Math.random() * 3) + 2
    };
  }

  saveData();
  renderDashboard();
}

function initResetModal() {
  const modal = document.getElementById('modal-confirm-reset');
  const triggerBtn = document.getElementById('btn-trigger-reset-modal');
  const closeBtn = document.getElementById('modal-reset-close');
  const cancelBtn = document.getElementById('modal-reset-cancel');
  const confirmBtn = document.getElementById('modal-reset-confirm');
  const checkbox = document.getElementById('reset-confirm-checkbox');

  if (!modal) return;

  triggerBtn.addEventListener('click', () => {
    checkbox.checked = false;
    confirmBtn.disabled = true;
    openModal(modal);
  });

  closeBtn.addEventListener('click', () => closeModal(modal));
  cancelBtn.addEventListener('click', () => closeModal(modal));

  checkbox.addEventListener('change', () => {
    confirmBtn.disabled = !checkbox.checked;
  });

  confirmBtn.addEventListener('click', () => {
    // Clear all localStorage keys
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

    // Reset app state
    appState.user = { ...DEFAULT_USER };
    appState.settings = { ...DEFAULT_SETTINGS };
    appState.stats = { ...DEFAULT_STATS };
    appState.tasks = [...DEFAULT_TASKS];
    appState.logs = [...DEFAULT_LOGS];
    initializeDaysSeed();

    closeModal(modal);
    setTheme('dark');
    renderDashboard();
    showToast('Data Reset Completed', 'All challenge data has been reset to Day 1.');
  });
}

// ==========================================================================
// 13. TOAST NOTIFICATION SYSTEM
// ==========================================================================
function showToast(title, message = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  toast.innerHTML = `
    <span class="toast-icon">⚡</span>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast-message">${escapeHtml(message)}</div>` : ''}
    </div>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  // Auto-dismiss after 3.5 seconds
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ==========================================================================
// 14. MODAL HELPERS & UTILITIES
// ==========================================================================
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('open');
  document.body.style.overflow = '';
}

// Global modal backdrop close & ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m));
  }
});

document.querySelectorAll('.modal-backdrop').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

const modalDayClose = document.getElementById('modal-day-close');
if (modalDayClose) {
  modalDayClose.addEventListener('click', () => {
    closeModal(document.getElementById('modal-day-details'));
  });
}

const modalDayCancel = document.getElementById('modal-day-cancel');
if (modalDayCancel) {
  modalDayCancel.addEventListener('click', () => {
    closeModal(document.getElementById('modal-day-details'));
  });
}

function calculateActivityLevel(hours = 0, tasks = 0) {
  const score = hours + (tasks * 0.5);
  if (score >= 6) return 4;
  if (score >= 3.5) return 3;
  if (score >= 2) return 2;
  if (score > 0) return 1;
  return 0;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Keyboard shortcuts for power users (Space = timer toggle)
document.addEventListener('keydown', (e) => {
  // If active element is an input or textarea, ignore shortcuts
  const tag = document.activeElement.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

  if (e.code === 'Space') {
    e.preventDefault();
    toggleTimer();
  }
});

// ==========================================================================
// 15. APPLICATION INITIALIZATION
// ==========================================================================
function initApp() {
  confetti = new ConfettiEngine();

  // Load persisted state
  loadData();

  // Apply stored theme
  if (appState.settings.theme) {
    document.documentElement.setAttribute('data-theme', appState.settings.theme);
  }

  // Initialize navigation routers
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.view;
      switchView(view);
    });
  });

  document.querySelectorAll('.mob-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });

  // User profile click in sidebar navigates to Settings
  const userProfileTrigger = document.getElementById('user-profile-trigger');
  if (userProfileTrigger) {
    userProfileTrigger.addEventListener('click', () => switchView('settings'));
  }

  // Initialize modular subsystems
  initTimer();
  initTasks();
  initLogs();
  initSettings();

  // Render initial dashboard view
  renderDashboard();

  console.log('DevPulse initialized — Day 1 of 365. Keep shipping!');
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
