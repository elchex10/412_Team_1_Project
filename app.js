// Function to calculate maximum heart rate
function calculateMaxHeartRate(age) {
  const numericAge = Number(age);
  if (!numericAge || numericAge <= 0) {
    return null;
  }
  return 220 - numericAge;
}

// Function to calculate target heart rate range (50% - 85%)
function calculateTargetZone(maxHeartRate) {
  if (!maxHeartRate) return null;
  return {
    min: Math.round(maxHeartRate * 0.5),
    max: Math.round(maxHeartRate * 0.85)
  };
}

// Browser UI handling
if (typeof document !== 'undefined') {
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ageInput = document.querySelector('input[type="number"]') || document.querySelector('#age');
      const result = document.querySelector('#result');

      const mhr = calculateMaxHeartRate(ageInput.value);
      if (mhr && result) {
        const zone = calculateTargetZone(mhr);
        result.textContent = `Max: ${mhr} bpm | Target: ${zone.min}-${zone.max} bpm`;
      }
    });
  }
}

// Export for automated CI tests (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateMaxHeartRate, calculateTargetZone };
}
