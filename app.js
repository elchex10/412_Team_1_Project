
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

<<<<<<< ours
console.log("Sum: " + calculateSum(5, 10));

function calculateHeartRateRange(age) {

    const maximumHeartRate = 220 - age;

    const moderateMin = maximumHeartRate * 0.50;
    const moderateMax = maximumHeartRate * 0.70;

    const vigorousMin = maximumHeartRate * 0.70;
    const vigorousMax = maximumHeartRate * 0.85;

    return {
        maximumHeartRate,
        moderateZone: `${moderateMin}-${moderateMax}`,
        vigorousZone: `${vigorousMin}-${vigorousMax}`
    };
}

console.log(calculateHeartRateRange(20));
=======
module.exports = {
    calculateMaxHeartRate,
    validateAge,
    processHeartRateInput
};

// HCDD 412 - Team 1
// enl5197 - Sprint 1
// Issue #11 - Calculate Estimated Heartrate Range
// Issue #12 - View Current Heartrate

function calculateEstimatedHeartRateRange(age) {
    
    const MaximumHeartRate = 220 - age; 

    const ModerateMin = MaximumHeartRate * .50; 
    const ModerateMax = MaximumHeartRate * .70; 

    const VigorousMin = MaximumHeartRate * .70; 
    const VigorousMax = MaximumHeartRate * .85; 

    return{
        MaximumHeartRate, 
       moderateZone: `${ModerateMin}-${ModerateMax}`,
        vigorousZone: `${VigorousMin}-${VigorousMax}`
    };
    }

function displayCurrentHeartRate(currentHeartRate) {


    return currentHeartRate;

    
}
console.log("Current Heart Rate: " + displayCurrentHeartRate(70))
console.log("Estimated Heart Rate Range:");
console.log(calculateEstimatedHeartRateRange(20));
>>>>>>> theirs
