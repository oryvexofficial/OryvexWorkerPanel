// Oryvex 1.0.6 UI build: compiles the Tailwind CSS v4 design layer for the
// panel, the local scanner and the deployer, then embeds the result in place.
//
//   npm i            (installs tailwindcss as a dev dependency)
//   node build-ui.mjs
//   node build.mjs   (re-packs worker.js with the updated panel)
//
// The Tailwind sources this builds against are vendored in ui/vendor/tailwindcss
// (v4.3.3, MIT). Only the `compile()` engine is loaded from node_modules.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { compile } from "tailwindcss";

const here = path.dirname(fileURLToPath(import.meta.url));
const P = (...p) => path.join(here, ...p);
const VENDOR = P("ui", "vendor", "tailwindcss");

async function loadStylesheet(id, base) {
	let file;
	if (id === "tailwindcss") file = path.join(VENDOR, "index.css");
	else if (id.startsWith("tailwindcss/")) file = path.join(VENDOR, id.slice("tailwindcss/".length));
	else file = path.resolve(base, id);
	if (!file.endsWith(".css")) file += ".css";
	return { path: file, base: path.dirname(file), content: fs.readFileSync(file, "utf8") };
}

// Tailwind-style candidate extraction: every token that could be a class name.
function candidates(...texts) {
	const set = new Set();
	for (const t of texts) {
		for (const raw of t.split(/[\s"'`<>{}\\;]+/)) {
			if (!raw || raw.length > 160) continue;
			const tok = raw.replace(/^[(,]+|[),.:]+$/g, "");
			if (/^[!-]?[a-z@*\[]/i.test(tok)) set.add(tok);
		}
	}
	return [...set];
}

function minify(css) {
	return css
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\s+/g, " ")
		.replace(/\s*([{};])\s*/g, "$1")
		.replace(/;}/g, "}")
		.replace(/\s*,\s*(?![^()]*\))/g, ",")
		.trim();
}

async function buildCss(entry, sources) {
	const entryFile = P("ui", "src", entry);
	const compiler = await compile(fs.readFileSync(entryFile, "utf8"), { base: path.dirname(entryFile), from: entryFile, loadStylesheet });
	const css = minify(compiler.build(candidates(...sources)));
	fs.writeFileSync(P("ui", "dist", entry), css);
	return css;
}

function replaceBetween(text, start, end, inner, label) {
	const a = text.indexOf(start);
	const b = a < 0 ? -1 : text.indexOf(end, a + start.length);
	if (a < 0 || b < 0) throw new Error("marker not found for " + label + ": " + start);
	return text.slice(0, a + start.length) + inner + text.slice(b);
}

const alertJs = fs.readFileSync(P("ui", "src", "alert.js"), "utf8").replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "");
fs.writeFileSync(P("ui", "dist", "alert.js"), alertJs);
for (const bad of ["`", "${", "</script"]) if (alertJs.includes(bad)) throw new Error("alert.js must not contain " + bad);

// 1) Panel ----------------------------------------------------------------
const srcFile = P("panel", "Source.js");
let source = fs.readFileSync(srcFile, "utf8");
const panelCss = await buildCss("panel.css", [source, alertJs]);
source = source.replace(/^const OX_UI_CSS = .*$/m, () => "const OX_UI_CSS = " + JSON.stringify(panelCss) + ";");
source = source.replace(/^const OX_UI_JS = .*$/m, () => "const OX_UI_JS = " + JSON.stringify(alertJs) + ";");
fs.writeFileSync(srcFile, source);
console.log("panel    css", (panelCss.length / 1024).toFixed(1), "KB");

// 2) Local scanner ----------------------------------------------------------
const scanFile = P("panel", "oryvex-scanner.txt");
let scan = fs.readFileSync(scanFile, "utf8");
const scanHtml = scan.slice(0, scan.indexOf("---PYTHON---"));
const scanCss = await buildCss("scanner.css", [scanHtml, alertJs]);
scan = replaceBetween(scan, '<style id="ox-ui">', "</style>", scanCss, "scanner css");
scan = replaceBetween(scan, '<script id="ox-alert">', "</script>", alertJs, "scanner js");
fs.writeFileSync(scanFile, scan);
console.log("scanner  css", (scanCss.length / 1024).toFixed(1), "KB");

// 3) Deployer ---------------------------------------------------------------
const depFile = P("worker_main.js");
let dep = fs.readFileSync(depFile, "utf8");
const depCss = await buildCss("deployer.css", [dep, alertJs]);
if (depCss.includes("`") || depCss.includes("${")) throw new Error("deployer css cannot go inside String.raw");
dep = replaceBetween(dep, '<style id="ox-ui">', "</style>", depCss, "deployer css");
dep = replaceBetween(dep, '<script id="ox-alert">', "</script>", alertJs, "deployer js");
fs.writeFileSync(depFile, dep);
console.log("deployer css", (depCss.length / 1024).toFixed(1), "KB");
