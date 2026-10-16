const greeting = "Hello team 1";
console.log(greeting);

function calculateMaxHeartRate(age) {
    if (!Number.isInteger(age) || age <= 0 || age > 120) {
        throw new Error("Please enter a valid age.");
    }

    return 220 - age;
}

// Test the calculation
console.log("Age 25:", calculateMaxHeartRate(25));
console.log("Age 40:", calculateMaxHeartRate(40));
console.log("Age 60:", calculateMaxHeartRate(60));

module.exports = { calculateMaxHeartRate };
const firstResult = calculateMaxHeartRate(25);
const secondResult = calculateMaxHeartRate(25);

console.assert(
    firstResult === secondResult,
    "Repeated calculations should match"
);

console.log("Consistency test passed:", firstResult === secondResult);