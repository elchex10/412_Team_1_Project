
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

// =================================================
// Sprint 3 - Issue #36: Copy Heart Rate Results
// =================================================

const copyResultsButton = document.querySelector("#copy-results-btn");
const copyStatus = document.querySelector("#copy-status");
let latestCalculation = null;

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
  copyStatus.textContent = "";
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
// Sprint 3 - Issue #36: Format Results for Copying
// =================================================

// Convert calculation results into readable text.
function formatResultsForCopy(age, data) {
  const lines = [
    "Heart Rate Calculator Results",
    `Age: ${age}`,
    `Estimated Maximum Heart Rate: ${formatBpm(data.result)} BPM`,
    `Moderate Intensity (50-70%): ${formatBpm(data.moderateZone.min)}-${formatBpm(data.moderateZone.max)} BPM`,
    `Vigorous Intensity (70-85%): ${formatBpm(data.vigorousZone.min)}-${formatBpm(data.vigorousZone.max)} BPM`
  ];

  // Include the current heart rate if the user entered one.
  if (
    data.currentHeartRate !== null &&
    data.currentHeartRate !== undefined
  ) {
    lines.push(
      `Current Heart Rate: ${formatBpm(data.currentHeartRate)} BPM`
    );
  }

  // Include the classification and feedback when available.
  if (
    data.classification &&
    Object.prototype.hasOwnProperty.call(
      classificationLabels,
      data.classification
    )
  ) {
    lines.push(
      `Classification: ${classificationLabels[data.classification]}`
    );

    if (data.feedback) {
      lines.push(`Feedback: ${data.feedback}`);
    }
  }

  lines.push(
    "These calculations are estimates and are not medical advice."
  );

  return lines.join("\n");
}

// =================================================
// Sprint 3 - Issue #36: Copy Results Button
// =================================================

copyResultsButton.addEventListener("click", async () => {
  // Prevent copying when no valid calculation is available.
  if (!latestCalculation || results.hidden) {
    return;
  }

  copyStatus.textContent = "";

  // Clipboard access requires HTTPS or a secure local environment.
  if (
    !navigator.clipboard ||
    typeof navigator.clipboard.writeText !== "function"
  ) {
    copyStatus.textContent =
      "Clipboard access is unavailable. Please use HTTPS or localhost.";
    return;
  }

  try {
    const text = formatResultsForCopy(
      latestCalculation.age,
      latestCalculation.data
    );

    // Copy the formatted results to the user's clipboard.
    await navigator.clipboard.writeText(text);

    // Display confirmation after copying succeeds.
    copyStatus.textContent = "Results copied to clipboard.";
  } catch (error) {
    console.error("Unable to copy results.", error);
    copyStatus.textContent =
      "Unable to copy results. Please check clipboard permissions.";
  }
});

// =================================================
// Calculator Form Submission
// =================================================

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const age = ageInput.value.trim();
  const current = currentInput.value.trim();

  // Clear previous results before starting a new calculation.
  latestCalculation = null;
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

    // Save the latest calculation for the Copy Results button.
    latestCalculation = { age, data };

    // Keep the existing calculation history functionality.
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

  // Remove any previously calculated results from the copy feature.
  latestCalculation = null;

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


// =================================================
// Giovanni Matos - Sprint 4: Interactive Heart Rate Dashboard
// Existing Sprint 1-3 functions remain unchanged.
// =================================================

const sprint4Insights = (() => {
  const panel = document.querySelector("#insights-panel");

  if (!panel) {
    return null;
  }

  const preview = document.querySelector("#insights-preview");
  const zoneProgress = document.querySelector("#zone-progress");
  const zoneMarker = document.querySelector("#zone-marker");
  const zoneVisualText = document.querySelector("#zone-visual-text");
  const gaugeVisual = document.querySelector("#gauge-visual");
  const gaugeRing = document.querySelector("#bpm-gauge");
  const gaugeCurrent = document.querySelector("#gauge-current");
  const gaugePercent = document.querySelector("#gauge-percent");
  const gaugeCaption = document.querySelector("#gauge-caption");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const colors = {
    "below-zone": "#627eaa",
    moderate: "#319b81",
    vigorous: "#3d75b3",
    "above-zone": "#d7617c"
  };

  let displayedData = null;
  let activeFrame = null;

  function stopAnimation() {
    if (activeFrame !== null) {
      window.cancelAnimationFrame(activeFrame);
      activeFrame = null;
    }
  }

  function resetVisualInsights() {
    stopAnimation();
    displayedData = null;

    zoneMarker.hidden = true;
    zoneProgress.hidden = true;

    zoneMarker.style.left = "0%";
    zoneProgress.style.width = "0%";

    zoneVisualText.textContent =
      "Enter a current heart rate to see its position on the zone bar.";

    gaugeVisual.hidden = true;

    gaugeRing.style.setProperty("--sprint4-percent", "0");

    gaugeCurrent.textContent = "0";
    gaugePercent.textContent = "0% of max";
    gaugeCaption.textContent = "";

    preview.textContent = "Explore your exercise zones";
  }

  function drawInsights() {
    stopAnimation();

    if (!displayedData) {
      return;
    }

    const data = displayedData;
    const max = Number(data.result);
    const bpm = data.currentHeartRate;

    const moderate =
      `${formatBpm(data.moderateZone.min)}–` +
      `${formatBpm(data.moderateZone.max)} BPM`;

    const vigorous =
      `${formatBpm(data.vigorousZone.min)}–` +
      `${formatBpm(data.vigorousZone.max)} BPM`;

    if (
      bpm === null ||
      bpm === undefined ||
      bpm === "" ||
      !Number.isFinite(Number(bpm)) ||
      !Number.isFinite(max) ||
      max <= 0
    ) {
      zoneMarker.hidden = true;
      zoneProgress.hidden = true;
      gaugeVisual.hidden = true;

      zoneVisualText.textContent =
        `Moderate: ${moderate}. Vigorous: ${vigorous}. ` +
        "Enter a measured current BPM to see the animated indicator and gauge.";

      preview.textContent = "Enter current BPM to view your gauge";
      return;
    }

    const current = Number(bpm);
    const actualPercent = (current / max) * 100;

    const cappedPercent = Math.max(
      0,
      Math.min(actualPercent, 100)
    );

    const color =
      colors[data.classification] || "#4176a5";

    const label =
      classificationLabels[data.classification] ||
      "Classification unavailable";

    preview.textContent =
      `${formatBpm(current)} BPM · ` +
      `${formatBpm(actualPercent)}% of max`;

    zoneVisualText.textContent =
      `${formatBpm(current)} BPM ` +
      `(${formatBpm(actualPercent)}% of estimated maximum). ` +
      `${label}. Moderate: ${moderate}. Vigorous: ${vigorous}.`;

    gaugeCaption.textContent =
      actualPercent > 100
        ? "The reading exceeds the estimated maximum. The display is capped at 100%."
        : "Your measured BPM relative to the estimated maximum; not a health score.";

    gaugeRing.setAttribute(
      "aria-label",
      `${formatBpm(current)} BPM, ` +
      `${formatBpm(actualPercent)} percent of estimated maximum`
    );

    zoneMarker.hidden = false;
    zoneProgress.hidden = false;
    gaugeVisual.hidden = false;

    zoneMarker.style.setProperty(
      "--sprint4-marker-color",
      color
    );

    gaugeRing.style.setProperty(
      "--sprint4-color",
      color
    );

    function update(progress) {
      const value = cappedPercent * progress;

      zoneMarker.style.left = `${value}%`;
      zoneProgress.style.width = `${value}%`;

      gaugeRing.style.setProperty(
        "--sprint4-percent",
        String(value)
      );

      gaugeCurrent.textContent = formatBpm(
        Math.round(current * progress)
      );

      gaugePercent.textContent =
        `${formatBpm(actualPercent * progress)}% of max`;
    }

    update(0);

    if (prefersReducedMotion.matches) {
      update(1);
      return;
    }

    let startedAt = null;

    function frame(now) {
      if (startedAt === null) {
        startedAt = now;
      }

      const elapsed = Math.min(
        (now - startedAt) / 850,
        1
      );

      const eased =
        1 - Math.pow(1 - elapsed, 3);

      update(eased);

      if (elapsed < 1) {
        activeFrame = window.requestAnimationFrame(frame);
      } else {
        activeFrame = null;
        update(1);
      }
    }

    activeFrame = window.requestAnimationFrame(frame);
  }

  // Observe the existing calculation results.
  // No changes to displayResults() are necessary.

  const resultsObserver = new MutationObserver(() => {
    if (results.hidden) {
      resetVisualInsights();
      return;
    }

    if (latestCalculation && latestCalculation.data) {
      displayedData = latestCalculation.data;

      if (panel.open) {
        drawInsights();
      } else {
        preview.textContent =
          "Open to explore your results";
      }
    }
  });

  resultsObserver.observe(results, {
    attributes: true,
    attributeFilter: ["hidden"]
  });

  // Reopen the panel to replay animations.
  panel.addEventListener("toggle", () => {
    if (!panel.open) {
      stopAnimation();
      return;
    }

    if (
      !results.hidden &&
      latestCalculation &&
      latestCalculation.data
    ) {
      displayedData = latestCalculation.data;
      drawInsights();
    }
  });

  resetVisualInsights();

  return {
    resetVisualInsights,
    drawInsights
  };
})();
