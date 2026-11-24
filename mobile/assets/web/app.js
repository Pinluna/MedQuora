const questions = window.OpenPharmacyQuestions;

const courses = [
  {
    key: "paper-1",
    title: "Paper 1 foundations",
    description: "Anatomy, physiology, biochemistry, chemistry, microbiology, pathology, and immunology.",
    category: "BOARD PAPER 1",
    art: "calcs",
    symbol: "1",
  },
  {
    key: "paper-2",
    title: "Paper 2 pharmacy practice",
    description: "Pharmacology, clinical pharmacy, pharmacognosy, pharmaceutics, pharmaceutical chemistry, epidemiology, and research methods.",
    category: "BOARD PAPER 2",
    art: "pharm",
    symbol: "2",
  },
];

const STORAGE_KEY = "dosepath-study-state-v2";
const WEEKLY_GOAL = 20;
const BOARD_EXAM_QUESTION_COUNT = 60;
const BOARD_EXAM_MINUTES = 60;
const BOARD_EXAMS = {
  "paper-1": {
    label: "PAPER 1",
    title: "Paper 1 simulation",
    topics: ["anatomy", "physiology", "biochemistry", "organic chemistry", "physical chemistry", "inorganic chemistry", "microbiology", "pathology", "immunology"],
  },
  "paper-2": {
    label: "PAPER 2",
    title: "Paper 2 simulation",
    topics: ["pharmacology", "clinical pharmacy", "pharmacognosy", "pharmaceutics", "pharmaceutical chemistry", "epidemiology", "research methods"],
  },
};
const courseList = document.querySelector("#course-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#course-search");
const practiceDialog = document.querySelector("#practice-dialog");
const answerForm = document.querySelector("#answer-form");
const answerOptions = document.querySelector("#answer-options");
const answerFeedback = document.querySelector("#answer-feedback");
const sessionLabel = document.querySelector("#session-label");
const examTimerDisplay = document.querySelector("#exam-timer");
const reviewDialog = document.querySelector("#review-dialog");
const reviewScore = document.querySelector("#review-score");
const reviewSummary = document.querySelector("#review-summary");
const reviewList = document.querySelector("#review-list");
const submitAnswer = document.querySelector("#submit-answer");
const toast = document.querySelector("#toast");
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menu-button");
const scrim = document.querySelector("#scrim");
const todayPlan = document.querySelector("#today-plan");
const studyRegion = document.querySelector("#study-region");
const notificationButton = document.querySelector("#notification-button");
const browsePathsButton = document.querySelector("#browse-paths");

const emptyStateData = { attempts: [], reviews: {}, history: [], region: "global" };
let state = loadState();
let sessionQueue = [];
let sessionIndex = 0;
let currentQuestion = null;
let answered = false;
let toastTimer;
let sessionMode = "focused";
let examPaper = null;
let examDeadline = null;
let examTimer = null;
let sessionResults = [];
let sessionEndReason = "complete";

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== "object") return { ...emptyStateData };
    return {
      attempts: Array.isArray(saved.attempts) ? saved.attempts : [],
      reviews: saved.reviews && typeof saved.reviews === "object" ? saved.reviews : {},
      history: Array.isArray(saved.history) ? saved.history : [],
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
  const answeredIds = new Set(state.attempts.map((attempt) => attempt.questionId));
  return Object.values(state.reviews)
    .filter((review) => review && new Date(review.dueAt).getTime() <= now)
    .map((review) => {
      const unseen = questions.filter((question) =>
        question.objective === review.objective && !answeredIds.has(question.id));
      return unseen.find((question) => question.id !== review.lastQuestionId) || unseen[0];
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

function getPaperQuestions(paper) {
  return questions.filter((question) => question.paper === paper);
}

function getBoardExamQueue(paper) {
  const config = BOARD_EXAMS[paper];
  const candidates = getUnansweredQuestions(getPaperQuestions(paper));
  if (candidates.length < BOARD_EXAM_QUESTION_COUNT) return [];
  const buckets = config.topics.map((topic) =>
    getWeakQuestionOrder(candidates.filter((question) => question.examTopic === topic)),
  );
  const queue = [];
  let index = 0;
  while (queue.length < BOARD_EXAM_QUESTION_COUNT) {
    let added = false;
    for (const bucket of buckets) {
      if (!bucket.length) continue;
      queue.push(bucket.shift());
      added = true;
      if (queue.length === BOARD_EXAM_QUESTION_COUNT) break;
    }
    if (!added) break;
    index += 1;
    if (index > BOARD_EXAM_QUESTION_COUNT * 2) break;
  }
  return queue;
}

function isBoardSession() {
  return sessionMode === "board";
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
  examGrid.innerHTML = Object.entries(BOARD_EXAMS).map(([paper, config]) => {
    const pool = getPaperQuestions(paper);
    const remaining = getUnansweredQuestions(pool).length;
    const ready = remaining >= BOARD_EXAM_QUESTION_COUNT;
    return `
      <article class="exam-card">
        <div class="exam-card-top">
          <strong class="exam-year">${config.label}</strong>
          <span class="exam-status">60 QUESTIONS · 60 MIN</span>
        </div>
        <p>${config.title} using only ${config.topics.join(", ")} questions.</p>
        <div class="exam-card-meta"><span>${remaining} of ${pool.length} unseen</span><span>${config.topics.length} topics</span></div>
        ${ready
          ? `<button class="button button-soft" type="button" data-start-board-exam="${paper}">Start ${config.label} simulation <span>→</span></button>`
          : `<button class="button button-soft" type="button" data-reset-paper="${paper}">Reset ${config.label} bank</button>`}
      </article>
    `;
  }).join("");
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
  renderHistory();
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
  document.querySelector("#question-count").textContent = isBoardSession()
    ? `${BOARD_EXAMS[examPaper].label} · ${String(sessionIndex + 1).padStart(2, "0")} / ${String(sessionQueue.length).padStart(2, "0")}`
    : `${String(sessionIndex + 1).padStart(2, "0")} / ${String(sessionQueue.length).padStart(2, "0")}`;
  document.querySelector("#question-topic").textContent = isBoardSession()
    ? `${BOARD_EXAMS[examPaper].title} · ${question.examTopic}`
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
  submitAnswer.disabled = false;
  submitAnswer.innerHTML = `Check answer <span>→</span>`;
  submitAnswer.classList.remove("finish-session");
}

function openQuestion() {
  currentQuestion = sessionQueue[sessionIndex];
  resetQuestion();
  renderQuestion();
  sessionLabel.textContent = isBoardSession() ? "BOARD EXAMINATION" : "QUICK PRACTICE";
  examTimerDisplay.hidden = !isBoardSession();
  if (!practiceDialog.open) practiceDialog.showModal();
}

function updateExamTimer() {
  if (!isBoardSession() || !examDeadline) return;
  const remaining = Math.max(0, examDeadline - Date.now());
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  examTimerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  examTimerDisplay.classList.toggle("urgent", remaining <= 5 * 60 * 1000);
  if (remaining === 0) expireBoardSession();
}

function expireBoardSession() {
  clearInterval(examTimer);
  examDeadline = null;
  const selected = answerForm.querySelector('input[name="answer"]:checked');
  if (sessionIndex < sessionQueue.length && selected) {
    answered = true;
    showAnswerFeedback(selected.value, selected.value === currentQuestion.answer);
  }
  if (sessionIndex < sessionQueue.length) {
    if (answered && selected) saveCurrentAttempt();
    else recordAttempt(currentQuestion, null, false);
  }
  for (let index = sessionIndex + 1; index < sessionQueue.length; index += 1) {
    recordAttempt(sessionQueue[index], null, false);
  }
  saveState();
  renderDashboard();
  sessionIndex = sessionQueue.length;
  endSession("time-expired");
}

function startSession(mode = "focused", courseKey = null) {
  sessionMode = mode;
  examPaper = null;
  examDeadline = null;
  sessionResults = [];
  sessionEndReason = "complete";
  examTimerDisplay.classList.remove("urgent");
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
    sessionQueue = candidates.slice(0, Math.min(5, candidates.length));
  } else {
    sessionQueue = getWeakQuestionOrder(candidates).slice(0, Math.min(5, candidates.length));
  }
  sessionIndex = 0;
  openQuestion();
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
  submitAnswer.innerHTML = sessionIndex === sessionQueue.length - 1
    ? `Finish session <span>→</span>`
    : `Save & continue <span>→</span>`;
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

function recordAttempt(question, selectedValue, correct) {
  state.attempts.push({
    questionId: question.id,
    at: new Date().toISOString(),
    correct,
  });
  scheduleReview(question, correct);
  sessionResults.push({ question, selectedValue, correct, paper: examPaper });
}

function saveCurrentAttempt() {
  const selected = answerForm.querySelector('input[name="answer"]:checked');
  if (!selected) {
    showToast("Choose an answer before continuing.");
    return false;
  }
  if (!answered) {
    showToast("Check your answer before saving the attempt.");
    return false;
  }

  const correct = selected.value === currentQuestion.answer;
  recordAttempt(currentQuestion, selected.value, correct);
  saveState();
  renderDashboard();
  return correct;
}

function sessionModeLabel(mode, paper) {
  if (mode === "board") return `Board exam · ${BOARD_EXAMS[paper]?.label || paper}`;
  if (mode === "due") return "Due review";
  if (mode === "course") return "Course practice";
  return "Quick practice";
}

function reviewTitle(mode, paper) {
  if (mode === "board") return `${BOARD_EXAMS[paper]?.label || "Board exam"} review`;
  return `${sessionModeLabel(mode, paper)} review`;
}

function reviewSummaryText(reason, mode, paper) {
  if (reason === "time-expired") return "Time expired. Unanswered questions were marked incorrect.";
  if (mode === "board") return `${BOARD_EXAMS[paper]?.title || "Board exam"} complete. Review your answers below.`;
  return "Review your answers below. Your next reviews are scheduled.";
}

function openReview({ title, summary, score, total, results }) {
  reviewScore.textContent = `${score} / ${total} CORRECT`;
  document.querySelector("#review-title").textContent = title;
  reviewSummary.textContent = summary;
  reviewList.innerHTML = results.map((result, index) => {
    const question = result.question || questions.find((item) => item.id === result.questionId);
    if (!question) return "";
    const { selectedValue, correct } = result;
    const correctOption = question.options.find(([value]) => value === question.answer);
    const yourAnswer = selectedValue
      ? question.options.find(([value]) => value === selectedValue)?.[1] || selectedValue
      : "Unanswered";
    const status = selectedValue ? (correct ? "Correct" : "Incorrect") : "Unanswered";
    const selectedRationale = selectedValue && selectedValue !== question.answer
      ? question.rationales[selectedValue] || ""
      : "";
    const topic = result.paper && BOARD_EXAMS[result.paper] ? question.examTopic : question.topic;
    return `
      <article class="review-item ${correct ? "is-correct" : "is-incorrect"}">
        <div class="review-item-top">
          <span class="review-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="review-topic">${topic}</span>
          <span class="review-badge">${status}</span>
        </div>
        <p class="review-prompt">${question.prompt}</p>
        <p class="review-choice"><span>Your answer</span><strong>${yourAnswer}</strong></p>
        <p class="review-choice is-answer"><span>Correct answer</span><strong>${correctOption[1]}</strong></p>
        <p class="review-explanation">${question.explanation}${selectedRationale ? ` ${selectedRationale}` : ""}</p>
      </article>
    `;
  }).join("");
  reviewDialog.showModal();
}

function renderReview() {
  openReview({
    title: reviewTitle(sessionMode, examPaper),
    summary: reviewSummaryText(sessionEndReason, sessionMode, examPaper),
    score: sessionResults.filter((result) => result.correct).length,
    total: sessionQueue.length,
    results: sessionResults,
  });
}

function rememberSession(reason) {
  const score = sessionResults.filter((result) => result.correct).length;
  state.history.push({
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    mode: sessionMode,
    paper: examPaper,
    reason,
    score,
    total: sessionQueue.length,
    results: sessionResults.map(({ question, selectedValue, correct, paper }) => ({
      questionId: question.id,
      selectedValue,
      correct,
      paper,
    })),
  });
  saveState();
}

function renderHistory() {
  const historyList = document.querySelector("#history-list");
  if (!historyList) return;
  const sessions = [...state.history].reverse();
  const count = document.querySelector("#history-count");
  if (count) count.textContent = `${sessions.length} saved session${sessions.length === 1 ? "" : "s"}`;
  historyList.innerHTML = sessions.length
    ? sessions.map((session) => {
      const when = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(session.at));
      const expired = session.reason === "time-expired" ? " · time expired" : "";
      return `
        <article class="history-item">
          <div class="history-item-copy">
            <strong>${sessionModeLabel(session.mode, session.paper)}</strong>
            <span>${when} · ${session.score} / ${session.total} correct${expired}</span>
          </div>
          <button class="button button-soft" type="button" data-view-history="${session.id}">View review <span>→</span></button>
        </article>
      `;
    }).join("")
    : `<p class="history-empty">No sessions yet. Complete a practice question or board paper to build your history.</p>`;
}

function endSession(reason = "complete") {
  sessionEndReason = reason;
  clearInterval(examTimer);
  examDeadline = null;
  practiceDialog.close(reason);
  const score = sessionResults.filter((result) => result.correct).length;
  const total = sessionQueue.length;
  rememberSession(reason);
  showToast(isBoardSession()
    ? `${BOARD_EXAMS[examPaper].title}${reason === "time-expired" ? " time expired" : " complete"}: ${score} of ${total} correct.`
    : `Session saved: ${score} of ${total} correct. Your next reviews are scheduled.`);
  renderDashboard();
  renderReview();
}

function finishCurrentQuestion() {
  const correct = saveCurrentAttempt();
  if (correct === false && !answered) return;

  sessionIndex += 1;
  if (sessionIndex < sessionQueue.length) {
    openQuestion();
    return;
  }
  endSession("complete");
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
  const historyButton = event.target.closest("[data-view-history]");
  if (historyButton) {
    const session = state.history.find((item) => item.id === historyButton.dataset.viewHistory);
    if (!session) return;
    const results = session.results
      .map((result) => ({ ...result, question: questions.find((question) => question.id === result.questionId) }))
      .filter((result) => result.question);
    openReview({
      title: reviewTitle(session.mode, session.paper),
      summary: `${reviewSummaryText(session.reason, session.mode, session.paper)} Saved session.`,
      score: session.score,
      total: session.total,
      results,
    });
    setActiveNavigation("history");
    closeSidebar();
    return;
  }

  const resetAllButton = event.target.closest("[data-reset-all]");
  if (resetAllButton) {
    if (!window.confirm("Reset all answered questions and review scheduling? Your session history stays.")) return;
    state.attempts = [];
    state.reviews = {};
    saveState();
    renderDashboard();
    showToast("All question banks reset. Every question is available again.");
    return;
  }

  const resetPaperButton = event.target.closest("[data-reset-paper]");
  if (resetPaperButton) {
    const paper = resetPaperButton.dataset.resetPaper;
    const config = BOARD_EXAMS[paper];
    if (!config) return;
    if (!window.confirm(`Reset ${config.title} attempts and reviews so you can answer this paper again?`)) return;
    const bankQuestionIds = new Set(getPaperQuestions(paper).map((question) => question.id));
    const bankObjectives = new Set(getPaperQuestions(paper).map((question) => question.objective));
    state.attempts = state.attempts.filter((attempt) => !bankQuestionIds.has(attempt.questionId));
    state.reviews = Object.fromEntries(
      Object.entries(state.reviews).filter(([objective]) => !bankObjectives.has(objective)),
    );
    saveState();
    renderDashboard();
    showToast(`${config.title} bank reset. All ${paper.replace("paper-", "Paper ")} questions are available again.`);
    return;
  }

  const boardTrigger = event.target.closest("[data-start-board-exam]");
  if (boardTrigger) {
    event.preventDefault();
    const paper = boardTrigger.dataset.startBoardExam;
    const config = BOARD_EXAMS[paper];
    if (!config) return;
    const queue = getBoardExamQueue(paper);
    if (queue.length !== BOARD_EXAM_QUESTION_COUNT) {
      showToast(`Fewer than ${BOARD_EXAM_QUESTION_COUNT} unseen questions remain. Reset ${config.title} first.`);
      return;
    }
    sessionMode = "board";
    examPaper = paper;
    clearInterval(examTimer);
    sessionQueue = queue;
    sessionIndex = 0;
    sessionResults = [];
    sessionEndReason = "complete";
    examTimerDisplay.classList.remove("urgent");
    examDeadline = Date.now() + BOARD_EXAM_MINUTES * 60 * 1000;
    examTimer = setInterval(updateExamTimer, 1000);
    openQuestion();
    updateExamTimer();
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
  if (isBoardSession()) {
    clearInterval(examTimer);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.target.matches("input, textarea, select")) {
    event.preventDefault();
    searchInput.focus();
  }
});
