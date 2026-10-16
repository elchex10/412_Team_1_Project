const http = require("node:http");

const PORT = process.env.PORT || 3000;

// Example formula: confirm with your team before merging.
function calculateHeartRateRange(age) {
    const estimatedMaximum = 220 - age;

    return {
        estimatedMaximum,
        lower: Math.round(estimatedMaximum * 0.50),
        upper: Math.round(estimatedMaximum * 0.85)
    };
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function renderPage({ age = "", error = "", result = null } = {}) {
    const errorMessage = error
        ? `<p role="alert">${escapeHtml(error)}</p>`
        : "";

    const results = result
        ? `
            <section aria-live="polite">
                <h2>Estimated Results</h2>
                <p>Estimated maximum heart rate:
                    ${result.estimatedMaximum} bpm</p>
                <p>Estimated heart-rate range:
                    ${result.lower}-${result.upper} bpm</p>
            </section>
        `
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Heart Rate Calculator</title>
</head>
<body>
    <main>
        <h1>Heart Rate Calculator</h1>
        <p>Enter your age to calculate an estimated heart-rate range.</p>

        ${errorMessage}

        <form action="/calculate" method="POST">
            <label for="age">Age (years):</label>
            <input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                step="1"
                value="${escapeHtml(age)}"
                required
            >
            <button type="submit">Calculate</button>
        </form>

        ${results}

        <p>These are estimates for educational purposes, not
        individualized medical advice.</p>
    </main>
</body>
</html>`;
}

function sendHtml(response, statusCode, html) {
    response.writeHead(statusCode, {
        "Content-Type": "text/html; charset=utf-8"
    });
    response.end(html);
}

const server = http.createServer((request, response) => {
    const url = new URL(
        request.url,
        `http://${request.headers.host || "localhost"}`
    );

    if (request.method === "GET" && url.pathname === "/health") {
        response.writeHead(200, {
            "Content-Type": "text/plain; charset=utf-8"
        });
        response.end("OK");
        return;
    }

    if (request.method === "GET" && url.pathname === "/") {
        sendHtml(response, 200, renderPage());
        return;
    }

    if (request.method === "POST" && url.pathname === "/calculate") {
        let body = "";

        request.on("data", (chunk) => {
            body += chunk.toString();
        });

        request.on("end", () => {
            const form = new URLSearchParams(body);
            const ageText = form.get("age") || "";
            const age = Number(ageText);

            if (
                ageText.trim() === "" ||
                !Number.isInteger(age) ||
                age < 1 ||
                age > 120
            ) {
                sendHtml(
                    response,
                    400,
                    renderPage({
                        age: ageText,
                        error: "Enter a valid age between 1 and 120."
                    })
                );
                return;
            }

            const result = calculateHeartRateRange(age);

            sendHtml(
                response,
                200,
                renderPage({ age: ageText, result })
            );
        });

        return;
    }

    response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Heart Rate Calculator listening on port ${PORT}`);
});