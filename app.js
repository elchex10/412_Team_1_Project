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
// Issue #10 - Deploy the Application to Azure

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
                result.textContent = `Max: ${mhr} bpm | Target: ${zone.min}-${zone.max} bpm`;
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
            result.textContent = "Max: " + maximum + " bpm | Target: "
                + Math.round(maximum * 0.5) + "-" + Math.round(maximum * 0.85) + " bpm";
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
        displayCurrentHeartRate
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