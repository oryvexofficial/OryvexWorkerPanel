import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { listAccounts, deployPanel, listResources } from "../core.js";

test("listAccounts reads every Cloudflare account page", async () => {
	const originalFetch = globalThis.fetch;
	const requestedPages = [];
	globalThis.fetch = async (url) => {
		const parsed = new URL(String(url));
		const page = Number(parsed.searchParams.get("page"));
		requestedPages.push(page);
		const result = page === 1
			? [{ id: "acc-1", name: "First" }]
			: [{ id: "acc-2", name: "Second" }];
		return new Response(JSON.stringify({
			success: true,
			result,
			result_info: { total_pages: 2 },
		}), { status: 200, headers: { "Content-Type": "application/json" } });
	};
	try {
		assert.deepEqual(await listAccounts("test-token"), [
			{ id: "acc-1", name: "First" },
			{ id: "acc-2", name: "Second" },
		]);
		assert.deepEqual(requestedPages, [1, 2]);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test("deployPanel rejects an empty token before making network requests", async () => {
	await assert.rejects(
		deployPanel({ token: "", source: "valid-looking-source" }),
		/Paste your Cloudflare API token first/,
	);
});

test("deployer page client script parses", () => {
	const source = readFileSync(new URL("../worker_main.js", import.meta.url), "utf8");
	const match = source.match(/<script>([\s\S]*?)<\/script>/);
	assert.ok(match, "deployer page script exists");
	assert.doesNotThrow(() => new vm.Script(match[1]));
});

test("listResources returns panels and databases with workers.dev urls", async () => {
	const originalFetch = globalThis.fetch;
	const ok = (result, info) => new Response(JSON.stringify({ success: true, result, result_info: info }), { status: 200, headers: { "Content-Type": "application/json" } });
	globalThis.fetch = async (url) => {
		const p = new URL(String(url)).pathname;
		if (p.endsWith("/accounts")) return ok([{ id: "acc1", name: "Main" }], { total_pages: 1 });
		if (p.endsWith("/workers/subdomain")) return ok({ subdomain: "me" });
		if (p.endsWith("/workers/scripts")) return ok([{ id: "old", modified_on: "2026-01-01" }, { id: "new", modified_on: "2026-05-01" }]);
		if (p.endsWith("/d1/database")) return ok([{ name: "db1", uuid: "u1", num_tables: 4, file_size: 2048 }]);
		return new Response("{}", { status: 404 });
	};
	try {
		const r = await listResources("tok-1234567890123456789");
		assert.equal(r.panels[0].name, "new");
		assert.equal(r.panels[0].panelUrl, "https://new.me.workers.dev/panel");
		assert.equal(r.dbs[0].name, "db1");
		assert.deepEqual(r.errors, []);
	} finally { globalThis.fetch = originalFetch; }
});

test("version bump and credit are present", () => {
	const src = readFileSync(new URL("../panel/Source.js", import.meta.url), "utf8");
	assert.match(src, /const CURRENT_VERSION = '1\.0\.4'/);
	assert.ok(src.includes("Created by <b>Muvixo</b>"));
});
