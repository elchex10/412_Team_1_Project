const form = document.querySelector("#calculator");
const ageInput = document.querySelector("#age");
const currentInput = document.querySelector("#current");
const results = document.querySelector("#results");
const emptyState = document.querySelector("#empty-state");
const serverError = document.querySelector("#server-error");
const calculateButton = document.querySelector("#calculate-btn");

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

  emptyState.hidden = true;
  results.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const age = ageInput.value.trim();
  const current = currentInput.value.trim();

  // Do not leave an old result visible for a new calculation.
  results.hidden = true;
  emptyState.hidden = false;

  if (age === "") {
    showError(ageInput, "Please enter your age.");
    ageInput.focus();
    return;
  }

  if (!/^\d+$/.test(age) || Number(age) < 1 || Number(age) > 120) {
    showError(ageInput, "Please enter a valid age between 1 and 120.");
    ageInput.focus();
    return;
  }

  if (
    current !== "" &&
    (!/^\d+$/.test(current) || Number(current) < 1 || Number(current) > 300)
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

    const response = await fetch(`/api/calculate?${params.toString()}`);
    const data = await response.json();

    if (!response.ok || data.error) {
      serverError.textContent =
        data.error || "Unable to calculate heart rate.";
      serverError.hidden = false;
      return;
    }

    displayResults(data);
  } catch (error) {
    serverError.textContent =
      "Unable to connect to the calculator. Please try again.";
    serverError.hidden = false;
  } finally {
    calculateButton.disabled = false;
    calculateButton.textContent = "Calculate";
  }
});

document.querySelector("#clear-btn").addEventListener("click", () => {
  form.reset();
  clearErrors();
  results.hidden = true;
  emptyState.hidden = false;
  ageInput.focus();
});