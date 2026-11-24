const questions = window.OpenPharmacyQuestions;

const courses = [
  {
    key: "pharm",
    title: "Pharmacy sciences",
    description: "Pharmacology, pharmaceutics, medicinal chemistry, and natural products.",
    category: "CORE CONCEPTS",
    art: "pharm",
    symbol: "⌁",
  },
  {
    key: "physiology",
    title: "Biochemistry",
    description: "Core biochemical pathways and molecular foundations.",
    category: "FOUNDATIONS",
    art: "calcs",
    symbol: "∿",
  },
  {
    key: "clinical",
    title: "Pathophysiology & therapeutics",
    description: "Disease concepts and foundational treatment choices.",
    category: "CASE THINKING",
    art: "care",
    symbol: "✳",
  },
  {
    key: "evidence",
    title: "Pharmacy practice",
    description: "Medication safety, prescription checks, and patient counselling.",
    category: "PROFESSIONAL SKILLS",
    art: "evidence",
    symbol: "∴",
  },
];

const STORAGE_KEY = "dosepath-study-state-v2";
const WEEKLY_GOAL = 20;
const courseList = document.querySelector("#course-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#course-search");
const practiceDialog = document.querySelector("#practice-dialog");
const answerForm = document.querySelector("#answer-form");
const answerOptions = document.querySelector("#answer-options");
const reflectionFieldset = document.querySelector("#reflection-fieldset");
const answerFeedback = document.querySelector("#answer-feedback");
const submitAnswer = document.querySelector("#submit-answer");
const toast = document.querySelector("#toast");
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menu-button");
const scrim = document.querySelector("#scrim");
const todayPlan = document.querySelector("#today-plan");
const studyRegion = document.querySelector("#study-region");
const notificationButton = document.querySelector("#notification-button");
const browsePathsButton = document.querySelector("#browse-paths");

const emptyStateData = { attempts: [], reviews: {}, region: "global" };
let state = loadState();
let sessionQueue = [];
let sessionIndex = 0;
let currentQuestion = null;
let answered = false;
let toastTimer;
let sessionMode = "focused";
let examDeadline = null;
let examTimer = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return { ...emptyStateData };
    return {
      attempts: Array.isArray(saved.attempts) ? saved.attempts : [],
      reviews: saved.reviews && typeof saved.reviews === "object" ? saved.reviews : {},
      region: typeof saved.region === "string" ? saved.region : "global",
    };
  } catch {
    showToast("Saved progress could not be read. A new local profile is ready.");
    return { ...emptyStateData };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    showToast("Progress could not be saved in this browser.");
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3200);
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(date);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getLastAttempt(questionId) {
  return [...state.attempts].reverse().find((attempt) => attempt.questionId === questionId);
}

function getDueQuestions(now = Date.now()) {
  return Object.values(state.reviews)
    .filter((review) => review && new Date(review.dueAt).getTime() <= now)
    .map((review) => {
      const relatedQuestions = questions.filter((question) => question.objective === review.objective);
      return relatedQuestions.find((question) => question.id !== review.lastQuestionId) || relatedQuestions[0];
    })
    .filter(Boolean);
}

function getWeakQuestionOrder(source = questions) {
  const sorted = [...source].sort((a, b) => {
    const aLast = getLastAttempt(a.id);
    const bLast = getLastAttempt(b.id);
    if (!aLast && bLast) return -1;
    if (aLast && !bLast) return 1;
    if (!aLast && !bLast) return a.id.localeCompare(b.id);
    const aScore = aLast.correct ? 2 : 0;
    const bScore = bLast.correct ? 2 : 0;
    return aScore - bScore || new Date(aLast.at) - new Date(bLast.at);
  });
  const seenObjectives = new Set();
  return sorted.filter((question) => {
    if (seenObjectives.has(question.objective)) return false;
    seenObjectives.add(question.objective);
    return true;
  });
}

function getUnansweredQuestions(source = questions) {
  const completedIds = new Set(state.attempts.map((attempt) => attempt.questionId));
  return source.filter((question) => !completedIds.has(question.id));
}

function renderCourses(query = "") {
  const search = query.trim().toLowerCase();
  const matches = courses.filter((course) =>
    `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(search),
  );

  courseList.innerHTML = matches.map((course) => {
    const courseQuestions = questions.filter((question) => question.course === course.key);
    const practiced = courseQuestions.map((question) => getLastAttempt(question.id)).filter(Boolean);
    const mastery = practiced.length
      ? Math.round(practiced.reduce((sum, attempt) => sum + (attempt.correct ? 100 : 25), 0) / practiced.length)
      : 0;
    const progressLabel = practiced.length ? "Practice signal" : "No practice yet";
    return `
      <article class="course-card">
        <div class="course-art ${course.art}">
          <span class="course-art-mark" aria-hidden="true">${course.symbol}</span>
          <span class="course-tag">${course.category}</span>
        </div>
        <div class="course-body">
          <h3>${course.title}</h3>
          <p>${course.description}</p>
          <div class="course-progress-row"><span>${progressLabel}</span><strong>${practiced.length ? `${mastery}%` : "—"}</strong></div>
          <div class="course-progress" role="progressbar" aria-label="${course.title} practice signal" aria-valuenow="${mastery}" aria-valuemin="0" aria-valuemax="100">
            <span style="width:${mastery}%"></span>
          </div>
          <button class="course-open" type="button" data-course="${course.key}">Practice this path <span>→</span></button>
        </div>
      </article>
    `;
  }).join("");

  emptyState.hidden = matches.length > 0;
  courseList.hidden = matches.length === 0;
}

function renderBoardExams() {
  const examGrid = document.querySelector("#exam-grid");
  if (!examGrid) return;
  const remaining = getUnansweredQuestions().length;
  examGrid.innerHTML = `
    <article class="exam-card">
      <div class="exam-card-top">
        <strong class="exam-year">Open bank</strong>
        <span class="exam-status">158 QUESTIONS</span>
      </div>
      <p>General pharmacy revision questions from the attributed open question bank.</p>
      <div class="exam-card-meta"><span>${remaining} of ${questions.length} unseen</span><span>90 min</span></div>
      ${remaining
        ? `<button class="button button-soft" type="button" data-start-board-exam>Start unseen questions <span>→</span></button>`
        : `<button class="button button-soft" type="button" data-reset-open-bank>Reset this bank</button>`}
    </article>
  `;
}

function currentStreak() {
  const studyDays = new Set(state.attempts.map((attempt) => dateKey(new Date(attempt.at))));
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  let cursor = studyDays.has(dateKey(today)) ? today : studyDays.has(dateKey(yesterday)) ? yesterday : null;
  let streak = 0;
  while (cursor && studyDays.has(dateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function renderDashboard() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const thisWeek = state.attempts.filter((attempt) => new Date(attempt.at) >= weekStart);
  const recent = state.attempts.slice(-10);
  const accuracy = recent.length
    ? Math.round((recent.filter((attempt) => attempt.correct).length / recent.length) * 100)
    : "—";
  const goalProgress = Math.min(100, Math.round((thisWeek.length / WEEKLY_GOAL) * 100));
  const streak = currentStreak();
  const dueCount = getDueQuestions().length;

  document.querySelector("#today-date").textContent = formatDate(now).toUpperCase();
  document.querySelector("#weekly-progress-value").textContent = goalProgress;
  document.querySelector("#weekly-progress-meter").style.width = `${goalProgress}%`;
  document.querySelector("#questions-answered").textContent = state.attempts.length;
  document.querySelector("#questions-this-week").textContent = `${thisWeek.length}`;
  document.querySelector("#recent-accuracy").textContent = accuracy;
  document.querySelector("#current-streak").textContent = streak;
  document.querySelector("#sidebar-streak").textContent = `${streak} day${streak === 1 ? "" : "s"} streak`;
  document.querySelector("#sidebar-streak-count").textContent = String(streak).padStart(2, "0");
  document.querySelector("#due-count").textContent = dueCount
    ? `${dueCount} review${dueCount === 1 ? "" : "s"} due`
    : "No reviews due";
  notificationButton.setAttribute(
    "aria-label",
    dueCount
      ? `${dueCount} review${dueCount === 1 ? "" : "s"} due. Open review session`
      : "Notifications. No reviews due",
  );
  notificationButton.title = dueCount
    ? `${dueCount} review${dueCount === 1 ? "" : "s"} due — open reviews`
    : "No reviews due";
  document.querySelector("#date-chip").textContent = dueCount ? `${dueCount} DUE` : "READY WHEN YOU ARE";

  const planQuestions = dueCount ? getDueQuestions() : getWeakQuestionOrder().slice(0, 2);
  todayPlan.innerHTML = planQuestions.length
    ? planQuestions.slice(0, 3).map((question, index) => `
      <div class="plan-item">
        <span class="task-dot"></span>
        <div><strong>${dueCount ? "Review" : index === 0 ? "Start with" : "Then practice"}: ${question.topic.split(" · ")[0]}</strong><span>1 question · ${question.topic}</span></div>
        <span class="plan-time">${dueCount ? "DUE" : "NEXT"}</span>
      </div>
    `).join("")
    : `<div class="plan-item"><span class="task-dot"></span><div><strong>Start a short practice session</strong><span>5 min · Shared medical foundations</span></div><span class="plan-time">NOW</span></div>`;

  const planButton = document.querySelector("#plan-button");
  planButton.dataset.practiceMode = dueCount ? "due" : "focused";
  planButton.innerHTML = dueCount
    ? `Review due concepts <span>→</span>`
    : `Start focused practice <span>→</span>`;
  renderCourses(searchInput.value);
  renderBoardExams();
  window.MedQuoraWidget?.postMessage(JSON.stringify({
    due: dueCount,
    streak,
    accuracy: accuracy === "—" ? 0 : accuracy,
    weeklyProgress: thisWeek.length,
    total: state.attempts.length,
  }));
}

function renderQuestion() {
  const question = currentQuestion;
  document.querySelector("#question-count").textContent = sessionMode === "board"
    ? `OPEN BANK · ${String(sessionIndex + 1).padStart(2, "0")} / ${String(sessionQueue.length).padStart(2, "0")}`
    : `${String(sessionIndex + 1).padStart(2, "0")} / ${String(sessionQueue.length).padStart(2, "0")}`;
  document.querySelector("#question-topic").textContent = sessionMode === "board"
    ? `Open pharmacy practice · ${question.topic}`
    : question.topic;
  document.querySelector("#question-prompt").textContent = question.prompt;
  answerOptions.innerHTML = `
    <legend class="sr-only">Choose one answer</legend>
    ${question.options.map(([value, label], index) => `
      <label class="answer-option">
        <input type="radio" name="answer" value="${value}">
        <span class="radio-mark"></span><span>${label}</span><kbd>${String.fromCharCode(65 + index)}</kbd>
      </label>
    `).join("")}
  `;
}

function resetQuestion() {
  answered = false;
  answerForm.reset();
  answerFeedback.hidden = true;
  answerFeedback.textContent = "";
  answerFeedback.classList.remove("wrong");
  reflectionFieldset.hidden = true;
  reflectionFieldset.querySelectorAll("input").forEach((input) => { input.disabled = false; });
  const remediationHint = document.querySelector("#remediation-hint");
  remediationHint.hidden = true;
  remediationHint.textContent = "";
  submitAnswer.disabled = false;
  submitAnswer.innerHTML = `Check answer <span>→</span>`;
  submitAnswer.classList.remove("finish-session");
}

function openQuestion() {
  currentQuestion = sessionQueue[sessionIndex];
  resetQuestion();
  renderQuestion();
  if (!practiceDialog.open) practiceDialog.showModal();
}

function updateExamTimer() {
  if (sessionMode !== "board" || !examDeadline) return;
  const remaining = Math.max(0, examDeadline - Date.now());
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  document.querySelector("#question-count").textContent =
    `OPEN BANK · ${String(sessionIndex + 1).padStart(2, "0")} / ${String(sessionQueue.length).padStart(2, "0")} · ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (remaining === 0) {
    clearInterval(examTimer);
    practiceDialog.close("time-expired");
    showToast("Exam time expired. Completed answers are saved.");
  }
}

function startSession(mode = "focused", courseKey = null) {
  sessionMode = mode;
  clearInterval(examTimer);
  const allCandidates = courseKey
    ? questions.filter((question) => question.course === courseKey)
    : questions;
  let candidates = mode === "due"
    ? getDueQuestions()
    : getUnansweredQuestions(allCandidates);

  if (mode === "due" && candidates.length === 0) {
    showToast("Nothing is due yet. Starting a fresh practice session.");
    candidates = getUnansweredQuestions(questions);
  }
  if (!candidates.length) {
    showToast("You have answered every available question in this bank. Reset the open bank to start again.");
    return;
  }
  if (mode === "board") {
    sessionQueue = getWeakQuestionOrder(candidates);
    examDeadline = Date.now() + 90 * 60 * 1000;
    examTimer = setInterval(updateExamTimer, 1000);
  } else {
    sessionQueue = getWeakQuestionOrder(candidates).slice(0, Math.min(5, candidates.length));
  }
  sessionIndex = 0;
  openQuestion();
}

function updateReflectionHint(value) {
  const hints = {
    knowledge: "Next step: revisit the core concept, then test yourself on a different example.",
    confusion: "Next step: compare the two ideas side by side and identify the clue that separates them.",
    clue: "Next step: re-read the stem and name the clue that should guide your choice.",
    guess: "Next step: explain your reasoning before choosing; this concept is scheduled for a short review.",
  };
  const hint = document.querySelector("#remediation-hint");
  hint.textContent = hints[value] || "";
  hint.hidden = !value;
}

function showAnswerFeedback(selectedValue, correct) {
  const correctOption = currentQuestion.options.find(([value]) => value === currentQuestion.answer);
  const selectedRationale = correct ? "" : ` ${currentQuestion.rationales[selectedValue] || ""}`;
  answerFeedback.textContent = correct
    ? `Correct. ${currentQuestion.explanation}`
    : `Not quite. The best answer is ${correctOption[1]}. ${currentQuestion.explanation}${selectedRationale}`;
  answerFeedback.hidden = false;
  answerFeedback.classList.toggle("wrong", !correct);

  answerOptions.querySelectorAll(".answer-option").forEach((option) => {
    const input = option.querySelector("input");
    input.disabled = true;
    if (input.value === currentQuestion.answer) option.classList.add("correct");
    if (input.value === selectedValue && !correct) option.classList.add("incorrect");
  });
  if (!correct && sessionMode !== "board") {
    reflectionFieldset.hidden = false;
    submitAnswer.innerHTML = `Save reflection <span>→</span>`;
    submitAnswer.disabled = true;
  } else {
    submitAnswer.innerHTML = sessionIndex === sessionQueue.length - 1
      ? `Finish session <span>→</span>`
      : `Save & continue <span>→</span>`;
  }
}

function scheduleReview(question, correct) {
  const previous = state.reviews[question.objective];
  const nextInterval = correct
    ? Math.min(21, Math.max(2, (previous?.intervalDays || 1) * 2))
    : 1;
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + Math.ceil(nextInterval));
  state.reviews[question.objective] = {
    objective: question.objective,
    lastQuestionId: question.id,
    dueAt: dueAt.toISOString(),
    intervalDays: Math.ceil(nextInterval),
    lastCorrect: correct,
  };
}

function saveCurrentAttempt() {
  const selected = answerForm.querySelector('input[name="answer"]:checked');
  const reflection = answerForm.querySelector('input[name="reflection"]:checked')?.value || null;
  if (!selected) {
    showToast("Choose an answer before continuing.");
    return false;
  }
  if (!answered) {
    showToast("Check your answer before saving the attempt.");
    return false;
  }
  if (sessionMode !== "board" && selected.value !== currentQuestion.answer && !reflection) {
    showToast("Choose what made the question difficult to get targeted feedback.");
    return false;
  }

  const correct = selected.value === currentQuestion.answer;
  state.attempts.push({
    questionId: currentQuestion.id,
    at: new Date().toISOString(),
    correct,
    reflection,
  });
  scheduleReview(currentQuestion, correct);
  saveState();
  renderDashboard();
  return correct;
}

function finishCurrentQuestion() {
  const correct = saveCurrentAttempt();
  if (correct === false && !answered) return;
  if (sessionMode !== "board" && answered && currentQuestion && answerForm.querySelector('input[name="answer"]:checked')?.value !== currentQuestion.answer &&
      !answerForm.querySelector('input[name="reflection"]:checked')) return;

  sessionIndex += 1;
  if (sessionIndex < sessionQueue.length) {
    openQuestion();
    return;
  }
  const savedCorrect = state.attempts.slice(-sessionQueue.length).filter((attempt) => attempt.correct).length;
  practiceDialog.close("complete");
  clearInterval(examTimer);
  showToast(sessionMode === "board"
    ? `Open-bank test complete: ${savedCorrect} of ${sessionQueue.length} correct.`
    : `Session saved: ${savedCorrect} of ${sessionQueue.length} correct. Your next reviews are scheduled.`);
}

renderCourses();
studyRegion.value = state.region;
studyRegion.addEventListener("change", () => {
  state.region = studyRegion.value;
  saveState();
  showToast("Study region saved. Sample content remains globally focused.");
});
searchInput.addEventListener("input", () => renderCourses(searchInput.value));
renderDashboard();

notificationButton.addEventListener("click", () => {
  if (!getDueQuestions().length) {
    showToast("No reviews are due. Start a quick practice question whenever you're ready.");
    return;
  }
  startSession("due");
  setActiveNavigation("practice");
  closeSidebar();
});

browsePathsButton.addEventListener("click", (event) => {
  event.preventDefault();
  searchInput.value = "";
  renderCourses();
  document.querySelector("#courses").scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
  setActiveNavigation("courses");
  closeSidebar();
});

document.addEventListener("click", (event) => {
  const resetBankButton = event.target.closest("[data-reset-open-bank]");
  if (resetBankButton) {
    if (!window.confirm("Reset this bank's attempts and reviews so you can answer these questions again?")) return;
    const bankQuestionIds = new Set(questions.map((question) => question.id));
    const bankObjectives = new Set(questions.map((question) => question.objective));
    state.attempts = state.attempts.filter((attempt) => !bankQuestionIds.has(attempt.questionId));
    state.reviews = Object.fromEntries(
      Object.entries(state.reviews).filter(([objective]) => !bankObjectives.has(objective)),
    );
    saveState();
    renderDashboard();
    showToast("Open question bank reset. All questions are available again.");
    return;
  }

  const boardTrigger = event.target.closest("[data-start-board-exam]");
  if (boardTrigger) {
    event.preventDefault();
    startSession("board");
    setActiveNavigation("board-exams");
    closeSidebar();
    return;
  }

  const practiceTrigger = event.target.closest("[data-open-practice]");
  if (practiceTrigger) {
    event.preventDefault();
    startSession(practiceTrigger.dataset.practiceMode || "focused");
    setActiveNavigation("practice");
    closeSidebar();
    return;
  }

  const courseButton = event.target.closest("[data-course]");
  if (courseButton) {
    startSession("course", courseButton.dataset.course);
    setActiveNavigation("courses");
    closeSidebar();
  }
});

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!answered) {
    const selected = answerForm.querySelector('input[name="answer"]:checked');
    if (!selected) {
      showToast("Choose an answer first.");
      return;
    }
    answered = true;
    showAnswerFeedback(selected.value, selected.value === currentQuestion.answer);
    return;
  }
  finishCurrentQuestion();
});

reflectionFieldset.addEventListener("change", (event) => {
  if (event.target.name !== "reflection") return;
  updateReflectionHint(event.target.value);
  submitAnswer.disabled = false;
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (link.hasAttribute("data-open-practice")) return;
    const target = link.getAttribute("href")?.slice(1);
    if (target) setActiveNavigation(target);
    closeSidebar();
  });
});

function setActiveNavigation(target) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    const isActive = link.getAttribute("href") === `#${target}`;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function closeSidebar() {
  sidebar.classList.remove("open");
  scrim.classList.remove("visible");
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("open");
  scrim.classList.toggle("visible", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

scrim.addEventListener("click", closeSidebar);

practiceDialog.addEventListener("close", () => {
  if (sessionMode === "board") {
    clearInterval(examTimer);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.target.matches("input, textarea, select")) {
    event.preventDefault();
    searchInput.focus();
  }
});
