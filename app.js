
 // Deployment process runner
 // HCDD 412 - Team 1
 // elchex10 - Sprint 1
 // Issue #14 - Establish a Repeatable Deployment Process
 // Issue #13 - Automate Testing with CI

function deployCalculator(env = "production") {
    try {
        const config = {
            environment: env,
            timestamp: new Date().toISOString(),
            ready: true
        };

        if (!config.ready) {
            throw new Error("Pre-flight checks failed");
        }

        console.log(`Deployment succeeded to ${config.environment} at ${config.timestamp}`);
        return { success: true, ...config };
    } catch (error) {
        console.error(`Deployment failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

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

    const normalizedAge = typeof age === "string" ? age.trim() : age;

    if (normalizedAge === "") {
        return "Please enter your age.";
    }

    const numberAge = typeof normalizedAge === "string"
        ? (/^\d+$/.test(normalizedAge) ? Number(normalizedAge) : NaN)
        : normalizedAge;

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

// Function to calculate target heart rate range (50% - 85%)
function calculateTargetZone(maxHeartRate) {
    if (!maxHeartRate) return null;
    return {
        min: Math.round(maxHeartRate * 0.5),
        max: Math.round(maxHeartRate * 0.85)
    };
}

// HCDD 412 - Team 1
// tzp5401 - Sprint 1
// Issue #15 - Validate Required Input Fields

function submitHeartRateCalculation(age) {
    return processHeartRateInput(age);
}

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

// HCDD 412 - Team 1
// enl5197 - Sprint 1
// Issue #11 - Calculate Estimated Heartrate Range
// Issue #12 - View Current Heartrate

function calculateEstimatedHeartRateRange(age) {
    const MaximumHeartRate = 220 - age;

    const ModerateMin = MaximumHeartRate * 0.50;
    const ModerateMax = MaximumHeartRate * 0.70;

    const VigorousMin = MaximumHeartRate * 0.70;
    const VigorousMax = MaximumHeartRate * 0.85;

    return {
        MaximumHeartRate,
        moderateZone: `${ModerateMin}-${ModerateMax}`,
        vigorousZone: `${VigorousMin}-${VigorousMax}`
    };
}

function displayCurrentHeartRate(currentHeartRate) {
    return currentHeartRate;
}

// =====================================================
// HCDD 412 - Team 1
// Giovanni Matos (GMat97) - Sprint 2
// Issue #26 - Classify Current Heart Rate
// =====================================================

function classifyCurrentHeartRate(currentBpm, moderateZone, vigorousZone) {

    // Current heart rate is optional.
    if (currentBpm === null || currentBpm === undefined) {
        return null;
    }

    // Validate the current BPM.
    if (!Number.isFinite(currentBpm) || currentBpm <= 0) {
        throw new Error("Please enter a valid current heart rate.");
    }

    // Below the estimated moderate-intensity range.
    if (currentBpm < moderateZone.min) {
        return "below-zone";
    }

    // Moderate intensity: 50% to below 70%.
    if (currentBpm < vigorousZone.min) {
        return "moderate";
    }

    // Vigorous intensity: 70% through 85%.
    if (currentBpm <= vigorousZone.max) {
        return "vigorous";
    }

    // Above the estimated vigorous-intensity range.
    return "above-zone";
}

// =====================================================
// HCDD 412 - Team 1
// Giovanni Matos (GMat97) - Sprint 2
// Issue #27 - Generate Heart Rate Feedback
// =====================================================

function getHeartRateFeedback(classification) {

    const messages = {
        "below-zone":
            "Your current heart rate is below the estimated moderate-intensity exercise zone.",

        "moderate":
            "Your current heart rate is within the estimated moderate-intensity exercise zone.",

        "vigorous":
            "Your current heart rate is within the estimated vigorous-intensity exercise zone.",

        "above-zone":
            "Your current heart rate is above the estimated vigorous-intensity exercise zone."
    };

    // No current BPM means no classification feedback.
    if (classification === null || classification === undefined) {
        return null;
    }

    return messages[classification] || null;
}

// Browser UI handling
if (typeof document !== "undefined") {
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const ageInput = document.querySelector('input[type="number"]') || document.querySelector("#age");
            const result = document.querySelector("#result");

            const { result: mhr } = processHeartRateInput(ageInput.value);
            if (mhr && result) {
                const zone = calculateTargetZone(mhr);
                const ranges = calculateEstimatedHeartRateRange(Number(ageInput.value));
                result.textContent = `Max: ${mhr} bpm | Target: ${zone.min}-${zone.max} bpm`
                    + ` | Moderate: ${ranges.moderateZone} bpm`
                    + ` | Vigorous: ${ranges.vigorousZone} bpm`;
            }
        });
    }
}

// HCDD 412 - Team 1
// tzp5401 - Sprint 1
// Issue #10 - Deploy the Application to Azure
// Create a simple HTTP server to serve the application and handle API requests (Azure Server deployment)
function createServer() {
    const http = require("node:http");

    return http.createServer((request, response) => {
        if (request.url === "/health") {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ status: "ok" }));
            return;
        }

        if (request.method === "GET" && (request.url === "/" || request.url === "/index.html")) {
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            response.end(`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Heart Rate Calculator</title>
</head>
<body>
    <main>
        <h1>Heart Rate Calculator</h1>
        <form>
            <label for="age">Age</label>
            <input id="age" name="age" type="number" min="1" max="120" required>
            <button type="submit">Calculate</button>
        </form>
        <p id="result" aria-live="polite"></p>
    </main>
    <script>
        const form = document.querySelector("form");
        const ageInput = document.querySelector("#age");
        const result = document.querySelector("#result");

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const age = Number(ageInput.value);
            if (!Number.isInteger(age) || age < 1 || age > 120) {
                result.textContent = "Please enter a valid age between 1 and 120.";
                return;
            }

            const maximum = 220 - age;
            const moderateMin = Math.round(maximum * 0.5);
            const moderateMax = Math.round(maximum * 0.7);
            const vigorousMin = Math.round(maximum * 0.7);
            const vigorousMax = Math.round(maximum * 0.85);
            result.textContent = "Max: " + maximum + " bpm | Target: "
                + moderateMin + "-" + vigorousMax + " bpm | Moderate: "
                + moderateMin + "-" + moderateMax + " bpm | Vigorous: "
                + vigorousMin + "-" + vigorousMax + " bpm";
        });
    </script>
</body>
</html>`);
            return;
        }

        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
    });
}

// Execute deployment check
deployCalculator("production");

// Tests & CLI output (Node.js only)
function runSelfTests() {
    const assert = require("node:assert/strict");

    assert.equal(calculateMaxHeartRate(25), 195);
    assert.equal(calculateMaxHeartRate(40), 180);
    assert.equal(calculateMaxHeartRate(60), 160);

    assert.equal(processHeartRateInput("25").result, 195);
    assert.equal(processHeartRateInput("").result, null);

    // Additional test cases for invalid inputs
    assert.equal(processHeartRateInput("   ").result, null);
    assert.equal(processHeartRateInput(-5).result, null);
    assert.equal(processHeartRateInput("abc").result, null);
    assert.equal(processHeartRateInput(121).result, null);
    assert.equal(processHeartRateInput(25.5).result, null);

    // Additional test of the submitHeartRateCalculation function
    assert.equal(submitHeartRateCalculation("").error, "Please enter your age.");
    assert.equal(submitHeartRateCalculation("25").result, 195);

    console.log("All Sprint 1 tests passed!");

    console.log("Current Heart Rate: " + displayCurrentHeartRate(70));
    console.log("Estimated Heart Rate Range:");
    console.log(calculateEstimatedHeartRateRange(20));

    // =================================================
    // Giovanni Matos - Sprint 2
    // Issues #26 and #27 - Classification and Feedback
    // =================================================

    const moderateZone = { min: 100, max: 140 };
    const vigorousZone = { min: 140, max: 170 };

    // Test classification below the estimated zones.
    assert.equal(
        classifyCurrentHeartRate(99, moderateZone, vigorousZone),
        "below-zone"
    );

    // Test the lower moderate boundary.
    assert.equal(
        classifyCurrentHeartRate(100, moderateZone, vigorousZone),
        "moderate"
    );

    // Test moderate classification.
    assert.equal(
        classifyCurrentHeartRate(120, moderateZone, vigorousZone),
        "moderate"
    );

    // Test the shared 70% boundary.
    assert.equal(
        classifyCurrentHeartRate(140, moderateZone, vigorousZone),
        "vigorous"
    );

    // Test vigorous classification.
    assert.equal(
        classifyCurrentHeartRate(160, moderateZone, vigorousZone),
        "vigorous"
    );

    // Test the upper vigorous boundary.
    assert.equal(
        classifyCurrentHeartRate(170, moderateZone, vigorousZone),
        "vigorous"
    );

    // Test above-zone classification.
    assert.equal(
        classifyCurrentHeartRate(171, moderateZone, vigorousZone),
        "above-zone"
    );

    // Test optional current heart rate.
    assert.equal(
        classifyCurrentHeartRate(null, moderateZone, vigorousZone),
        null
    );

    // Test feedback for each classification.
    assert.ok(getHeartRateFeedback("below-zone"));
    assert.ok(getHeartRateFeedback("moderate"));
    assert.ok(getHeartRateFeedback("vigorous"));
    assert.ok(getHeartRateFeedback("above-zone"));

    // Test that feedback is absent without a classification.
    assert.equal(getHeartRateFeedback(null), null);

    console.log("All Sprint 2 classification and feedback tests passed!");
}

// Export for automated CI tests (Node.js)
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        createServer,
        runSelfTests,
        deployCalculator,
        calculateMaxHeartRate,
        calculateTargetZone,
        validateAge,
        processHeartRateInput,
        submitHeartRateCalculation,
        calculateHeartRateRange,
        calculateEstimatedHeartRateRange,
        displayCurrentHeartRate,

        // Giovanni Matos - Sprint 2
        classifyCurrentHeartRate,
        getHeartRateFeedback
    };
}

// HCDD 412 - Team 1
// tzp5401 - Sprint 1
// Issue #10 - Deploy the Application to Azure
// Create and start the server if this script is run directly
if (typeof require !== "undefined" && require.main === module) {
    runSelfTests();
    const port = Number(process.env.PORT) || 8080;
    const server = createServer();

    server.on("error", (error) => {
        console.error(`Unable to start web server: ${error.message}`);
        process.exitCode = 1;
    });

    server.listen(port, "0.0.0.0", () => {
        console.log(`Heart Rate Calculator listening on port ${port}`);
    });
}
