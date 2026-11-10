// CLI: CF_API_TOKEN=xxxx node deploy.mjs [--name oryvex-panel] [--db name] [--repo user/repo] [--store-token] [--account ID]
import fs from "fs";
import { deployPanel, tokenTemplateUrl } from "./core.js";
const a = process.argv.slice(2);
const get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
if (a.includes("--token-url")) { console.log(tokenTemplateUrl()); process.exit(0); }
const token = process.env.CF_API_TOKEN || get("--token");
if (!token) { console.error("Set CF_API_TOKEN (or --token). Need a token? Run: node deploy.mjs --token-url"); process.exit(1); }
const source = fs.readFileSync(new URL("./panel/Source.js", import.meta.url), "utf8");
try {
	const r = await deployPanel({ token, accountId: get("--account"), workerName: get("--name"), dbName: get("--db"), repoSlug: get("--repo") || "oryvexofficial/OryvexWorkerPanel", storeToken: a.includes("--store-token"), obfuscate: !a.includes("--no-obf"), source },
		(step, msg, st) => console.log((st === "ok" ? "[ok]   " : st === "warn" ? "[warn] " : "[..]   ") + msg));
	console.log("\nPanel ready: " + r.panelUrl);
} catch (e) { console.error("\nFailed: " + e.message); process.exit(1); }
