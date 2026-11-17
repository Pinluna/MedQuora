const courses = [
  {
    title: "Pharmacology essentials",
    description: "Mechanisms, interactions, and therapeutic use.",
    category: "CORE CONCEPTS",
    progress: 68,
    art: "pharm",
    symbol: "⌁",
  },
  {
    title: "Clinical calculations",
    description: "Build confidence with common calculation concepts.",
    category: "SKILLS",
    progress: 32,
    art: "calcs",
    symbol: "∑",
  },
  {
    title: "Patient care",
    description: "Practice thoughtful, evidence-based decisions.",
    category: "CASE STUDIES",
    progress: 12,
    art: "care",
    symbol: "✳",
  },
];

const courseList = document.querySelector("#course-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#course-search");
const practiceDialog = document.querySelector("#practice-dialog");
const answerForm = document.querySelector("#answer-form");
const answerOptions = document.querySelector("#answer-options");
const answerFeedback = document.querySelector("#answer-feedback");
const submitAnswer = document.querySelector("#submit-answer");
const toast = document.querySelector("#toast");
const sidebar = document.querySelector("#sidebar");
const menuButton = document.querySelector("#menu-button");
const scrim = document.querySelector("#scrim");

let answered = false;
let toastTimer;

function renderCourses(query = "") {
  const search = query.trim().toLowerCase();
  const matches = courses.filter((course) =>
    `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(search),
  );

  courseList.innerHTML = matches.map((course) => `
    <article class="course-card">
      <div class="course-art ${course.art}">
        <span class="course-art-mark" aria-hidden="true">${course.symbol}</span>
        <span class="course-tag">${course.category}</span>
      </div>
      <div class="course-body">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <div class="course-progress-row"><span>Path progress</span><strong>${course.progress}%</strong></div>
        <div class="course-progress" role="progressbar" aria-label="${course.title} progress" aria-valuenow="${course.progress}" aria-valuemin="0" aria-valuemax="100">
          <span style="width:${course.progress}%"></span>
        </div>
        <button class="course-open" type="button" data-course="${course.title}">Open learning path <span>→</span></button>
      </div>
    </article>
  `).join("");

  emptyState.hidden = matches.length > 0;
  courseList.hidden = matches.length === 0;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function openPractice(event) {
  event?.preventDefault();
  resetPractice();
  if (!practiceDialog.open) practiceDialog.showModal();
}

function resetPractice() {
  answered = false;
  answerForm.reset();
  answerFeedback.hidden = true;
  answerFeedback.textContent = "";
  answerFeedback.classList.remove("wrong");
  submitAnswer.textContent = "Check answer";
  submitAnswer.insertAdjacentHTML("beforeend", "<span>→</span>");
  answerOptions.querySelectorAll(".answer-option").forEach((option) => {
    option.classList.remove("correct", "incorrect");
    option.querySelector("input").disabled = false;
  });
}

renderCourses();
searchInput.addEventListener("input", () => renderCourses(searchInput.value));

document.addEventListener("click", (event) => {
  const practiceTrigger = event.target.closest("[data-open-practice]");
  if (practiceTrigger) {
    openPractice(event);
    setActiveNavigation("practice");
    closeSidebar();
    return;
  }

  const courseButton = event.target.closest("[data-course]");
  if (courseButton) {
    showToast(`${courseButton.dataset.course} is a sample learning path.`);
  }
});

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (answered) {
    practiceDialog.close("complete");
    return;
  }

  const selected = answerForm.querySelector('input[name="answer"]:checked');
  if (!selected) {
    answerFeedback.textContent = "Choose an answer to see the explanation.";
    answerFeedback.hidden = false;
    answerFeedback.classList.remove("wrong");
    return;
  }

  answered = true;
  const isCorrect = selected.value === "sublingual";
  answerOptions.querySelectorAll(".answer-option").forEach((option) => {
    const input = option.querySelector("input");
    input.disabled = true;
    if (input.value === "sublingual") option.classList.add("correct");
    if (input.checked && !isCorrect) option.classList.add("incorrect");
  });

  answerFeedback.textContent = isCorrect
    ? "Correct. Sublingual absorption enters systemic circulation through the oral mucosa, bypassing hepatic first-pass metabolism."
    : "Not quite. Sublingual absorption enters systemic circulation through the oral mucosa, bypassing hepatic first-pass metabolism.";
  answerFeedback.hidden = false;
  answerFeedback.classList.toggle("wrong", !isCorrect);
  submitAnswer.textContent = "Finish review";
  submitAnswer.insertAdjacentHTML("beforeend", "<span>→</span>");
});

practiceDialog.addEventListener("close", () => {
  if (practiceDialog.returnValue === "complete") {
    showToast("Nice work. Your study session is complete.");
  }
  resetPractice();
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (event) => {
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
  if (event.key === "/" && !event.target.matches("input, textarea")) {
    event.preventDefault();
    searchInput.focus();
  }
});
