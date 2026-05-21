/**
 * Static file server for the Pi (listens on all interfaces for Chromium kiosk).
 * Usage: npm start   (default port 8080, override with PORT=8765)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 8080;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type ?? "text/plain" });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(ROOT, safe === "/" ? "/index.html" : safe);

  if (!filePath.startsWith(ROOT)) {
    return send(res, 403, "Forbidden");
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        return send(res, 404, "Not found");
      }
      const ext = path.extname(filePath);
      send(res, 200, data, MIME[ext] ?? "application/octet-stream");
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Magic mirror: http://127.0.0.1:${PORT}`);
});
