
function validateAge(age) {
    if (age === "" || age === null || age === undefined) {
        return "Please enter your age.";
    }

    if (typeof age !== "number" || !Number.isInteger(age) || age <= 0 || age > 120) {
        return "Please enter a valid age between 1 and 120.";
    }

    return null;
}

function processHeartRateInput(age) {
    const error = validateAge(age);

    if (error) {
        return {
            error: error,
            result: null
        };
    }

    return {
        error: null,
        result: 220 - age
    };
}

// Test inputs
console.log("Empty:", processHeartRateInput(""));
console.log("Negative:", processHeartRateInput(-5));
console.log("Text:", processHeartRateInput("abc"));
console.log("Valid:", processHeartRateInput(25));

module.exports = { validateAge, processHeartRateInput };
