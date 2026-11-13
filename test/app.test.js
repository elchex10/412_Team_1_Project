// HCDD 412 - Team 1
// tzp5401 - Sprint 1
// Issue #45 Automated Testing and CI Validation

// Import Node.js built-in modules for testing and HTTP server validation
const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, describe, test } = require("node:test");

// Import the application functions for testing
const {
  createServer,
  runSelfTests,
  calculateMaxHeartRate,
  calculateTargetZone,
  calculateHeartRateRange,
  calculateEstimatedHeartRateRange,
  classifyCurrentHeartRate,
  getHeartRateFeedback,
  processHeartRateInput,
  validateAge
} = require("../app");

// Describe the test suite for heart rate calculations
describe("heart rate calculations", () => {
  test("passes the existing self-test suite", () => {
    assert.doesNotThrow(() => runSelfTests());
  });

  // Test age-based calculations and input validation
  test("calculates and validates age-based results", () => {
    assert.equal(calculateMaxHeartRate(40), 180);
    assert.equal(validateAge(""), "Please enter your age.");
    assert.equal(validateAge("121"), "Please enter a valid age between 1 and 120.");
    assert.deepEqual(processHeartRateInput(" 25 "), { error: null, result: 195 });
    assert.throws(() => calculateMaxHeartRate(0), /valid age/);
  });

  // Test target and exercise zone calculations
  test("calculates target and exercise zones", () => {
    assert.deepEqual(calculateTargetZone(180), { min: 90, max: 153 });
    assert.deepEqual(calculateHeartRateRange(20), {
      maximumHeartRate: 200,
      moderateZone: "100-140",
      vigorousZone: "140-170"
    });
    assert.deepEqual(calculateEstimatedHeartRateRange(20), {
      MaximumHeartRate: 200,
      moderateZone: "100-140",
      vigorousZone: "140-170"
    });
  });
});

// Describe the test suite for current heart rate classification
describe("current heart rate classification", () => {
  const moderateZone = { min: 100, max: 140 };
  const vigorousZone = { min: 140, max: 170 };

  // Test zone boundary classification
  test("classifies zone boundaries correctly", () => {
    assert.equal(classifyCurrentHeartRate(99, moderateZone, vigorousZone), "below-zone");
    assert.equal(classifyCurrentHeartRate(100, moderateZone, vigorousZone), "moderate");
    assert.equal(classifyCurrentHeartRate(140, moderateZone, vigorousZone), "vigorous");
    assert.equal(classifyCurrentHeartRate(170, moderateZone, vigorousZone), "vigorous");
    assert.equal(classifyCurrentHeartRate(171, moderateZone, vigorousZone), "above-zone");
  });

  // Test optional and invalid readings
  test("handles optional and invalid readings", () => {
    assert.equal(classifyCurrentHeartRate(null, moderateZone, vigorousZone), null);
    assert.throws(
      () => classifyCurrentHeartRate(0, moderateZone, vigorousZone),
      /valid current heart rate/
    );
    assert.match(getHeartRateFeedback("moderate"), /moderate-intensity/);
    assert.equal(getHeartRateFeedback(null), null);
  });
});

// Describe the test suite for the HTTP server
describe("HTTP server", () => {
  let server;
  let port;

  before(async () => {
    server = createServer();
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    port = server.address().port;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  // Test the health endpoint
  test("returns a health response", async () => {
    const response = await request("/health", port);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { status: "ok" });
  });

  // Test serving the calculator page
  test("serves the calculator page", async () => {
    const response = await request("/", port);
    assert.equal(response.statusCode, 200);
    assert.match(response.body, /Heart Rate Calculator/);
  });
});

// Send an HTTP GET request to the server
function request(path, port) {
  return new Promise((resolve, reject) => {
    const request = http.get({ host: "127.0.0.1", port, path }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => resolve({
        statusCode: response.statusCode,
        body
      }));
    });
    request.on("error", reject);
  });
}
