
const form = document.querySelector("#calculator");
const ageInput = document.querySelector("#age");
const currentInput = document.querySelector("#current");
const results = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
const serverError = document.querySelector("#server-error");
const calculateButton = document.querySelector("#calculate-btn");

const historyList = document.querySelector("#history-list");
const historyEmptyState = document.querySelector("#history-empty-state");
const clearHistoryButton = document.querySelector("#clear-history-btn");

const HISTORY_STORAGE_KEY = "heart-rate-calculation-history";

const classificationLabels = {
  "below-zone": "Below Estimated Exercise Zones",
  moderate: "Moderate Intensity",
  vigorous: "Vigorous Intensity",
  "above-zone": "Above Estimated Exercise Zones"
};

function showError(input, message) {
  const error = document.querySelector(`#${input.id}-error`);
  error.textContent = message;
  error.hidden = false;
  input.setAttribute("aria-invalid", "true");
}

function clearErrors() {
  for (const input of [ageInput, currentInput]) {
    const error = document.querySelector(`#${input.id}-error`);
    error.textContent = "";
    error.hidden = true;
    input.removeAttribute("aria-invalid");
  }

  serverError.textContent = "";
  serverError.hidden = true;
}

function formatBpm(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(value);
}

// =================================================
// Sprint 2 - Load Saved Calculation History
// =================================================

function getCalculationHistory() {
  try {
    const storedHistory = window.localStorage.getItem(
      HISTORY_STORAGE_KEY
    );

    if (!storedHistory) {
      return [];
    }

    const history = JSON.parse(storedHistory);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error("Unable to load calculation history.", error);
    return [];
  }
}

// =================================================
// Sprint 2 - Display Calculation History
// =================================================

function renderCalculationHistory() {
  const history = getCalculationHistory();

  historyList.replaceChildren();
  historyEmptyState.hidden = history.length > 0;
  clearHistoryButton.disabled = history.length === 0;

  for (const calculation of history) {
    const item = document.createElement("li");
    const details = document.createElement("div");
    const summary = document.createElement("strong");
    const currentBpm = document.createElement("span");
    const classification = document.createElement("span");

    summary.textContent = `Age ${calculation.age} — Maximum ${formatBpm(
      calculation.maximumHeartRate
    )} BPM`;

    currentBpm.textContent =
      calculation.currentBpm === null
        ? "Current BPM: Not provided"
        : `Current BPM: ${formatBpm(calculation.currentBpm)}`;

    classification.textContent = `Classification: ${
      classificationLabels[calculation.classification] || "Not available"
    }`;

    details.append(summary, currentBpm, classification);
    item.append(details);
    historyList.append(item);
  }
}

// =================================================
// Sprint 2 - Save Calculation History
// =================================================

function saveCalculationHistory(age, data) {
  const calculation = {
    age: Number(age),
    currentBpm: data.currentHeartRate,
    maximumHeartRate: data.result,
    classification: data.classification
  };

  try {
    const history = getCalculationHistory();
    history.push(calculation);

    window.localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(history)
    );

    renderCalculationHistory();
  } catch (error) {
    console.error("Unable to save calculation history.", error);
    serverError.textContent =
      "Calculation completed, but the result could not be saved locally.";
    serverError.hidden = false;
  }
}

// =================================================
// Sprint 2 - Display Results
// =================================================

function displayResults(data) {
  document.querySelector("#maximum-value").textContent =
    formatBpm(data.result);

  document.querySelector("#moderate-value").textContent =
    `${formatBpm(data.moderateZone.min)}–${formatBpm(data.moderateZone.max)} BPM`;

  document.querySelector("#vigorous-value").textContent =
    `${formatBpm(data.vigorousZone.min)}–${formatBpm(data.vigorousZone.max)} BPM`;

  const currentReading = document.querySelector("#current-reading");

  if (data.currentHeartRate !== null) {
    document.querySelector("#current-value").textContent =
      `${formatBpm(data.currentHeartRate)} BPM`;

    currentReading.hidden = false;
  } else {
    currentReading.hidden = true;
  }

  // =================================================
  // Giovanni Matos (GMat97) - Sprint 2
  // Issue #26 - Classify Current Heart Rate
  // Issue #27 - Generate Heart Rate Feedback
  // =================================================

  const classificationReading =
    document.querySelector("#classification-reading");

  const classificationValue =
    document.querySelector("#classification-value");

  const classificationFeedback =
    document.querySelector("#classification-feedback");

  if (
    data.classification &&
    Object.prototype.hasOwnProperty.call(
      classificationLabels,
      data.classification
    )
  ) {
    classificationValue.textContent =
      classificationLabels[data.classification];

    classificationFeedback.textContent =
      data.feedback || "";

    classificationReading.hidden = false;
  } else {
    classificationValue.textContent = "--";
    classificationFeedback.textContent = "";
    classificationReading.hidden = true;
  }

  emptyState.hidden = true;
  results.hidden = false;
}

// =================================================
// Calculator Form Submission
// =================================================

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const age = ageInput.value.trim();
  const current = currentInput.value.trim();

  results.hidden = true;
  emptyState.hidden = false;

  if (age === "") {
    showError(ageInput, "Please enter your age.");
    ageInput.focus();
    return;
  }

  if (!/^\d+$/.test(age) || Number(age) < 1 || Number(age) > 120) {
    showError(
      ageInput,
      "Please enter a valid age between 1 and 120."
    );
    ageInput.focus();
    return;
  }

  if (
    current !== "" &&
    (!/^\d+$/.test(current) ||
      Number(current) < 1 ||
      Number(current) > 300)
  ) {
    showError(
      currentInput,
      "Please enter a valid current heart rate between 1 and 300 BPM."
    );
    currentInput.focus();
    return;
  }

  calculateButton.disabled = true;
  calculateButton.textContent = "Calculating...";

  try {
    const params = new URLSearchParams({ age });

    if (current !== "") {
      params.set("current", current);
    }

    const response = await fetch(
      `/api/calculate?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      serverError.textContent =
        data.error || "Unable to calculate heart rate.";
      serverError.hidden = false;
      return;
    }

    displayResults(data);
    saveCalculationHistory(age, data);
  } catch (error) {
    serverError.textContent =
      "Unable to connect to the calculator. Please try again.";
    serverError.hidden = false;
  } finally {
    calculateButton.disabled = false;
    calculateButton.textContent = "Calculate";
  }
});

// =================================================
// Clear Current Calculator Form
// =================================================

document.querySelector("#clear-btn").addEventListener("click", () => {
  form.reset();
  clearErrors();
  results.hidden = true;
  emptyState.hidden = false;
  ageInput.focus();
});

// =================================================
// Sprint 2 - Issue #30
// Clear Saved Calculation History
// =================================================

clearHistoryButton.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete all saved calculations?"
  );

  if (!confirmed) {
    return;
  }

  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    renderCalculationHistory();
  } catch (error) {
    console.error("Unable to clear calculation history.", error);
    serverError.textContent =
      "Unable to clear saved calculation history.";
    serverError.hidden = false;
  }
});

// Load saved calculations when the page opens.
renderCalculationHistory();
