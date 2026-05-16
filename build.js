const fs = require("fs");
const path = require("path");

const root = __dirname;
const outDir = path.join(root, "dist");
const entries = [
  "index.html",
  "gallery.html",
  "styles.css",
  "script.js",
  "images",
  "video"
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of entries) {
  const source = path.join(root, entry);
  const target = path.join(outDir, entry);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing required build asset: ${entry}`);
  }

  fs.cpSync(source, target, { recursive: true });
}

console.log("Static site built into dist/");
