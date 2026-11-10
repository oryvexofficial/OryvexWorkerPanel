// Builds worker.js = core.js + embedded panel source + worker_main.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)) + path.sep;
const src = fs.readFileSync(here + "panel/Source.js");
const core = fs.readFileSync(here + "core.js", "utf8").replace(/^export /gm, "");
const main = fs.readFileSync(here + "worker_main.js", "utf8");
const b64 = src.toString("base64");
fs.writeFileSync(here + "worker.js", `${core}\nconst PANEL_SOURCE_B64 = "${b64}";\n${main}`);
console.log("worker.js built:", (fs.statSync(here + "worker.js").size / 1024).toFixed(0), "KB");
