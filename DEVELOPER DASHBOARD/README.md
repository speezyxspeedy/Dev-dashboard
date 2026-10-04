# DevPulse — Developer Productivity Dashboard

> **Day 1/365 — Building in public.**

A modern, portfolio-quality developer productivity dashboard engineered specifically for tracking coding velocity, focus sessions, DSA problem solving, and public dev logs during a **365-Day Build-in-Public Challenge**.

Built entirely with **Vanilla HTML5, CSS3, and JavaScript (ES6+)** with **zero external libraries or frameworks**. All data is persisted locally in the browser via `localStorage`.

---

## ⚡ Overview

DevPulse bridges the gap between GitHub contribution tracking, Pomodoro focus time management, daily build logging, and visual sprint analytics into a single cohesive, high-performance web application.

Designed with a sleek, charcoal dark-mode aesthetic inspired by developer tools like Linear, Supabase, and Raycast, DevPulse looks and feels like a production-grade SaaS product ready to show on GitHub and LinkedIn.

---

## 🚀 Key Features

### 1. 365-Day Dynamic Contribution Matrix
- Dynamically rendered 53-week × 7-day grid (365 cells) via pure JavaScript.
- GitHub-style activity heat levels based on coding hours, completed tasks, and algorithmic problems solved.
- Pulsing glow marker highlighting **Today's challenge day**.
- Interactive Day Inspector modal: click any past, present, or future day to review that day's statistics and open its build log.
- Live milestone metrics: Days Completed, Days Remaining, and Trajectory Percentage.

### 2. Daily Coding Timer (Pomodoro Engine)
- Focus Session (25m), Short Break (5m), and Long Break (15m) modes.
- Circular SVG progress ring with smooth stroke dash-offset interpolation and glow filter.
- **Automatic time logging**: Completing a 25-minute focus session automatically credits +25 mins (+0.42 hrs) to today's coding hours and updates the contribution graph.
- Monospace digital countdown synced to document title and sidebar mini-widget.
- Spacebar shortcut to play/pause anytime.

### 3. Build-in-Public Daily Dev Log
- Four structured prompt inputs for daily deliberate reflection:
  1. *What I learned today*
  2. *What I built today*
  3. *Problems I faced*
  4. *Tomorrow's goal*
- Metadata tracking: Hours spent, problems solved, and vibe/mood selector (`🚀 Productive`, `🧠 Challenging`, `💡 Breakthrough`, etc.).
- Searchable timeline of historical logs with tags and quick filters.

### 4. Interactive Task Manager
- Instant task creation with categories (*DSA*, *Project Build*, *Learning*, *General*) and priority levels (*High*, *Medium*, *Low*).
- Animated task completion with celebratory chime and micro-confetti particles.
- Real-time progress bar and filter tabs (*All*, *Active*, *Completed*).
- Pre-seeded with Day 1 starter milestones (C++ fundamentals, DSA, Git commits).

### 5. Visual Analytics & Milestones (Pure CSS & HTML)
- **Weekly Coding Hours Bar Chart**: Custom pure HTML/CSS interactive bar chart with hover tooltips and daily target baseline.
- **Problem Category Distribution**: Categorized breakdown of DSA problems, project features, system design concepts, and bug fixes.
- **365-Day Challenge Completion Gauge**: Circular SVG progress gauge showing exact challenge trajectory.
- **Unlockable Accolades & Badges**: Dynamic achievement system (Genesis Dev, Week Warrior, Flow State, Algorithm Apprentice, Centurion 100).

### 6. Settings & Data Portability
- Customizable developer name, challenge current day offset, and daily coding hours target.
- Theme Switcher: **Midnight Dark**, **OLED Black**, and **Clean Light**.
- Audio and Confetti toggles.
- **JSON Export & Import**: Developer-friendly backup and restore of all 365-day challenge records.
- Danger Zone with two-step confirmation modal for clearing local data.

### 7. Synthesized Sound & Visual FX (Zero External Assets)
- Built-in sound synthesizer using the native browser **Web Audio API** (melodic major-triad success chimes and soft clicks without loading external MP3 files).
- Lightweight pure-canvas micro-confetti burst animation.
- Responsive mobile navigation bar and topbar for tablet and phone usage.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | Semantic HTML5, ARIA Accessible landmarks, SVG graphics |
| **Styling** | Vanilla CSS3, CSS Custom Properties (Theming), CSS Grid, Flexbox, Glassmorphism |
| **Logic** | Vanilla JavaScript (ES6+), Event-driven architecture, Modular functional design |
| **Audio** | Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`) |
| **Storage** | Browser `localStorage` (Structured schemas for user, tasks, logs, stats, days) |
| **Dependencies** | **0 External Dependencies / 0 NPM Packages / 0 CDNs** |

---

## 📸 Screenshots & Preview

```
+------------------------------------------------------------------------------------+
|  DevPulse 365 CHL       Good morning, Developer 👋                    [Day 1/365]  |
|  [Dashboard]            Day 1 of your 365-day build-in-public journey              |
|  [Daily Log]                                                                       |
|  [Tasks]           [🔥 Streak]     [⏱️ Hours]     [🧩 Problems]    [🚀 Projects]   |
|  [Progress]          1 Day           2.5 hrs          3 solved         1 built     |
|  [Settings]                                                                        |
|  --------------------------------------------------------------------------------  |
|  365-DAY CONTRIBUTION MATRIX                                                       |
|  [■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□]  |
|                                                                                    |
|  [ FOCUS TIMER 25:00 ]                  [ TODAY'S TASKS ]                          |
|  Mode: Focus Session                    [x] Practice C++ fundamentals              |
|  (Start) (Reset) (Skip)                 [x] Solve 3 DSA problems                   |
|                                         [ ] Implement calendar grid                |
+------------------------------------------------------------------------------------+
```

---

## 🏃 How to Run Locally

Because DevPulse is built with pure, standard web technologies, there are **no build steps, bundlers, or package installations needed**.

### Option 1: Direct Browser Open
Double-click `index.html` or drag it into any modern web browser (Chrome, Edge, Firefox, Safari, Brave).

### Option 2: Local HTTP Server (Optional)
If you prefer running through a local development server:

```bash
# Python 3
python -m http.server 8080

# Or Node.js npx
npx serve .
```

Then visit `http://localhost:8080` in your browser.

---

## 🧠 What I Learned on Day 1

1. **Pure CSS & SVG Data Visualization**: Designing interactive contribution heatmaps and bar charts with CSS Grid and SVG dash-offset math avoids the bundle bloat and layout shifts of heavy charting libraries.
2. **Synthesizing Audio in JavaScript**: Leveraging `window.AudioContext` allows creating pleasant UI audio feedback (chimes, clicks) with zero external network requests or latency.
3. **Resilient Local State Patterns**: Implementing structured localStorage schemas with versioning and backup export/import gives users true ownership over their data.
4. **Mobile UX for Dense Dashboards**: Transforming a multi-column desktop developer dashboard into an ergonomic mobile app with sticky top indicators and bottom tab navigation.

---

## 🔮 Future Improvements

- [ ] GitHub API integration to optionally sync real public commits with the challenge calendar.
- [ ] Exportable social share cards (PNG generation) to post Day X updates directly to X / LinkedIn.
- [ ] Ambient background coding sounds (white noise / binaural beats) synthesized in browser.
- [ ] Tag filtering for problems solved (LeetCode difficulty, NeetCode 150 tags).

---

## 📜 License

Created with ❤️ by Developer for the **365-Day Build-in-Public Challenge**. Open source under the MIT License.
