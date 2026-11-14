
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
    input.setAttribute("aria-invalid", "false");
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

    if (!Array.isArray(history)) {
      return [];
    }

    // Remove previously stored current heart-rate values.
    const sanitizedHistory = history.map((calculation) => ({
      ...calculation,
      currentBpm: null
    }));

    // Update existing browser storage if sensitive values were present.
    const containsCurrentBpm = history.some(
      (calculation) =>
        calculation && calculation.currentBpm != null
    );

    if (containsCurrentBpm) {
      window.localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(sanitizedHistory)
      );
    }

    return sanitizedHistory;
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
    currentBpm: null,
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
// Giovanni Matos - Sprint 4: Animated Heart Rate Dashboard
// Additive UI only. No existing calculations are changed.
// =================================================

(() => {
  const panel = document.querySelector("#s4-panel");
  if (!panel) return;

  const heart = document.querySelector("#s4-heart");
  const preview = document.querySelector("#s4-preview");
  const bpmValue = document.querySelector("#s4-bpm");
  const intensity = document.querySelector("#s4-intensity");
  const percentValue = document.querySelector("#s4-percent");
  const status = document.querySelector("#s4-energy-status");
  const meter = document.querySelector(".s4-meter");
  const fill = document.querySelector("#s4-fill");
  const pointer = document.querySelector("#s4-pointer");
  const burst = document.querySelector("#s4-burst");
  const note = document.querySelector("#s4-bar-note");
  const chips = document.querySelectorAll(".s4-zone-chip");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let lastData = null;
  let frameId = null;

  const zoneColors = {
    "below-zone": "#627eaa",
    moderate: "#319b81",
    vigorous: "#3d75b3",
    "above-zone": "#d7617c"
  };

  function cancelAnimation() {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
    }

    frameId = null;
    burst.classList.remove("s4-burst-on");
  }

  function resetDashboard() {
    cancelAnimation();
    lastData = null;

    panel.style.setProperty("--s4-beat", "1.2s");

    preview.textContent = "Explore your animated exercise zones";
    bpmValue.textContent = "--";
    intensity.textContent = "Your exercise intensity";
    percentValue.textContent = "Enter a current BPM to start";
    status.textContent = "Ready";

    fill.style.width = "0%";
    pointer.hidden = true;

    note.textContent =
      "Enter a measured heart rate to see the bar fill.";

    chips.forEach(chip => {
      chip.classList.remove("s4-active");
    });

    meter.setAttribute(
      "aria-label",
      "No heart rate entered"
    );
  }

  function setDashboardData(data) {
    cancelAnimation();
    lastData = data;

    const max = Number(data.result);
    const current = data.currentHeartRate;
    const bpm = Number(current);

    if (
      current === null ||
      current === undefined ||
      current === "" ||
      !Number.isFinite(bpm) ||
      !Number.isFinite(max) ||
      max <= 0
    ) {
      bpmValue.textContent = "--";
      intensity.textContent = "Estimated exercise zones";
      percentValue.textContent = "No current BPM provided";
      status.textContent = "Waiting for BPM";

      preview.textContent =
        "Enter your current BPM to animate the gauge";

      pointer.hidden = true;
      fill.style.width = "0%";

      chips.forEach(chip => {
        chip.classList.remove("s4-active");
      });

      note.textContent =
        "Moderate: " +
        formatBpm(data.moderateZone.min) +
        "–" +
        formatBpm(data.moderateZone.max) +
        " BPM. Vigorous: " +
        formatBpm(data.vigorousZone.min) +
        "–" +
        formatBpm(data.vigorousZone.max) +
        " BPM.";

      return;
    }

    const percent = (bpm / max) * 100;

    const label =
      classificationLabels[data.classification] ||
      "Estimated Exercise Intensity";

    const color =
      zoneColors[data.classification] || "#3d75b3";

    // A higher entered BPM makes the heart beat faster.
    const beatSeconds = Math.max(
      0.42,
      Math.min(1.7, 60 / bpm)
    );

    panel.style.setProperty(
      "--s4-beat",
      beatSeconds.toFixed(2) + "s"
    );

    panel.style.setProperty("--s4-accent", color);

    preview.textContent =
      formatBpm(bpm) +
      " BPM · " +
      formatBpm(percent) +
      "% of max";

    intensity.textContent = label;

    percentValue.textContent =
      formatBpm(percent) + "% of estimated maximum";

    status.textContent = label;

    note.textContent =
      percent > 100
        ? "Above 100% of estimated maximum; the visual bar stops at 100%."
        : "Animated fill represents your entered BPM as a percentage of estimated maximum.";

    meter.setAttribute(
      "aria-label",
      formatBpm(bpm) +
      " BPM, " +
      formatBpm(percent) +
      "% of estimated maximum; " +
      label
    );

    chips.forEach(chip => {
      chip.classList.toggle(
        "s4-active",
        chip.dataset.s4Zone === data.classification
      );
    });

    if (panel.open) {
      playDashboard(bpm, percent);
    }
  }

  function playDashboard(bpm, percent) {
    cancelAnimation();

    const limited = Math.max(
      0,
      Math.min(100, percent)
    );

    // Higher exercise intensity = faster fill animation.
    const duration =
      percent >= 85
        ? 850
        : percent >= 70
          ? 1050
          : percent >= 50
            ? 1400
            : 1750;

    const thresholds = [50, 70, 85];
    const crossed = new Set();

    let startedAt = null;
    pointer.hidden = false;

    function draw(progress) {
      const position = limited * progress;

      bpmValue.textContent = formatBpm(
        Math.round(bpm * progress)
      );

      fill.style.width = position + "%";
      pointer.style.left = position + "%";

      if (!reducedMotion.matches) {
        for (const mark of thresholds) {
          if (position >= mark && !crossed.has(mark)) {
            crossed.add(mark);

            burst.style.left = mark + "%";
            burst.classList.remove("s4-burst-on");

            // Restart the particle burst animation.
            void burst.offsetWidth;

            burst.classList.add("s4-burst-on");
          }
        }
      }
    }

    if (reducedMotion.matches) {
      draw(1);
      return;
    }

    draw(0);

    function tick(now) {
      if (startedAt === null) {
        startedAt = now;
      }

      const progress = Math.min(
        (now - startedAt) / duration,
        1
      );

      const easing =
        1 - Math.pow(1 - progress, 3);

      draw(easing);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        frameId = null;
        draw(1);
      }
    }

    frameId = window.requestAnimationFrame(tick);
  }

  // Observe existing results without modifying displayResults().
  const observer = new MutationObserver(() => {
    if (results.hidden) {
      resetDashboard();
    } else if (latestCalculation && latestCalculation.data) {
      setDashboardData(latestCalculation.data);
    }
  });

  observer.observe(results, {
    attributes: true,
    attributeFilter: ["hidden"]
  });

  // Reopen the panel to replay the gauge animation.
  panel.addEventListener("toggle", () => {
    if (!panel.open) {
      cancelAnimation();
    } else if (lastData) {
      setDashboardData(lastData);
    }
  });

  resetDashboard();
})();

// =================================================
// Sprint 4 UI refinement - Saved History Count
// Keeps the existing Sprint 2 history functions unchanged.
// =================================================

(() => {
  const historyCount = document.querySelector("#history-count");
  if (!historyCount) return;

  function updateHistoryCount() {
    const count = historyList.children.length;
    historyCount.textContent = `(${count})`;
  }

  // Existing renderCalculationHistory() updates the same history list.
  // Observe its entries instead of modifying a teammate's function.
  new MutationObserver(updateHistoryCount).observe(historyList, {
    childList: true
  });

  updateHistoryCount();
})();
