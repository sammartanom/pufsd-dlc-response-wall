const prompts = [
  "We believe Pleasantville students are best served when technology…",
  "The line between helpful and harmful technology use is crossed when…",
  "By June 2027, we will know that we have succeeded if…"
];

const form = document.getElementById("response-form");
const submitButton = document.getElementById("submit-button");
const formMessage = document.getElementById("form-message");

const responseGrid = document.getElementById("response-grid");
const responseCount = document.getElementById("response-count");
const loading = document.getElementById("loading");
const empty = document.getElementById("empty");

const viewButtons = [...document.querySelectorAll(".view-button")];

const focusControls = document.getElementById("focus-controls");
const focusPrevious = document.getElementById("focus-prev");
const focusNext = document.getElementById("focus-next");
const focusPosition = document.getElementById("focus-position");

const textareas = [...document.querySelectorAll("textarea[maxlength]")];

let responses = [];
let currentView = "themes";
let focusIndex = 0;

/* ---------------------------------------------------------
   Character counters
--------------------------------------------------------- */

textareas.forEach((textarea) => {
  const output = document.querySelector(
    `[data-count-for="${textarea.id}"]`
  );

  if (!output) return;

  const updateCount = () => {
    output.textContent = textarea.value.length;
  };

  textarea.addEventListener("input", updateCount);
  updateCount();
});

/* ---------------------------------------------------------
   Safety
--------------------------------------------------------- */

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------------------------------------------------
   Normalize API response
--------------------------------------------------------- */

function normalizeResponses(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.responses)) {
    return data.responses;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

/* ---------------------------------------------------------
   Load responses
--------------------------------------------------------- */

async function loadResponses() {
  loading.hidden = false;
  empty.hidden = true;

  try {
    const request = await fetch("/api/responses", {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!request.ok) {
      throw new Error(`Unable to load responses (${request.status})`);
    }

    const data = await request.json();

    responses = normalizeResponses(data);

    if (focusIndex >= responses.length) {
      focusIndex = Math.max(0, responses.length - 1);
    }

    renderResponses();
  } catch (error) {
    console.error(error);

    loading.textContent = "Unable to load responses.";
    loading.hidden = false;

    responseCount.textContent = "";
    responseGrid.replaceChildren();
    focusControls.hidden = true;
  }
}

/* ---------------------------------------------------------
   Main render
--------------------------------------------------------- */

function renderResponses() {
  loading.hidden = true;

  responseGrid.replaceChildren();

  const total = responses.length;

  responseCount.textContent =
    total === 1
      ? "1 response"
      : `${total} responses`;

  if (total === 0) {
    empty.hidden = false;
    focusControls.hidden = true;
    return;
  }

  empty.hidden = true;

  if (currentView === "themes") {
    renderThemes();
  } else if (currentView === "people") {
    renderPeople();
  } else {
    renderFocus();
  }
}

/* ---------------------------------------------------------
   By Prompt
--------------------------------------------------------- */

function renderThemes() {
  responseGrid.className = "themes-view";
  focusControls.hidden = true;

  const keys = [
    "response_1",
    "response_2",
    "response_3"
  ];

  prompts.forEach((prompt, promptIndex) => {
    const column = document.createElement("section");
    column.className = "theme-column";

    const heading = document.createElement("div");
    heading.className = "theme-heading";
    heading.textContent = prompt;

    column.appendChild(heading);

    responses.forEach((response) => {
      const value = response[keys[promptIndex]];

      if (!value) return;

      const answer = document.createElement("div");
      answer.className = "theme-answer";
      answer.textContent = value;

      column.appendChild(answer);
    });

    responseGrid.appendChild(column);
  });
}

/* ---------------------------------------------------------
   Individual response card
--------------------------------------------------------- */

function createResponseCard(response, index, focus = false) {
  const card = document.createElement("article");

  card.className = focus
    ? "response-card focus-card"
    : "response-card";

  const header = document.createElement("div");
  header.className = "card-top";

  const label = document.createElement("span");
  label.className = "card-label";
  label.textContent = `Response ${index + 1}`;

  header.appendChild(label);
  card.appendChild(header);

  const answers = [
    response.response_1,
    response.response_2,
    response.response_3
  ];

  answers.forEach((text, promptIndex) => {
    const answer = document.createElement("div");
    answer.className = "answer";

    const promptText = document.createElement("p");
    promptText.className = "answer-prompt";
    promptText.textContent = prompts[promptIndex];

    const answerText = document.createElement("p");
    answerText.className = "answer-text";
    answerText.textContent = text || "";

    answer.appendChild(promptText);
    answer.appendChild(answerText);

    card.appendChild(answer);
  });

  return card;
}

/* ---------------------------------------------------------
   By Response
--------------------------------------------------------- */

function renderPeople() {
  responseGrid.className = "people-view";
  focusControls.hidden = true;

  responses.forEach((response, index) => {
    responseGrid.appendChild(
      createResponseCard(response, index)
    );
  });
}

/* ---------------------------------------------------------
   Focus
--------------------------------------------------------- */

function renderFocus() {
  responseGrid.className = "focus-view";

  if (!responses.length) {
    focusControls.hidden = true;
    return;
  }

  if (focusIndex < 0) {
    focusIndex = responses.length - 1;
  }

  if (focusIndex >= responses.length) {
    focusIndex = 0;
  }

  responseGrid.appendChild(
    createResponseCard(
      responses[focusIndex],
      focusIndex,
      true
    )
  );

  focusPosition.textContent =
    `${focusIndex + 1} / ${responses.length}`;

  focusControls.hidden = false;

  focusPrevious.disabled = responses.length <= 1;
  focusNext.disabled = responses.length <= 1;
}

/* ---------------------------------------------------------
   View switching
--------------------------------------------------------- */

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentView = button.dataset.view;

    viewButtons.forEach((item) => {
      const active = item === button;

      item.classList.toggle("active", active);
      item.setAttribute(
        "aria-selected",
        active ? "true" : "false"
      );
    });

    renderResponses();
  });
});

/* ---------------------------------------------------------
   Focus navigation
--------------------------------------------------------- */

focusPrevious.addEventListener("click", () => {
  if (!responses.length) return;

  focusIndex =
    (focusIndex - 1 + responses.length) %
    responses.length;

  renderFocus();
});

focusNext.addEventListener("click", () => {
  if (!responses.length) return;

  focusIndex =
    (focusIndex + 1) %
    responses.length;

  renderFocus();
});

/* ---------------------------------------------------------
   Keyboard navigation in Focus view
--------------------------------------------------------- */

document.addEventListener("keydown", (event) => {
  if (currentView !== "focus") return;
  if (!responses.length) return;

  if (event.key === "ArrowLeft") {
    focusPrevious.click();
  }

  if (event.key === "ArrowRight") {
    focusNext.click();
  }
});

/* ---------------------------------------------------------
   Submit
--------------------------------------------------------- */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  formMessage.textContent = "";
  formMessage.className = "";

  const response1 =
    document.getElementById("response1").value.trim();

  const response2 =
    document.getElementById("response2").value.trim();

  const response3 =
    document.getElementById("response3").value.trim();

  const website =
    document.getElementById("website").value.trim();

  if (!response1 || !response2 || !response3) {
    formMessage.textContent =
      "Please complete all three responses.";

    formMessage.className = "error";
    return;
  }

  submitButton.disabled = true;

  const originalButtonText =
    submitButton.querySelector("span")?.textContent ||
    "Submit responses";

  const buttonLabel =
    submitButton.querySelector("span");

  if (buttonLabel) {
    buttonLabel.textContent = "Submitting…";
  }

  try {
    const request = await fetch("/api/responses", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },

      body: JSON.stringify({
        response1,
        response2,
        response3,
        website
      })
    });

    if (!request.ok) {
      let message = "Unable to submit responses.";

      try {
        const result = await request.json();

        if (result?.error) {
          message = result.error;
        } else if (result?.message) {
          message = result.message;
        }
      } catch {
        /* Use default message */
      }

      throw new Error(message);
    }

    form.reset();

    textareas.forEach((textarea) => {
      const output = document.querySelector(
        `[data-count-for="${textarea.id}"]`
      );

      if (output) {
        output.textContent = "0";
      }
    });

    formMessage.textContent =
      "Responses submitted. Thank you.";

    formMessage.className = "success";

    await loadResponses();
  } catch (error) {
    console.error(error);

    formMessage.textContent =
      error.message ||
      "Unable to submit responses. Please try again.";

    formMessage.className = "error";
  } finally {
    submitButton.disabled = false;

    if (buttonLabel) {
      buttonLabel.textContent = originalButtonText;
    }
  }
});

/* ---------------------------------------------------------
   Initial load
--------------------------------------------------------- */

loadResponses();
