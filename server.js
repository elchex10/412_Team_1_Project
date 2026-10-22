
const http = require("node:http");
const { processHeartRateInput } = require("./app");

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/calculate") {
    const result = processHeartRateInput(url.searchParams.get("age"));
    res.writeHead(result.error ? 400 : 200, {
      "Content-Type": "application/json"
    });
    return res.end(JSON.stringify(result));
  }

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`
    <h1>Heart Rate Calculator</h1>
    <form id="calculator">
      <label>Age:
        <input name="age" type="number" min="1" max="120" required>
      </label>
      <button>Calculate</button>
    </form>
    <p id="result"></p>
    <script>
      document.querySelector("#calculator").onsubmit = async (event) => {
        event.preventDefault();
        const age = event.target.elements.age.value;
        const response = await fetch("/api/calculate?age=" + encodeURIComponent(age));
        const data = await response.json();
        document.querySelector("#result").textContent =
          data.error || ("Maximum heart rate: " + data.result + " BPM");
      };
    </script>
  `);
});

server.listen(port, "0.0.0.0", () => {
  console.log("Heart Rate Calculator listening on port " + port);
});
