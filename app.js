const greeting = "Hello team 1";
console.log(greeting);

function calculateSum(a, b) {
    return a + b;
}

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