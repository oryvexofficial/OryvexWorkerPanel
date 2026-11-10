// Oryvex Deployer core: shared by the Worker (UI) and the CLI. No Node-only APIs here.
export const API = "https://api.cloudflare.com/client/v4";
export const COMPAT_DATE = "2026-07-10";
export const TOKEN_PERMISSIONS = [
	{ key: "workers_scripts", type: "edit", label: "Workers Scripts : Edit (account)" },
	{ key: "d1", type: "edit", label: "D1 : Edit (account)" },
	{ key: "account_settings", type: "read", label: "Account Settings : Read (account)" },
];
export function tokenTemplateUrl(name = "Oryvex Deployer") {
	const keys = encodeURIComponent(JSON.stringify(TOKEN_PERMISSIONS.map(({ key, type }) => ({ key, type }))));
	return `https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=${keys}&accountId=*&zoneId=all&name=${encodeURIComponent(name)}`;
}
export function tokenTemplateInfo() {
	return {
		url: tokenTemplateUrl(),
		name: "Oryvex Deployer",
		permissions: TOKEN_PERMISSIONS,
		steps: ["Open the template link", "Continue to summary", "Create token", "Copy the token and paste it into the deployer"],
		note: "Template links only pre-fill the form. Cloudflare still asks you to press Create.",
	};
}
async function cf(token, path, opts = {}) {
	const headers = { Authorization: "Bearer " + token, ...(opts.headers || {}) };
	if (opts.json !== undefined) { headers["Content-Type"] = "application/json"; opts = { ...opts, body: JSON.stringify(opts.json) }; }
	const res = await fetch(API + path, { method: opts.method || "GET", headers, body: opts.body });
	let data = null;
	try { data = await res.json(); } catch (e) {}
	if (!res.ok || !data || data.success === false) {
		const msg = data && data.errors && data.errors[0] ? `${data.errors[0].message}${data.errors[0].code ? " (code " + data.errors[0].code + ")" : ""}` : `HTTP ${res.status}`;
		const err = new Error(msg); err.status = res.status; err.data = data; throw err;
	}
	return data;
}
export async function listAccounts(token) {
	const accounts = [];
	let page = 1;
	let totalPages = 1;
	while (page <= totalPages) {
		const d = await cf(token, `/accounts?per_page=50&page=${page}`);
		accounts.push(...(Array.isArray(d.result) ? d.result : []).map((a) => ({ id: a.id, name: a.name })));
		const reportedPages = Number(d.result_info?.total_pages);
		totalPages = Number.isInteger(reportedPages) && reportedPages >= page
			? reportedPages
			: page;
		page++;
	}
	return accounts;
}
/**
 * Lists what a token can see: Workers ("panels") and D1 databases. Used by the deployer UI.
 * Returns { account, panels, dbs, errors } and never throws for a single failing section.
 */
export async function listResources(token, accountId) {
	token = String(token || "").trim();
	if (!token) throw new Error("Paste your Cloudflare API token first.");
	const accounts = await listAccounts(token);
	const account = accountId ? accounts.find((a) => a.id === accountId) : accounts[0];
	if (!account) throw new Error("Account not found for this token.");
	const acc = account.id;
	const errors = [];
	let sub = null;
	try { sub = (await cf(token, `/accounts/${acc}/workers/subdomain`)).result?.subdomain || null; } catch (e) {}
	let panels = [];
	try {
		const d = await cf(token, `/accounts/${acc}/workers/scripts`);
		panels = (Array.isArray(d.result) ? d.result : []).map((w) => ({
			name: w.id, modified: w.modified_on || null, created: w.created_on || null,
			url: sub ? `https://${w.id}.${sub}.workers.dev` : null,
			panelUrl: sub ? `https://${w.id}.${sub}.workers.dev/panel` : null,
		})).sort((a, b) => String(b.modified).localeCompare(String(a.modified)));
	} catch (e) { errors.push("Panels: " + e.message); }
	let dbs = [];
	try {
		const d = await cf(token, `/accounts/${acc}/d1/database?per_page=100`);
		dbs = (Array.isArray(d.result) ? d.result : []).map((x) => ({ name: x.name, id: x.uuid, created: x.created_at || null, size: x.file_size ?? null, tables: x.num_tables ?? null }));
	} catch (e) { errors.push("Databases: " + e.message); }
	return { account, panels, dbs, errors };
}
const slug = (s, fb) => (String(s || fb).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 54)) || fb;
function rnd(n = 6) { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join(""); }
/**
 * Full automatic deployment.
 * opts: { token, accountId?, workerName?, dbName?, repoSlug?, storeToken?, source }
 * log(step, message, status) is called for progress. Returns { url, panelUrl, accountId, databaseId, workerName }
 */
export async function deployPanel(opts, log = () => {}) {
	const token = String(opts.token || "").trim();
	if (!token) throw new Error("Paste your Cloudflare API token first.");
	if (!opts.source || opts.source.length < 1000) throw new Error("Panel source is missing.");
	const workerName = slug(opts.workerName, "oryvex-panel");
	const dbName = slug(opts.dbName, workerName + "-db");

	log("token", "Checking your token...", "run");
	let accounts;
	try { accounts = await listAccounts(token); } catch (e) { throw new Error("The token was rejected: " + e.message + ". Use the token template to create one with the right permissions."); }
	if (!accounts.length) throw new Error("This token cannot see any account. Add 'Account Settings : Read' and pick your account.");
	let account = opts.accountId ? accounts.find((a) => a.id === opts.accountId) : accounts[0];
	if (!account) throw new Error("Account not found for this token.");
	if (!opts.accountId && accounts.length > 1) log("token", `Token sees ${accounts.length} accounts, using "${account.name}". Pass an account to pick another.`, "warn");
	const acc = account.id;
	log("token", `Token OK. Account: ${account.name}`, "ok");

	log("d1", `Looking for D1 database "${dbName}"...`, "run");
	let dbId = null;
	try {
		const found = await cf(token, `/accounts/${acc}/d1/database?name=${encodeURIComponent(dbName)}&per_page=50`);
		const hit = (found.result || []).find((d) => d.name === dbName);
		if (hit) dbId = hit.uuid;
	} catch (e) { if (e.status === 403) throw new Error("Token has no D1 permission. Add 'D1 : Edit'."); }
	if (dbId) log("d1", "Database already exists, reusing it (your users are kept).", "ok");
	else {
		const created = await cf(token, `/accounts/${acc}/d1/database`, { method: "POST", json: { name: dbName } });
		dbId = created.result.uuid;
		log("d1", "Created D1 database.", "ok");
	}

	log("subdomain", "Checking your workers.dev subdomain...", "run");
	let sub = null;
	try { sub = (await cf(token, `/accounts/${acc}/workers/subdomain`)).result?.subdomain || null; } catch (e) {}
	if (!sub) {
		const want = slug("oryvex-" + rnd(6), "oryvex-" + rnd(6));
		const r = await cf(token, `/accounts/${acc}/workers/subdomain`, { method: "PUT", json: { subdomain: want } });
		sub = r.result?.subdomain || want;
		log("subdomain", `Registered subdomain ${sub}.workers.dev`, "ok");
	} else log("subdomain", `Subdomain: ${sub}.workers.dev`, "ok");

	if (opts.obfuscate !== false) {
		log("obf", "Obfuscating panel source code...", "run");
		try {
			opts.source = obfuscateSource(opts.source);
			log("obf", "Panel source obfuscated successfully.", "ok");
		} catch (e) {
			log("obf", "Obfuscation skipped (" + e.message + ").", "warn");
		}
	}
	log("upload", "Uploading the panel and binding the database...", "run");
	const bindings = [
		{ type: "d1", name: "DB", id: dbId },
		{ type: "plain_text", name: "WORKER_NAME", text: workerName },
		{ type: "secret_text", name: "CF_ACCOUNT_ID", text: acc },
	];
	if (opts.repoSlug && /^[\w.-]+\/[\w.-]+$/.test(opts.repoSlug)) bindings.push({ type: "plain_text", name: "REPO_SLUG", text: opts.repoSlug });
	if (opts.storeToken) bindings.push({ type: "secret_text", name: "CF_API_TOKEN", text: token });
	const mod = "worker.js";
	const metadata = { main_module: mod, compatibility_date: COMPAT_DATE, compatibility_flags: ["nodejs_compat", "allow_eval_during_startup"], bindings };
	const form = new FormData();
	form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }), "metadata.json");
	form.append(mod, new Blob([opts.source], { type: "application/javascript+module" }), mod);
	await cf(token, `/accounts/${acc}/workers/scripts/${workerName}`, { method: "PUT", body: form });
	log("upload", "Panel uploaded.", "ok");

	log("enable", "Turning on the workers.dev route...", "run");
	try { await cf(token, `/accounts/${acc}/workers/scripts/${workerName}/subdomain`, { method: "POST", json: { enabled: true, previews_enabled: false } }); log("enable", "Route enabled.", "ok"); }
	catch (e) { log("enable", "Could not toggle the route (" + e.message + "). It may already be on.", "warn"); }

	const url = `https://${workerName}.${sub}.workers.dev`;
	const panelUrl = url + "/panel";
	log("warm", "Waiting for the panel to come alive and create its tables...", "run");
	let live = false;
	for (let i = 0; i < 8 && !live; i++) {
		await new Promise((r) => setTimeout(r, i === 0 ? 2500 : 3500));
		try { const r = await fetch(panelUrl, { redirect: "manual" }); if (r.status === 200) live = true; } catch (e) {}
	}
	log("warm", live ? "Panel is live." : "Deployed. The route can take up to a minute to appear.", live ? "ok" : "warn");
	return { url, panelUrl, accountId: acc, databaseId: dbId, workerName, dbName };
}

export function obfuscateSource(sourceCode) {
	let code = sourceCode;
	const verRegex = new RegExp("(?:const|let|var)\\s+CURRENT_" + "VERSION\\s*=\\s*(['\"])([0-9.]+)\\1");
	const fixRegex = new RegExp("(?:const|let|var)\\s+UPDATE_" + "FIX\\s*=\\s*(['\"])([^'\"]+)\\1");
	const verMatch = code.match(verRegex);
	const fixMatch = code.match(fixRegex);
	const versionStr = verMatch ? verMatch[2] : "2.0.0";
	const updateFixStr = fixMatch ? fixMatch[2] : "constsCURRENT_VERSION='d.d.d'";
	const xorKey1 = 198;
	const xorKey2 = 124;
	const xorArr1 = Array.from(versionStr).map((c) => c.charCodeAt(0) ^ xorKey1);
	const xorArr2 = Array.from(updateFixStr).map((c) => c.charCodeAt(0) ^ xorKey2);
	const importRegex = new RegExp("^\\s*import\\s*\\{\\s*connect\\s*\\}\\s*from\\s*['\"]cloudflare:sockets['\"]\\s*;?", "m");
	code = code.replace(importRegex, "");
	const exportRegex = new RegExp("export\\s+" + "default\\s*\\{");
	code = code.replace(exportRegex, "const __WORKER_EXPORT__ = {");
	code += "\nreturn __WORKER_EXPORT__;";
	const utf8Bytes = new TextEncoder().encode(code);
	const chunks = [];
	const chunkSize = 32768;
	for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
		chunks.push(String.fromCharCode.apply(null, utf8Bytes.subarray(i, i + chunkSize)));
	}
	const base64Payload = btoa(chunks.join(""));
	return (
		`import { connect } from "cloudflare:sockets";\r\n` +
		`var _f6eb8b=[${xorArr1.join(",")}].map(v=>v^${xorKey1});var _8be500=[${xorArr2.join(",")}].map(v=>v^${xorKey2});\r\n` +
		`var _raw=atob("${base64Payload}");var _u8=new Uint8Array(_raw.length);for(var i=0;i<_raw.length;i++)_u8[i]=_raw.charCodeAt(i);\r\n` +
		`var _a0042f=new TextDecoder("utf-8").decode(_u8);\r\n` +
		`var _89056b=new Function("connect",_a0042f)(connect);\r\n` +
		`export default _89056b;\r\n`
	);
}
