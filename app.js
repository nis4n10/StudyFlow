// =====================================================
// StudyFlow app logic
// =====================================================

// ----- Tab switching -----
const tabs = document.querySelectorAll('.tab');
const screens = document.querySelectorAll('.screen');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    screens.forEach(s => s.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

// ----- Dark / light theme -----
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

root.dataset.theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
});

// ----- Home: study goal card (the numbers come from the Progress data further down) -----
const GOAL_MIN = 100;

const ringFill = document.getElementById('ring-fill');
const ringPercent = document.getElementById('ring-percent');
const goalMinutes = document.getElementById('goal-minutes');
const goalNote = document.getElementById('goal-note');
const circumference = 2 * Math.PI * 52;

ringFill.style.strokeDasharray = circumference;
ringFill.style.strokeDashoffset = circumference; // start empty

let shownPercent = 0;
let goalCounter = null;

function updateGoalCard() {
  const studied = minutesOn(today);
  const targetPercent = Math.min(100, Math.round((studied / GOAL_MIN) * 100));

  goalMinutes.textContent = studied;
  goalNote.textContent = studied >= GOAL_MIN
    ? 'Goal reached.\nNice work today!'
    : 'Just ' + (GOAL_MIN - studied) + ' more minutes.\nYou\'ve got this!';

  ringFill.style.strokeDashoffset = circumference * (1 - targetPercent / 100);

  clearInterval(goalCounter);
  goalCounter = setInterval(() => {
    if (shownPercent === targetPercent) {
      clearInterval(goalCounter);
      return;
    }
    shownPercent += shownPercent < targetPercent ? 1 : -1;
    ringPercent.textContent = shownPercent + '%';
  }, 14);
}

// ----- Home: task checkboxes -----
const checkboxes = document.querySelectorAll('.task input');
const tasksCount = document.getElementById('tasks-count');

function updateTaskCount() {
  const done = [...checkboxes].filter(box => box.checked).length;
  tasksCount.textContent = done + ' of ' + checkboxes.length + ' done';
}

checkboxes.forEach(box => box.addEventListener('change', updateTaskCount));
updateTaskCount();

// ----- Home: "Start a focus session" opens the Focus tab -----
document.getElementById('start-focus').addEventListener('click', () => {
  document.querySelector('[data-target="focus"]').click();
});

// ----- Subjects: data -----
const ICONS = {
  sigma: '<path d="M17 5H7l6 7-6 7h10"/>',
  leaf:  '<path d="M5 19c0-8 4-13 14-14 0 9-4 14-12 14"/><path d="M5 19c3-5 6-8 10-10"/>',
  book:  '<path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5z"/><path d="M12 6v13"/>',
  atom:  '<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="9" ry="3.8"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(120 12 12)"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>'
};

const subjects = [
  { name: 'Mathematics', subtitle: 'Calculus & algebra', color: 'lilac', icon: 'sigma', done: 8, total: 12, percent: 68 },
  { name: 'Biology',     subtitle: 'Cells & ecosystems', color: 'mint',  icon: 'leaf',  done: 5, total: 11, percent: 45 },
  { name: 'Literature',  subtitle: 'Stories & poetry',   color: 'peach', icon: 'book',  done: 8, total: 10, percent: 80 },
  { name: 'Physics',     subtitle: 'Motion & energy',    color: 'blue',  icon: 'atom',  done: 3, total: 9,  percent: 32 }
];

// Makes user-typed text safe to put inside HTML
function esc(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/"/g, '&quot;');
}

// ----- Subjects: draw the cards -----
const subjectList = document.getElementById('subject-list');
const subjectsCount = document.getElementById('subjects-count');

function renderSubjects() {
  subjectList.innerHTML = subjects.map(s => {
    const meta = s.total > 0 ? s.done + ' of ' + s.total + ' chapters' : 'Just getting started';
    return `
      <div class="subject-card">
        <div class="subject-top">
          <div class="subject-icon" style="background: var(--${s.color})">
            <svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[s.icon]}</svg>
          </div>
          <div class="subject-info">
            <strong>${esc(s.name)}</strong>
            <span>${esc(s.subtitle)}</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
        </div>
        <div class="subject-meta"><span>${meta}</span><strong>${s.percent}%</strong></div>
        <div class="bar"><div class="bar-fill" style="width: ${s.percent}%; background: var(--${s.color})"></div></div>
      </div>`;
  }).join('');

  const word = subjects.length === 1 ? 'subject' : 'subjects';
  subjectsCount.textContent = subjects.length + ' ' + word + ' · One step at a time';
}

renderSubjects();

// ----- Add subject sheet: open / close -----
const sheet = document.getElementById('sheet');
const backdrop = document.getElementById('backdrop');
const nameInput = document.getElementById('subject-name');

let openedSheet = null;

function openSheet(panel, firstField) {
  openedSheet = panel;
  panel.classList.add('open');
  backdrop.classList.add('open');
  setTimeout(() => firstField.focus(), 300);
}

function closeSheet() {
  if (openedSheet) openedSheet.classList.remove('open');
  openedSheet = null;
  backdrop.classList.remove('open');
}

document.getElementById('open-sheet').addEventListener('click', () => openSheet(sheet, nameInput));
document.getElementById('close-sheet').addEventListener('click', closeSheet);
backdrop.addEventListener('click', closeSheet);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSheet();
});

// ----- Add subject sheet: create the subject -----
sheet.addEventListener('submit', e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }

  subjects.push({
    name: name,
    subtitle: document.getElementById('subject-term').value,
    color: sheet.elements.color.value,
    icon: document.getElementById('subject-icon').value,
    done: 0,
    total: 0,
    percent: 0
  });

  renderSubjects();
  renderFocusSubjects();
  renderPlanSubjects();
  sheet.reset();
  closeSheet();
});

// =====================================================
// FOCUS TIMER
// =====================================================
const MODES = {
  focus: { minutes: 25, name: 'Focus' },
  short: { minutes: 5,  name: 'Short break' },
  long:  { minutes: 15, name: 'Long break' }
};
const TOTAL_SESSIONS = 4;

const timerFill = document.getElementById('timer-fill');
const timerTime = document.getElementById('timer-time');
const timerStatus = document.getElementById('timer-status');
const timerButtons = document.querySelector('.timer-buttons');
const sessionDots = document.querySelectorAll('#session-dots i');
const sessionText = document.getElementById('session-text');
const modeButtons = document.querySelectorAll('.seg');

const timerCircumference = 2 * Math.PI * 118;
timerFill.style.strokeDasharray = timerCircumference;

let mode = 'focus';
let completedSessions = 0;
let totalMs = MODES[mode].minutes * 60 * 1000;
let remainingMs = totalMs;
let endAt = 0;
let ticker = null;
let isRunning = false;

function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function updateTimerView(word) {
  timerTime.textContent = formatTime(remainingMs);
  timerFill.style.strokeDashoffset = timerCircumference * (1 - remainingMs / totalMs);
  timerStatus.textContent = word + ' · ' + MODES[mode].minutes + ' MIN ' + (mode === 'focus' ? 'SESSION' : 'BREAK');
  document.title = isRunning ? formatTime(remainingMs) + ' · StudyFlow' : 'StudyFlow';
}

function updateSessionView() {
  sessionDots.forEach((dot, i) => {
    if (i < completedSessions) dot.className = 'done';
    else if (i === completedSessions && mode === 'focus') dot.className = 'current';
    else dot.className = '';
  });
  const current = Math.min(completedSessions + 1, TOTAL_SESSIONS);
  sessionText.textContent = 'Session ' + current + ' of ' + TOTAL_SESSIONS + ' · Long break after ' + TOTAL_SESSIONS;
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (err) {
    // No sound available, that's fine
  }
}

function pauseTimer() {
  clearInterval(ticker);
  if (isRunning) remainingMs = Math.max(0, endAt - Date.now());
  isRunning = false;
  timerButtons.classList.remove('running');
}

function tick() {
  remainingMs = Math.max(0, endAt - Date.now());
  updateTimerView(mode === 'focus' ? 'FOCUSING' : 'RESTING');
  if (remainingMs <= 0) finishTimer();
}

function startTimer() {
  if (isRunning) return;
  if (remainingMs <= 0) remainingMs = totalMs;
  isRunning = true;
  endAt = Date.now() + remainingMs;
  ticker = setInterval(tick, 250);
  timerButtons.classList.add('running');
  tick();
}

function setMode(newMode) {
  pauseTimer();
  mode = newMode;
  totalMs = MODES[mode].minutes * 60 * 1000;
  remainingMs = totalMs;

  modeButtons.forEach(btn => {
    const on = btn.dataset.mode === mode;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', on);
  });

  updateSessionView();
  updateTimerView('READY');
}

function finishTimer() {
  clearInterval(ticker);
  isRunning = false;
  beep();

  let nextMode;
  let message;
  if (mode === 'focus') {
    completedSessions++;
    recordFocusSession(totalMs / 60000);
    nextMode = completedSessions >= TOTAL_SESSIONS ? 'long' : 'short';
    message = 'NICE WORK!';
  } else {
    if (mode === 'long') completedSessions = 0;
    nextMode = 'focus';
    message = 'BACK TO IT!';
  }

  setMode(nextMode);
  timerStatus.textContent = message;
}

document.getElementById('timer-start').addEventListener('click', startTimer);

document.getElementById('timer-pause').addEventListener('click', () => {
  if (!isRunning) return;
  pauseTimer();
  updateTimerView('PAUSED');
});

document.getElementById('timer-reset').addEventListener('click', () => {
  pauseTimer();
  remainingMs = totalMs;
  updateTimerView('READY');
});

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode));
});

// ----- Focus: choose which subject you are studying -----
const focusSubject = document.getElementById('focus-subject');
const pickerDot = document.getElementById('picker-dot');

function updatePickerDot() {
  const s = subjects[focusSubject.value];
  pickerDot.style.background = s ? 'var(--' + s.color + ')' : 'var(--lilac)';
}

function renderFocusSubjects() {
  const keep = focusSubject.value;
  focusSubject.innerHTML = subjects
    .map((s, i) => '<option value="' + i + '">' + esc(s.name) + '</option>')
    .join('');
  if (keep !== '' && subjects[keep]) focusSubject.value = keep;
  updatePickerDot();
}

focusSubject.addEventListener('change', updatePickerDot);

renderFocusSubjects();
updateSessionView();
updateTimerView('READY');

// =====================================================
// PLANNER
// =====================================================
const PLAN_KEY = 'studyflow-planner-v1';
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ----- Date helpers (they use YOUR local time zone) -----
function dateKey(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function addDays(d, n) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function timeText(minutes) {
  return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
}

function durationText(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return h + ' hr ' + m + ' min';
  if (h) return h + ' hr';
  return m + ' min';
}

function makeId() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const today = new Date();
today.setHours(0, 0, 0, 0);
let selectedDay = new Date(today);

// Home screen shows the real date
document.querySelector('#home .eyebrow').textContent =
  today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

// ----- Planner data (saved in your browser) -----
function seedPlan() {
  const items = [
    [-1, 'Mathematics', 'lilac', 'Problem set 03',      10 * 60,      50, true],
    [0,  'Literature',  'peach', 'Essay outline',       8 * 60,       25, true],
    [0,  'Mathematics', 'lilac', 'Problem set 04',      10 * 60,      50, false],
    [0,  'Biology',     'mint',  'Cell division notes', 14 * 60,      25, false],
    [1,  'Physics',     'blue',  'Motion review',       9 * 60 + 30,  50, false],
    [2,  'Literature',  'peach', 'Poetry analysis',     11 * 60,      45, false],
    [3,  'Mathematics', 'lilac', 'Integration practice', 10 * 60,     50, false],
    [3,  'Biology',     'mint',  'Lab report draft',    15 * 60,      40, false],
    [4,  'Physics',     'blue',  'Practice quiz',       9 * 60,       25, false]
  ];
  const result = {};
  items.forEach(([offset, subject, color, title, start, duration, done]) => {
    const key = dateKey(addDays(today, offset));
    if (!result[key]) result[key] = [];
    result[key].push({ id: makeId(), subject, color, title, start, duration, done });
  });
  return result;
}

function loadPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAN_KEY));
    if (saved && typeof saved === 'object') return saved;
  } catch (err) {
    // ignore broken saved data
  }
  return seedPlan();
}

function savePlan() {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
  } catch (err) {
    // saving not possible, the planner still works
  }
}

let plan = loadPlan();

// After a drag, the sessions swap time slots (the earliest slot goes to the first card, and so on)
function applyOrder(key, orderedIds) {
  const list = plan[key] || [];
  const slots = list.map(s => s.start).sort((a, b) => a - b);
  const byId = {};
  list.forEach(s => { byId[s.id] = s; });

  plan[key] = orderedIds.map((id, i) => {
    byId[id].start = slots[i];
    return byId[id];
  });
  savePlan();
}

// ----- Planner: draw everything -----
const weekMonth = document.getElementById('week-month');
const weekStrip = document.getElementById('week-strip');
const dayTitle = document.getElementById('day-title');
const daySummary = document.getElementById('day-summary');
const sessionList = document.getElementById('session-list');

function renderPlanner() {
  weekMonth.textContent = selectedDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Week strip (Monday to Sunday)
  const monday = addDays(selectedDay, -((selectedDay.getDay() + 6) % 7));
  const selectedKey = dateKey(selectedDay);
  const todayKey = dateKey(today);
  let stripHtml = '';

  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    const k = dateKey(d);
    const isSelected = k === selectedKey;
    const hasSessions = (plan[k] || []).length > 0;
    const longName = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    stripHtml += `
      <button class="day${isSelected ? ' selected' : ''}${k === todayKey ? ' is-today' : ''}"
              data-date="${k}" aria-pressed="${isSelected}"
              aria-label="${longName}${hasSessions ? ', has sessions' : ''}">
        <span>${DAY_LETTERS[i]}</span>
        <strong>${d.getDate()}</strong>
        <i class="${hasSessions ? 'on' : ''}"></i>
      </button>`;
  }
  weekStrip.innerHTML = stripHtml;

  // Day heading
  const sessions = (plan[selectedKey] || []).slice().sort((a, b) => a.start - b.start);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

  dayTitle.textContent = selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  daySummary.textContent = sessions.length
    ? sessions.length + (sessions.length === 1 ? ' session' : ' sessions') + ' · ' + durationText(totalMinutes) + ' planned'
    : 'Nothing planned yet';

  // Session cards
  if (!sessions.length) {
    sessionList.innerHTML = '<li class="empty">A free day is allowed. Add a session when you are ready.</li>';
    return;
  }

  sessionList.innerHTML = sessions.map(s => `
    <li class="session" data-id="${s.id}">
      <div class="session-time">
        <strong>${timeText(s.start)}</strong>
        <span>${timeText(s.start + s.duration)}</span>
      </div>
      <div class="session-card">
        <i class="session-bar" style="background: var(--${s.color})"></i>
        <div class="session-info">
          <small>${esc(s.subject.toUpperCase())}</small>
          <strong>${esc(s.title)}</strong>
          <span class="session-meta${s.done ? ' done' : ''}">${s.duration} min · ${s.done ? 'Completed' : 'Focus session'}</span>
        </div>
        <button class="check-btn" aria-pressed="${s.done}"
                aria-label="${s.done ? 'Mark ' + esc(s.title) + ' as not done' : 'Mark ' + esc(s.title) + ' as done'}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path class="tick" d="M8 12.5l3 3 5-6"/></svg>
        </button>
        <button class="handle" aria-label="Reorder ${esc(s.title)}. Use the up and down arrow keys.">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>
        </button>
      </div>
    </li>`).join('');
}

// ----- Planner: pick a day, move between weeks -----
weekStrip.addEventListener('click', e => {
  const btn = e.target.closest('.day');
  if (!btn) return;
  const [y, m, d] = btn.dataset.date.split('-').map(Number);
  selectedDay = new Date(y, m - 1, d);
  renderPlanner();
  weekStrip.querySelector('.selected').focus();
});

document.getElementById('week-prev').addEventListener('click', () => {
  selectedDay = addDays(selectedDay, -7);
  renderPlanner();
});

document.getElementById('week-next').addEventListener('click', () => {
  selectedDay = addDays(selectedDay, 7);
  renderPlanner();
});

document.getElementById('jump-today').addEventListener('click', () => {
  selectedDay = new Date(today);
  renderPlanner();
});

// ----- Planner: tick a session as done -----
sessionList.addEventListener('click', e => {
  const btn = e.target.closest('.check-btn');
  if (!btn) return;
  const id = btn.closest('.session').dataset.id;
  const session = (plan[dateKey(selectedDay)] || []).find(s => s.id === id);
  if (!session) return;

  session.done = !session.done;
  savePlan();
  renderPlanner();
  sessionList.querySelector('[data-id="' + id + '"] .check-btn').focus();
});

// ----- Planner: reorder with the keyboard (arrow keys on the handle) -----
sessionList.addEventListener('keydown', e => {
  const handle = e.target.closest('.handle');
  if (!handle) return;
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();

  const id = handle.closest('.session').dataset.id;
  const ids = [...sessionList.querySelectorAll('.session')].map(li => li.dataset.id);
  const i = ids.indexOf(id);
  const j = e.key === 'ArrowUp' ? i - 1 : i + 1;
  if (j < 0 || j >= ids.length) return;

  [ids[i], ids[j]] = [ids[j], ids[i]];
  applyOrder(dateKey(selectedDay), ids);
  renderPlanner();
  sessionList.querySelector('[data-id="' + id + '"] .handle').focus();
});

// ----- Planner: reorder by dragging the handle (mouse and touch) -----
sessionList.addEventListener('pointerdown', e => {
  const handle = e.target.closest('.handle');
  if (!handle) return;
  e.preventDefault();

  const item = handle.closest('.session');
  let startY = e.clientY;
  handle.setPointerCapture(e.pointerId);
  item.classList.add('dragging');

  function onMove(ev) {
    item.style.transform = 'translateY(' + (ev.clientY - startY) + 'px)';

    const rect = item.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    const next = item.nextElementSibling;
    const prev = item.previousElementSibling;

    if (next && next.classList.contains('session')) {
      const r = next.getBoundingClientRect();
      if (middle > r.top + r.height / 2) {
        sessionList.insertBefore(next, item);       // move the neighbour up
        startY += item.getBoundingClientRect().top - rect.top;
        item.style.transform = 'translateY(' + (ev.clientY - startY) + 'px)';
        return;
      }
    }

    if (prev && prev.classList.contains('session')) {
      const r = prev.getBoundingClientRect();
      if (middle < r.top + r.height / 2) {
        sessionList.insertBefore(prev, item.nextElementSibling); // move the neighbour down
        startY += item.getBoundingClientRect().top - rect.top;
        item.style.transform = 'translateY(' + (ev.clientY - startY) + 'px)';
      }
    }
  }

  function onUp() {
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onUp);
    handle.removeEventListener('pointercancel', onUp);
    item.classList.remove('dragging');
    item.style.transform = '';

    const ids = [...sessionList.querySelectorAll('.session')].map(li => li.dataset.id);
    applyOrder(dateKey(selectedDay), ids);
    renderPlanner();
  }

  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onUp);
});

// ----- Planner: "Plan a study session" sheet -----
const planSheet = document.getElementById('plan-sheet');
const planSubject = document.getElementById('plan-subject');
const planTopic = document.getElementById('plan-topic');
const planStart = document.getElementById('plan-start');
const planDuration = document.getElementById('plan-duration');
const planDate = document.getElementById('plan-date');

function renderPlanSubjects() {
  const keep = planSubject.value;
  planSubject.innerHTML = subjects
    .map((s, i) => '<option value="' + i + '">' + esc(s.name) + '</option>')
    .join('');
  if (keep !== '' && subjects[keep]) planSubject.value = keep;
}

document.getElementById('open-plan').addEventListener('click', () => {
  planDate.textContent = selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  openSheet(planSheet, planTopic);
});

document.getElementById('close-plan').addEventListener('click', closeSheet);

planSheet.addEventListener('submit', e => {
  e.preventDefault();

  const topic = planTopic.value.trim();
  if (!topic) {
    planTopic.focus();
    return;
  }

  const subject = subjects[planSubject.value];
  const [hours, minutes] = planStart.value.split(':').map(Number);
  if (!subject || isNaN(hours)) return;

  const key = dateKey(selectedDay);
  if (!plan[key]) plan[key] = [];
  plan[key].push({
    id: makeId(),
    subject: subject.name,
    color: subject.color,
    title: topic,
    start: hours * 60 + minutes,
    duration: Number(planDuration.value),
    done: false
  });
  plan[key].sort((a, b) => a.start - b.start);

  savePlan();
  renderPlanner();
  planSheet.reset();
  closeSheet();
});

renderPlanSubjects();
renderPlanner();

// =====================================================
// PROGRESS
// =====================================================
const STUDY_KEY = 'studyflow-study-v1';
const STATS_KEY = 'studyflow-stats-v1';
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ----- Data: minutes studied per day, saved in your browser -----
function seedStudyLog() {
  const minutes = [
    80, 105, 60, 125, 90, 110, 70, 95, 100, 65, 130, 85, 115, 75,  // 4 weeks ago to 2 weeks ago
    90, 120, 80, 140, 110, 95, 0,                                  // the week before last (ends on a rest day)
    90, 115, 55, 145, 115, 165, 65                                 // the last 7 days, ending today
  ];
  const log = {};
  minutes.forEach((m, i) => {
    log[dateKey(addDays(today, i - (minutes.length - 1)))] = m;
  });
  return log;
}

function loadJson(key, makeDefault) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (value && typeof value === 'object') return value;
  } catch (err) {
    // ignore broken saved data
  }
  return makeDefault();
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // saving not possible, the app still works
  }
}

const studyLog = loadJson(STUDY_KEY, seedStudyLog);
const stats = loadJson(STATS_KEY, () => ({ sessions: 24, morning: 5 }));

function minutesOn(date) {
  return studyLog[dateKey(date)] || 0;
}

function totalMinutes() {
  return Object.values(studyLog).reduce((sum, m) => sum + m, 0);
}

function currentStreak() {
  let streak = 0;
  let day = new Date(today);
  if (minutesOn(day) === 0) day = addDays(day, -1);   // a day not started yet does not break the streak
  while (minutesOn(day) > 0) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

// Called by the Focus timer when a focus session finishes
function recordFocusSession(minutes) {
  const key = dateKey(today);
  studyLog[key] = (studyLog[key] || 0) + Math.round(minutes);
  stats.sessions += 1;
  if (new Date(Date.now() - minutes * 60000).getHours() < 10) stats.morning += 1;

  saveJson(STUDY_KEY, studyLog);
  saveJson(STATS_KEY, stats);
  updateGoalCard();
  renderProgress();
}

// ----- Progress: elements -----
const progressRange = document.getElementById('progress-range');
const plotEl = document.getElementById('plot');
const chartEl = document.getElementById('chart');
const xLabels = document.getElementById('x-labels');
const chartTip = document.getElementById('chart-tip');
const dataTable = document.getElementById('data-table');
const tableToggle = document.getElementById('table-toggle');
const hoursTotal = document.getElementById('hours-total');
const hoursDelta = document.getElementById('hours-delta');
const chartRange = document.getElementById('chart-range');

const TREND_UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>';
const TREND_DOWN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/></svg>';

const BADGE_ICONS = {
  flame: '<path d="M12 3c0 4-5 6-5 11a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 3 0-3 0-6-1-10z"/>',
  waves: '<path d="M3 8c3-3 6 3 9 0s6-3 9 0"/><path d="M3 13c3-3 6 3 9 0s6-3 9 0"/><path d="M3 18c3-3 6 3 9 0s6-3 9 0"/>',
  sunrise: '<path d="M12 3v5M12 8l-2.5 2.5M12 8l2.5 2.5"/><path d="M5 18a7 7 0 0 1 14 0"/><path d="M3 18h18M7 21h10"/>'
};

// ----- Progress: draw the chart, numbers and badges -----
function renderProgress() {
  const days = Number(progressRange.value);

  // The days shown, oldest first, ending today
  const dates = [];
  for (let i = days - 1; i >= 0; i--) dates.push(addDays(today, -i));
  const values = dates.map(minutesOn);
  const total = values.reduce((sum, m) => sum + m, 0);

  // The same number of days just before, to compare with
  let previous = 0;
  for (let i = days; i < days * 2; i++) previous += minutesOn(addDays(today, -i));

  // Big number + change
  hoursTotal.textContent = Number((total / 60).toFixed(1));

  if (previous > 0) {
    const percent = Math.round(((total - previous) / previous) * 100);
    const when = days === 7 ? 'last week' : 'the 2 weeks before';
    if (percent > 0) {
      hoursDelta.className = 'delta up';
      hoursDelta.innerHTML = TREND_UP + '<span class="sr-only">Up </span>' + percent + '% vs ' + when;
    } else if (percent < 0) {
      hoursDelta.className = 'delta';
      hoursDelta.innerHTML = TREND_DOWN + '<span class="sr-only">Down </span>' + Math.abs(percent) + '% vs ' + when;
    } else {
      hoursDelta.className = 'delta';
      hoursDelta.textContent = 'Same as ' + when;
    }
  } else {
    hoursDelta.className = 'delta';
    hoursDelta.textContent = '';
  }

  // Vertical scale: whole hours
  const peak = Math.max(...values, 60);
  let topHours = Math.ceil(peak / 60);
  const step = topHours <= 4 ? 1 : 2;
  topHours = Math.ceil(topHours / step) * step;

  let gridHtml = '';
  for (let h = 0; h <= topHours; h += step) {
    gridHtml += '<div class="grid-line" style="bottom: ' + (h / topHours) * 100 + '%"><span>' + (h === 0 ? '0' : h + 'h') + '</span></div>';
  }

  // Bars
  let barsHtml = '';
  let labelsHtml = '';
  let rowsHtml = '';

  dates.forEach((d, i) => {
    const m = values[i];
    const isToday = i === days - 1;
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const height = (m / (topHours * 60)) * 100;

    barsHtml += `
      <button class="bar-cell${isToday ? ' today' : ''}" data-label="${label}" data-minutes="${m}"
              aria-label="${label}: ${m ? durationText(m) : 'no study time'}">
        <span class="chart-bar" style="height: ${height}%"></span>
      </button>`;
    labelsHtml += '<span class="' + (isToday ? 'today' : '') + '">' + WEEKDAY_LETTERS[d.getDay()] + '</span>';
    rowsHtml += '<tr><td>' + label + '</td><td>' + (m ? durationText(m) : 'None') + '</td></tr>';
  });

  const columns = 'repeat(' + days + ', minmax(0, 1fr))';
  plotEl.innerHTML = gridHtml + '<div class="bars" style="grid-template-columns: ' + columns + '">' + barsHtml + '</div>';
  xLabels.style.gridTemplateColumns = columns;
  xLabels.innerHTML = labelsHtml;
  dataTable.innerHTML = '<caption class="sr-only">Study time per day</caption>' +
    '<thead><tr><th scope="col">Day</th><th scope="col">Study time</th></tr></thead><tbody>' + rowsHtml + '</tbody>';
  chartTip.hidden = true;

  // Footer text
  const first = dates[0];
  const last = dates[dates.length - 1];
  const firstText = first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const lastText = first.getMonth() === last.getMonth()
    ? last.getDate()
    : last.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  chartRange.textContent = firstText + '–' + lastText + ' · Today: ' + minutesOn(today) + ' minutes';

  // Streak (also shown on Home)
  const streak = currentStreak();
  document.getElementById('stat-streak').textContent = streak + (streak === 1 ? ' day' : ' days');
  document.getElementById('home-streak').textContent = streak ? streak + '-day streak' : 'Start your streak';

  // Stat cards
  document.getElementById('stat-sessions').textContent = stats.sessions;

  // Badges
  const badges = [
    { name: 'On a roll',  color: 'lilac', icon: 'flame',   have: streak,                              goal: 7,  unit: 'days',   earnedText: '7-day streak' },
    { name: 'Deep diver', color: 'mint',  icon: 'waves',   have: Math.floor(totalMinutes() / 60),     goal: 10, unit: 'hours',  earnedText: '10 focus hours' },
    { name: 'Early bird', color: 'peach', icon: 'sunrise', have: stats.morning,                       goal: 5,  unit: 'starts', earnedText: '5 morning starts' }
  ];

  let earned = 0;
  document.getElementById('badges').innerHTML = badges.map(b => {
    const isEarned = b.have >= b.goal;
    if (isEarned) earned++;
    return `
      <li class="badge${isEarned ? '' : ' locked'}">
        <div class="badge-icon"${isEarned ? ' style="background: var(--' + b.color + ')"' : ''}>
          <svg viewBox="0 0 24 24" aria-hidden="true">${BADGE_ICONS[b.icon]}</svg>
        </div>
        <strong>${b.name}</strong>
        <span>${isEarned ? b.earnedText : b.have + ' of ' + b.goal + ' ' + b.unit}</span>
      </li>`;
  }).join('');
  document.getElementById('badge-count').textContent = earned + ' earned';
}

// ----- Progress: tooltip on hover / focus / tap -----
function showTip(cell) {
  const minutes = Number(cell.dataset.minutes);

  chartTip.textContent = '';
  const value = document.createElement('strong');
  value.textContent = minutes ? durationText(minutes) : 'No study time';
  const label = document.createElement('span');
  label.textContent = cell.dataset.label;
  chartTip.append(value, label);
  chartTip.hidden = false;

  const chartBox = chartEl.getBoundingClientRect();
  const cellBox = cell.getBoundingClientRect();
  const barBox = cell.querySelector('.chart-bar').getBoundingClientRect();
  const half = chartTip.offsetWidth / 2;

  let left = cellBox.left + cellBox.width / 2 - chartBox.left;
  left = Math.max(half, Math.min(chartBox.width - half, left));

  chartTip.style.left = left + 'px';
  chartTip.style.top = (barBox.height ? barBox.top : cellBox.bottom) - chartBox.top + 'px';
}

plotEl.addEventListener('pointerover', e => {
  const cell = e.target.closest('.bar-cell');
  if (cell) showTip(cell);
});

plotEl.addEventListener('pointerleave', e => {
  if (e.pointerType === 'mouse') chartTip.hidden = true;
});

plotEl.addEventListener('focusin', e => {
  const cell = e.target.closest('.bar-cell');
  if (cell) showTip(cell);
});

plotEl.addEventListener('focusout', () => {
  chartTip.hidden = true;
});

document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.bar-cell')) chartTip.hidden = true;
});

// ----- Progress: range dropdown and table view -----
progressRange.addEventListener('change', renderProgress);

tableToggle.addEventListener('click', () => {
  const showTable = dataTable.hidden;
  dataTable.hidden = !showTable;
  chartEl.hidden = showTable;
  tableToggle.textContent = showTable ? 'View as chart' : 'View as table';
  tableToggle.setAttribute('aria-expanded', showTable);
});

// ----- Start everything -----
renderProgress();
requestAnimationFrame(() => {
  requestAnimationFrame(updateGoalCard);
});

// =====================================================
// ONBOARDING
// =====================================================
const ONBOARD_KEY = 'studyflow-onboarded-v1';

const onboarding = document.getElementById('onboarding');
const obSlides = document.getElementById('ob-slides');
const obDots = document.querySelectorAll('.ob-dot');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// While the intro is open, the app behind it can't be reached with the keyboard
function setAppInert(isInert) {
  document.querySelectorAll('.screen, .tabbar, .sheet, .backdrop').forEach(el => {
    el.inert = isInert;
  });
}

function currentSlide() {
  return Math.round(obSlides.scrollLeft / obSlides.clientWidth) || 0;
}

function updateDots() {
  const current = currentSlide();
  obDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === current);
    if (i === current) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
}

function goToSlide(index) {
  const target = Math.max(0, Math.min(obDots.length - 1, index));
  obSlides.scrollTo({
    left: target * obSlides.clientWidth,
    behavior: reduceMotion ? 'auto' : 'smooth'
  });
}

function showOnboarding() {
  onboarding.hidden = false;
  setAppInert(true);
  obSlides.scrollLeft = 0;
  updateDots();
}

function finishOnboarding() {
  onboarding.hidden = true;
  setAppInert(false);
  try {
    localStorage.setItem(ONBOARD_KEY, '1');
  } catch (err) {
    // not saved, the intro will show again next time
  }

  document.querySelector('[data-target="home"]').click();
  const homeTitle = document.querySelector('#home h1');
  homeTitle.setAttribute('tabindex', '-1');
  homeTitle.focus();
}

obSlides.addEventListener('scroll', updateDots, { passive: true });
obDots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

obSlides.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    goToSlide(currentSlide() + 1);
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    goToSlide(currentSlide() - 1);
  }
});

document.getElementById('ob-start').addEventListener('click', finishOnboarding);
document.getElementById('ob-skip').addEventListener('click', finishOnboarding);
document.getElementById('ob-login').addEventListener('click', finishOnboarding);

// Show the intro the first time (or any time the address ends with ?intro)
let seenOnboarding = false;
try {
  seenOnboarding = localStorage.getItem(ONBOARD_KEY) === '1';
} catch (err) {
  // treat as not seen
}

if (seenOnboarding && !location.search.includes('intro')) {
  onboarding.hidden = true;
} else {
  showOnboarding();
}