const fs = require("fs");
const http = require("http");
const path = require("path");

const root = fs.existsSync(path.join(__dirname, "dist"))
  ? path.join(__dirname, "dist")
  : __dirname;

const host = "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4"
};

function resolveFile(requestUrl) {
  const parsed = new URL(requestUrl, `http://${host}:${port}`);
  const cleanPath = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
  const safePath = path.normalize(cleanPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(root, safePath || "index.html");

  if (!filePath.startsWith(root)) {
    return path.join(root, "index.html");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  return path.join(root, "index.html");
}

function sendFile(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = types[ext] || "application/octet-stream";

  if (ext === ".mp4" && req.headers.range) {
    const range = req.headers.range.replace(/bytes=/, "").split("-");
    const start = Number(range[0]);
    const end = range[1] ? Number(range[1]) : stat.size - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.writeHead(200, {
    "Content-Length": stat.size,
    "Content-Type": contentType,
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=2592000"
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    sendFile(req, res, resolveFile(req.url || "/"));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
});

server.listen(port, host, () => {
  console.log(`Sea Walks site is running on http://${host}:${port}`);
});
