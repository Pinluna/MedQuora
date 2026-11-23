const questions = [
  {
    id: "first-pass",
    objective: "first-pass-metabolism",
    course: "pharm",
    topic: "Pharmacology · Absorption",
    prompt: "Which route most directly avoids hepatic first-pass metabolism?",
    options: [
      ["oral", "Oral"],
      ["sublingual", "Sublingual"],
      ["rectal", "Rectal"],
      ["swallowed", "Swallowed capsule"],
    ],
    answer: "sublingual",
    explanation: "Sublingual absorption enters systemic circulation through the oral mucosa, bypassing initial passage through the portal circulation and liver.",
    rationales: {
      oral: "Most absorbed oral drugs pass through the portal circulation before reaching systemic circulation.",
      rectal: "Rectal absorption may partially avoid first-pass metabolism, but it does not avoid it as directly or consistently as sublingual absorption.",
      swallowed: "A swallowed capsule is absorbed through the gastrointestinal tract and commonly passes through portal blood before systemic circulation.",
    },
  },
  {
    id: "glomerular-filtration",
    objective: "glomerular-filtration",
    course: "physiology",
    topic: "Physiology · Renal",
    prompt: "In a nephron, where does filtration of blood plasma into the renal tubule begin?",
    options: [
      ["collecting-duct", "Collecting duct"],
      ["loop", "Loop of Henle"],
      ["glomerulus", "Glomerulus into Bowman's space"],
      ["distal-tubule", "Distal convoluted tubule"],
    ],
    answer: "glomerulus",
    explanation: "Filtration occurs across the glomerular capillaries into Bowman's space, the beginning of the nephron's tubular pathway.",
    rationales: {
      "collecting-duct": "The collecting duct receives tubular fluid later; it is not the site where plasma filtration begins.",
      loop: "The loop of Henle modifies tubular fluid after it has passed through the proximal tubule.",
      "distal-tubule": "The distal convoluted tubule is downstream from the filtration barrier.",
    },
  },
  {
    id: "neuron-depolarization",
    objective: "neuronal-depolarization",
    course: "physiology",
    topic: "Physiology · Neurobiology",
    prompt: "During the rising phase of a typical neuronal action potential, which event most directly causes rapid depolarization?",
    options: [
      ["sodium-in", "Voltage-gated sodium channels open and sodium enters"],
      ["potassium-in", "Potassium enters through voltage-gated potassium channels"],
      ["chloride-out", "Chloride leaves through ligand-gated channels"],
      ["pump", "The sodium-potassium pump rapidly reverses its transport"],
    ],
    answer: "sodium-in",
    explanation: "Opening of voltage-gated sodium channels allows sodium influx, driving the rapid rising phase of a typical neuronal action potential.",
    rationales: {
      "potassium-in": "Potassium efflux is more closely associated with repolarization, not the rapid rising phase.",
      "chloride-out": "Chloride movement is not the primary mechanism of the typical action-potential upstroke.",
      pump: "The sodium-potassium pump maintains ion gradients over time; it does not produce the rapid action-potential upstroke.",
    },
  },
  {
    id: "cardiac-output",
    objective: "cardiac-output",
    course: "clinical",
    topic: "Clinical reasoning · Cardiovascular",
    prompt: "If stroke volume remains constant while heart rate increases, what happens to cardiac output?",
    options: [
      ["decreases", "It decreases"],
      ["unchanged", "It stays the same"],
      ["increases", "It increases"],
      ["unrelated", "It cannot be related to heart rate"],
    ],
    answer: "increases",
    explanation: "Cardiac output equals heart rate multiplied by stroke volume. With stroke volume held constant, increasing heart rate increases cardiac output.",
    rationales: {
      decreases: "With stroke volume unchanged, a higher heart rate raises rather than lowers the product.",
      unchanged: "This would only follow if another factor changed enough to offset the higher heart rate; the question holds stroke volume constant.",
      unrelated: "Heart rate is one of the two factors in the basic cardiac-output relationship.",
    },
  },
  {
    id: "resistance-selection",
    objective: "antimicrobial-selection",
    course: "clinical",
    topic: "Clinical reasoning · Microbiology",
    prompt: "A bacterial population contains a few organisms with a heritable trait that reduces susceptibility to an antimicrobial. After exposure, the susceptible organisms decline while the trait-bearing organisms become more common. What best explains this change?",
    options: [
      ["patient-adapts", "The patient's body became resistant to the antimicrobial"],
      ["selection", "Exposure selected for organisms with the heritable trait"],
      ["bacteria-intended", "The bacteria intentionally changed to survive"],
      ["no-change", "The antimicrobial created no change in the population"],
    ],
    answer: "selection",
    explanation: "Resistance is a property of microorganisms. Exposure can select for pre-existing or newly arising heritable traits that allow some organisms to survive and reproduce.",
    rationales: {
      "patient-adapts": "The organisms—not the patient—are described as having reduced susceptibility.",
      "bacteria-intended": "Natural selection does not require organisms to intentionally change; heritable variation and differential survival are sufficient.",
      "no-change": "The scenario describes a change in the population's composition after exposure.",
    },
  },
  {
    id: "evidence-interpretation",
    objective: "association-causation",
    course: "evidence",
    topic: "Evidence & study skills · Research",
    prompt: "A study reports an association between two variables. Which conclusion is most appropriately supported by that statement alone?",
    options: [
      ["causation", "One variable caused the other"],
      ["association", "The variables were observed to vary together in this study"],
      ["universal", "The relationship will occur in every population"],
      ["no-uncertainty", "The result is free from uncertainty"],
    ],
    answer: "association",
    explanation: "An observed association does not, by itself, establish causation, universal generalizability, or certainty. Study design and other evidence matter.",
    rationales: {
      causation: "Association alone does not establish a causal relationship.",
      universal: "A study's findings may not generalize to every population or setting.",
      "no-uncertainty": "Research estimates have uncertainty, and study limitations should be considered.",
    },
  },
  {
    id: "first-pass-route-case",
    objective: "first-pass-metabolism",
    course: "pharm",
    topic: "Pharmacology · Absorption",
    prompt: "A medication is absorbed through the oral mucosa directly into systemic venous blood. Which process is it most likely to avoid on its initial passage?",
    options: [
      ["renal-excretion", "Renal excretion"],
      ["first-pass", "Hepatic first-pass metabolism"],
      ["protein-binding", "Plasma protein binding"],
      ["distribution", "Distribution into tissues"],
    ],
    answer: "first-pass",
    explanation: "Absorption through the oral mucosa into systemic circulation avoids initial portal delivery to the liver, and therefore avoids hepatic first-pass metabolism on that initial passage.",
    rationales: {
      "renal-excretion": "Renal excretion occurs later and is not the process asked about.",
      "protein-binding": "The route does not eliminate binding to plasma proteins.",
      distribution: "The drug may still distribute into tissues after reaching systemic circulation.",
    },
  },
  {
    id: "glomerular-filtration-case",
    objective: "glomerular-filtration",
    course: "physiology",
    topic: "Physiology · Renal",
    prompt: "Fluid filtered from glomerular capillaries first enters which space before moving into the proximal tubule?",
    options: [
      ["bowmans-space", "Bowman's space"],
      ["renal-pelvis", "Renal pelvis"],
      ["distal-tubule", "Distal convoluted tubule"],
      ["collecting-duct", "Collecting duct"],
    ],
    answer: "bowmans-space",
    explanation: "Filtrate crosses the glomerular filtration barrier into Bowman's space, which is continuous with the proximal tubule.",
    rationales: {
      "renal-pelvis": "The renal pelvis receives urine much later, after it passes through the collecting system.",
      "distal-tubule": "The distal tubule is downstream from the proximal tubule.",
      "collecting-duct": "The collecting duct receives tubular fluid after it has passed through earlier nephron segments.",
    },
  },
  {
    id: "neuron-depolarization-case",
    objective: "neuronal-depolarization",
    course: "physiology",
    topic: "Physiology · Neurobiology",
    prompt: "A neuronal membrane reaches threshold and its voltage rapidly becomes less negative. Which change most directly initiates this rising phase?",
    options: [
      ["sodium-open", "Voltage-gated sodium channels open, allowing sodium influx"],
      ["potassium-open", "Voltage-gated potassium channels open, driving potassium influx"],
      ["pump-fast", "The sodium-potassium pump rapidly reverses direction"],
      ["chloride-in", "Chloride enters through voltage-gated channels"],
    ],
    answer: "sodium-open",
    explanation: "At threshold, voltage-gated sodium channels open and sodium influx drives the rapid depolarizing upstroke.",
    rationales: {
      "potassium-open": "Potassium movement is mainly associated with later repolarization, and potassium typically exits the cell.",
      "pump-fast": "The sodium-potassium pump maintains concentration gradients but does not produce the rapid upstroke.",
      "chloride-in": "Chloride influx is not the usual mechanism for the rising phase of a neuronal action potential.",
    },
  },
  {
    id: "cardiac-output-case",
    objective: "cardiac-output",
    course: "clinical",
    topic: "Clinical reasoning · Cardiovascular",
    prompt: "A person has a heart rate of 75 beats per minute and a stroke volume of 70 mL per beat. What is the cardiac output?",
    options: [
      ["145", "145 mL/min"],
      ["5250", "5,250 mL/min"],
      ["70", "70 mL/min"],
      ["750", "750 mL/min"],
    ],
    answer: "5250",
    explanation: "Cardiac output is heart rate multiplied by stroke volume: 75 beats/min × 70 mL/beat = 5,250 mL/min.",
    rationales: {
      "145": "Adding heart rate and stroke volume does not calculate cardiac output.",
      "70": "This is the stroke volume, not the volume pumped each minute.",
      "750": "This result does not follow from multiplying the provided heart rate by stroke volume.",
    },
  },
  {
    id: "resistance-selection-case",
    objective: "antimicrobial-selection",
    course: "clinical",
    topic: "Clinical reasoning · Microbiology",
    prompt: "After an antimicrobial exposure, a population has a larger proportion of organisms carrying a resistance trait that was already present in some members. What is the best explanation?",
    options: [
      ["selection-pressure", "Susceptible organisms were reduced, changing the population proportions"],
      ["patient-resistance", "The patient acquired resistance to the antimicrobial"],
      ["directed-change", "All bacteria intentionally changed in response to exposure"],
      ["no-selection", "The relative frequency of traits cannot change after exposure"],
    ],
    answer: "selection-pressure",
    explanation: "Differential survival and reproduction can increase the proportion of organisms with a heritable resistance trait; this is selection, not an intentional change by individual bacteria.",
    rationales: {
      "patient-resistance": "The described trait belongs to the microorganisms, not the patient.",
      "directed-change": "Selection acts on heritable variation; it does not require intentional change.",
      "no-selection": "The scenario describes a change in the population's composition.",
    },
  },
  {
    id: "evidence-interpretation-case",
    objective: "association-causation",
    course: "evidence",
    topic: "Evidence & study skills · Research",
    prompt: "In an observational study, higher levels of a biomarker are associated with a condition. Which interpretation is best supported by that finding alone?",
    options: [
      ["proves-cause", "The biomarker causes the condition"],
      ["observed-link", "The biomarker and condition varied together in the study"],
      ["always-true", "The relationship must hold in every population"],
      ["no-confounding", "Confounding has been ruled out"],
    ],
    answer: "observed-link",
    explanation: "An observed association describes a relationship in the study. On its own, it does not establish causation, rule out confounding, or prove that the finding generalizes.",
    rationales: {
      "proves-cause": "An observational association alone does not establish causation.",
      "always-true": "Study findings may not generalize to every population or setting.",
      "no-confounding": "The association alone does not establish that confounding was ruled out.",
    },
  },
];

const courses = [
  {
    key: "pharm",
    title: "Foundations of pharmacology",
    description: "Core mechanisms and foundational principles.",
    category: "CORE CONCEPTS",
    art: "pharm",
    symbol: "⌁",
  },
  {
    key: "physiology",
    title: "Human physiology",
    description: "Connect normal function with core mechanisms.",
    category: "FOUNDATIONS",
    art: "calcs",
    symbol: "∿",
  },
  {
    key: "clinical",
    title: "Clinical reasoning",
    description: "Interpret concepts and explain your thinking.",
    category: "CASE THINKING",
    art: "care",
    symbol: "✳",
  },
  {
    key: "evidence",
    title: "Evidence & study skills",
    description: "Read claims carefully and learn from feedback.",
    category: "TRANSFERABLE",
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
const confidenceFieldset = document.querySelector("#confidence-fieldset");
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
    .map((review) => questions.find((question) =>
      question.objective === review.objective && question.id !== review.lastQuestionId,
    ))
    .filter(Boolean);
}

function getWeakQuestionOrder(source = questions) {
  const sorted = [...source].sort((a, b) => {
    const aLast = getLastAttempt(a.id);
    const bLast = getLastAttempt(b.id);
    if (!aLast && bLast) return -1;
    if (aLast && !bLast) return 1;
    if (!aLast && !bLast) return a.id.localeCompare(b.id);
    const aScore = aLast.correct ? (aLast.confidence === "high" ? 2 : 1) : 0;
    const bScore = bLast.correct ? (bLast.confidence === "high" ? 2 : 1) : 0;
    return aScore - bScore || new Date(aLast.at) - new Date(bLast.at);
  });
  const seenObjectives = new Set();
  return sorted.filter((question) => {
    if (seenObjectives.has(question.objective)) return false;
    seenObjectives.add(question.objective);
    return true;
  });
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
      ? Math.round(practiced.reduce((sum, attempt) => sum + (attempt.correct ? (attempt.confidence === "high" ? 100 : 75) : 25), 0) / practiced.length)
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
  document.querySelector("#question-count").textContent = `${String(sessionIndex + 1).padStart(2, "0")} / ${String(sessionQueue.length).padStart(2, "0")}`;
  document.querySelector("#question-topic").textContent = question.topic;
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
  confidenceFieldset.disabled = false;
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

function startSession(mode = "focused", courseKey = null) {
  let candidates = courseKey
    ? questions.filter((question) => question.course === courseKey)
    : mode === "due"
      ? getDueQuestions()
      : questions;

  if (mode === "due" && candidates.length === 0) {
    showToast("Nothing is due yet. Starting a fresh practice session.");
    candidates = questions;
  }
  if (!candidates.length) {
    showToast("No questions are available in this learning path yet.");
    return;
  }
  sessionQueue = getWeakQuestionOrder(candidates).slice(0, Math.min(5, candidates.length));
  sessionIndex = 0;
  openQuestion();
}

function explainConfidence(confidence) {
  if (confidence === "high") return "high";
  if (confidence === "medium") return "medium";
  return "low";
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
  confidenceFieldset.disabled = true;

  if (!correct) {
    reflectionFieldset.hidden = false;
    submitAnswer.innerHTML = `Save reflection <span>→</span>`;
    submitAnswer.disabled = true;
  } else {
    submitAnswer.innerHTML = sessionIndex === sessionQueue.length - 1
      ? `Finish session <span>→</span>`
      : `Save & continue <span>→</span>`;
  }
}

function scheduleReview(question, correct, confidence) {
  const previous = state.reviews[question.objective];
  const nextInterval = correct
    ? Math.min(21, Math.max(2, (previous?.intervalDays || 1) * (confidence === "high" ? 2 : 1.5)))
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
  const confidence = answerForm.querySelector('input[name="confidence"]:checked')?.value;
  const selected = answerForm.querySelector('input[name="answer"]:checked');
  const reflection = answerForm.querySelector('input[name="reflection"]:checked')?.value || null;
  if (!confidence || !selected || (!answered && !selected)) {
    showToast("Choose an answer and confidence level before continuing.");
    return false;
  }
  if (!answered) {
    showToast("Check your answer before saving the attempt.");
    return false;
  }
  if (selected.value !== currentQuestion.answer && !reflection) {
    showToast("Choose what made the question difficult to get targeted feedback.");
    return false;
  }

  const correct = selected.value === currentQuestion.answer;
  state.attempts.push({
    questionId: currentQuestion.id,
    at: new Date().toISOString(),
    correct,
    confidence: explainConfidence(confidence),
    reflection,
  });
  scheduleReview(currentQuestion, correct, confidence);
  saveState();
  renderDashboard();
  return correct;
}

function finishCurrentQuestion() {
  const correct = saveCurrentAttempt();
  if (correct === false && !answered) return;
  if (answered && currentQuestion && answerForm.querySelector('input[name="answer"]:checked')?.value !== currentQuestion.answer &&
      !answerForm.querySelector('input[name="reflection"]:checked')) return;

  sessionIndex += 1;
  if (sessionIndex < sessionQueue.length) {
    openQuestion();
    return;
  }
  const savedCorrect = state.attempts.slice(-sessionQueue.length).filter((attempt) => attempt.correct).length;
  practiceDialog.close("complete");
  showToast(`Session saved: ${savedCorrect} of ${sessionQueue.length} correct. Your next reviews are scheduled.`);
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
    const confidence = answerForm.querySelector('input[name="confidence"]:checked');
    if (!selected || !confidence) {
      showToast("Choose an answer and confidence level first.");
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

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.target.matches("input, textarea, select")) {
    event.preventDefault();
    searchInput.focus();
  }
});
