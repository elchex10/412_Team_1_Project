
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs/promises");

const {
  processHeartRateInput,
  calculateEstimatedHeartRateRange,
  displayCurrentHeartRate,

  // Giovanni Matos - Sprint 2
  // Issues #26 and #27
  classifyCurrentHeartRate,
  getHeartRateFeedback
} = require("./app");

const PORT = Number(process.env.PORT) || 8080;
const publicDirectory = path.join(__dirname, "public");

const staticFiles = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/style.css": ["style.css", "text/css; charset=utf-8"],
  "/client.js": ["client.js", "text/javascript; charset=utf-8"]
};

function sendResponse(res, status, contentType, body) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });

  res.end(body);
}

function sendJSON(res, status, data) {
  sendResponse(
    res,
    status,
    "application/json; charset=utf-8",
    JSON.stringify(data)
  );
}

function parseRange(range) {
  const [min, max] = range.split("-").map(Number);
  return { min, max };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method !== "GET") {
    return sendJSON(res, 405, {
      error: "Method not allowed."
    });
  }

  // Heart rate calculation API
  if (url.pathname === "/api/calculate") {
    const age = url.searchParams.get("age");

    const calculation = processHeartRateInput(age);

    if (calculation.error) {
      return sendJSON(res, 400, {
        error: calculation.error,
        result: null
      });
    }

    const current = url.searchParams.get("current");
    let currentHeartRate = null;

    if (current !== null && current.trim() !== "") {
      const value = current.trim();

      if (
        !/^\d+$/.test(value) ||
        Number(value) < 1 ||
        Number(value) > 300
      ) {
        return sendJSON(res, 400, {
          error: "Please enter a valid current heart rate between 1 and 300 BPM.",
          result: null
        });
      }

      currentHeartRate = displayCurrentHeartRate(Number(value));
    }

    const range = calculateEstimatedHeartRateRange(Number(age));

    // =================================================
    // Giovanni Matos - Sprint 2
    // Issue #26 - Classify Current Heart Rate
    // Issue #27 - Generate Heart Rate Feedback
    // =================================================

    // Convert the existing ranges into numeric objects.
    const moderateZone = parseRange(range.moderateZone);
    const vigorousZone = parseRange(range.vigorousZone);

    // Classify the current BPM against the estimated zones.
    const classification = classifyCurrentHeartRate(
      currentHeartRate,
      moderateZone,
      vigorousZone
    );

    // Generate feedback based on the classification.
    const feedback = getHeartRateFeedback(classification);

    // Return the existing results and new Sprint 2 fields.
    return sendJSON(res, 200, {
      error: null,
      result: calculation.result,
      moderateZone,
      vigorousZone,
      currentHeartRate,

      // Sprint 2 results
      classification,
      feedback
    });
  }

  // Serve the website files
  const file = staticFiles[url.pathname];

  if (!file) {
    return sendResponse(
      res,
      404,
      "text/plain; charset=utf-8",
      "Page not found"
    );
  }

  try {
    const content = await fs.readFile(
      path.join(publicDirectory, file[0])
    );

    sendResponse(res, 200, file[1], content);
  } catch (error) {
    console.error("Website error:", error.message);

    sendResponse(
      res,
      500,
      "text/plain; charset=utf-8",
      "Website file unavailable"
    );
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Heart Rate Calculator listening on port ${PORT}`);
});
