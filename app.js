
const assert = require("node:assert/strict");

// HCDD 412 - Team 1
// GMat97 - Sprint 1
// Issue #8 - Correct Calculation Behavior
// Issue #9 - Prevent Invalid Input

function calculateMaxHeartRate(age) {
    if (!Number.isInteger(age) || age <= 0 || age > 120) {
        throw new Error("Please enter a valid age.");
    }

    return 220 - age;
}

function validateAge(age) {
    if (age === null || age === undefined || age === "") {
        return "Please enter your age.";
    }

    const numberAge = typeof age === "string"
        ? (/^\d+$/.test(age.trim()) ? Number(age.trim()) : NaN)
        : age;

    if (!Number.isInteger(numberAge) || numberAge <= 0 || numberAge > 120) {
        return "Please enter a valid age between 1 and 120.";
    }

    return null;
}

function processHeartRateInput(age) {
    const error = validateAge(age);

    if (error) {
        return { error: error, result: null };
    }

    return {
        error: null,
        result: calculateMaxHeartRate(Number(age))
    };
}

// Tests
if (require.main === module) {
    assert.equal(calculateMaxHeartRate(25), 195);
    assert.equal(calculateMaxHeartRate(40), 180);
    assert.equal(calculateMaxHeartRate(60), 160);

    assert.equal(processHeartRateInput("25").result, 195);
    assert.equal(processHeartRateInput("").result, null);
    assert.equal(processHeartRateInput(-5).result, null);
    assert.equal(processHeartRateInput("abc").result, null);
    assert.equal(processHeartRateInput(121).result, null);
    assert.equal(processHeartRateInput(25.5).result, null);

    console.log("All Sprint 1 tests passed!");
}

module.exports = {
    calculateMaxHeartRate,
    validateAge,
    processHeartRateInput
};
