// ===== Oryvex Deployer Worker (UI + API). core.js is inlined above by build.mjs =====
let _CACHED_PANEL_SOURCE = null;
function getPanelSource() {
	if (!_CACHED_PANEL_SOURCE) {
		const b = atob(PANEL_SOURCE_B64);
		const u = new Uint8Array(b.length);
		for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
		_CACHED_PANEL_SOURCE = new TextDecoder().decode(u);
	}
	return _CACHED_PANEL_SOURCE;
}
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
export default {
	async fetch(request) {
		const url = new URL(request.url);
		if (url.pathname === "/api/token-template") return J(tokenTemplateInfo());
		if (url.pathname === "/api/token-template/redirect") return Response.redirect(tokenTemplateUrl(), 302);
		if (url.pathname === "/api/accounts" && request.method === "POST") {
			const b = await request.json().catch(() => ({}));
			try { return J({ accounts: await listAccounts(String(b.token || "").trim()) }); } catch (e) { return J({ error: e.message }, 400); }
		}
		if (url.pathname === "/api/resources" && request.method === "POST") {
			const b = await request.json().catch(() => ({}));
			try { return J(await listResources(String(b.token || "").trim(), b.accountId || undefined)); } catch (e) { return J({ error: e.message }, 400); }
		}
		if (url.pathname === "/api/deploy" && request.method === "POST") {
			const b = await request.json().catch(() => ({}));
			const enc = new TextEncoder();
			const stream = new TransformStream();
			const w = stream.writable.getWriter();
			const send = (o) => w.write(enc.encode(JSON.stringify(o) + "\n")).catch(() => {});
			(async () => {
				try {
					const result = await deployPanel({ ...b, source: getPanelSource() }, (step, message, status) => send({ type: "log", step, message, status }));
					await send({ type: "done", result });
				} catch (e) { await send({ type: "error", message: e.message }); }
				w.close().catch(() => {});
			})();
			return new Response(stream.readable, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
		}
		if (url.pathname === "/health") return J({ ok: true, name: "Oryvex Deployer", version: "1.0.6" });
		return new Response(PAGE, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
	},
};
const PAGE = String.raw`<!DOCTYPE html><html lang="en" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Oryvex Deployer</title>
<meta name="color-scheme" content="dark light">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='20' fill='%23792370'/%3E%3Cpath d='M32 12.5a19.5 19.5 0 1 0 19.5 19.5' fill='none' stroke='%23e48ed8' stroke-width='7' stroke-linecap='round'/%3E%3Ccircle cx='48.5' cy='15.5' r='5.2' fill='%237aa2ff'/%3E%3Cpath d='M24.5 27.5L32 35.5l7.5-8' fill='none' stroke='%23F1FFF9' stroke-width='4.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<script>try{if(localStorage.getItem('ox-theme')==='light')document.documentElement.classList.remove('dark')}catch(e){}</script>
<style id="ox-ui">:root,:host{--font-sans: "Geist","Vazirmatn",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}:root{--ox-bg: oklch(0.972 0.005 320);--ox-surface: oklch(0.995 0.002 320);--ox-surface-2: oklch(0.955 0.007 320);--ox-surface-3: oklch(0.928 0.009 320);--ox-line: oklch(0.905 0.008 320);--ox-line-2: oklch(0.845 0.012 320);--ox-ink: oklch(0.235 0.02 320);--ox-ink-2: oklch(0.45 0.02 320);--ox-ink-3: oklch(0.585 0.018 320);--ox-accent: oklch(0.52 0.17 332);--ox-accent-hover: oklch(0.47 0.165 332);--ox-accent-ink: oklch(0.99 0.004 332);--ox-accent-soft: oklch(0.52 0.17 332 / 0.1);--ox-accent-line: oklch(0.52 0.17 332 / 0.32);--ox-ok: oklch(0.56 0.15 150);--ox-bad: oklch(0.56 0.2 25);--ox-warn: oklch(0.66 0.15 62);--ox-info: oklch(0.55 0.1 228);--ox-grape: oklch(0.52 0.15 302);--ox-scrim: oklch(0.2 0.02 320 / 0.42);--ox-pop-shadow: 0 1px 0 oklch(0.2 0.02 320 / 0.04),0 18px 48px -18px oklch(0.2 0.03 320 / 0.35);--ox-r-card: 16px;--ox-r-ctl: 10px;--ox-r-chip: 8px;--ox-d-color-in: 0.12s;--ox-d-color-out: 0.28s;--ox-d-fade: 0.2s;--ox-d-scale: 0.22s;--ox-d-slide: 0.26s;--ox-e-out: cubic-bezier(0.2, 0.7, 0.2, 1);--ox-e-in: cubic-bezier(0.4, 0, 1, 1);--ox-e-std: cubic-bezier(0.4, 0, 0.2, 1);color-scheme: light}html.dark{--ox-bg: oklch(0.155 0.008 320);--ox-surface: oklch(0.195 0.011 320);--ox-surface-2: oklch(0.232 0.013 320);--ox-surface-3: oklch(0.27 0.015 320);--ox-line: oklch(0.285 0.014 320);--ox-line-2: oklch(0.36 0.017 320);--ox-ink: oklch(0.95 0.006 320);--ox-ink-2: oklch(0.77 0.014 320);--ox-ink-3: oklch(0.63 0.016 320);--ox-accent: oklch(0.76 0.14 332);--ox-accent-hover: oklch(0.81 0.12 332);--ox-accent-ink: oklch(0.2 0.05 332);--ox-accent-soft: oklch(0.76 0.14 332 / 0.13);--ox-accent-line: oklch(0.76 0.14 332 / 0.38);--ox-ok: oklch(0.78 0.16 150);--ox-bad: oklch(0.7 0.17 22);--ox-warn: oklch(0.82 0.14 75);--ox-info: oklch(0.77 0.095 228);--ox-grape: oklch(0.75 0.13 302);--ox-scrim: oklch(0.08 0.01 320 / 0.66);--ox-pop-shadow: 0 0 0 1px oklch(1 0 0 / 0.02),0 24px 60px -20px oklch(0 0 0 / 0.7);color-scheme: dark}@keyframes ox-fade-in{from{opacity: 0}to{opacity: 1}}@keyframes ox-fade-out{from{opacity: 1}to{opacity: 0}}@keyframes ox-scale-in{from{opacity: 0;transform: scale(0.96)}to{opacity: 1;transform: none}}@keyframes ox-scale-out{from{opacity: 1;transform: none}to{opacity: 0;transform: scale(0.96)}}@keyframes ox-slide-in{from{opacity: 0;transform: translateY(10px)}to{opacity: 1;transform: none}}@keyframes ox-slide-out{from{opacity: 1;transform: none}to{opacity: 0;transform: translateY(10px)}}@keyframes ox-slide-in-x{from{opacity: 0;transform: translateX(24px)}to{opacity: 1;transform: none}}@keyframes ox-slide-out-x{from{opacity: 1;transform: none}to{opacity: 0;transform: translateX(24px)}}@keyframes ox-slide-in-y{from{opacity: 0;transform: translateY(-14px)}to{opacity: 1;transform: none}}@keyframes ox-slide-out-y{from{opacity: 1;transform: none}to{opacity: 0;transform: translateY(-14px)}}@keyframes ox-color-in{from{background-color: var(--ox-accent-soft);box-shadow: inset 0 0 0 1px var(--ox-accent-line)}}@keyframes ox-color-out{to{background-color: transparent;box-shadow: inset 0 0 0 1px transparent}}@keyframes ox-fade-loop{from{opacity: 1}to{opacity: 0.35}}@keyframes spin{to{transform: rotate(360deg)}}.oxa-backdrop{position: fixed;inset: 0;z-index: 10060;display: grid;place-items: center;padding: 20px;background: var(--ox-scrim);animation: ox-fade-in var(--ox-d-fade) var(--ox-e-out) both}.oxa-backdrop.oxa-leaving{animation: ox-fade-out 0.18s var(--ox-e-in) both;pointer-events: none}.oxa-popup{position: relative;width: 100%;max-width: 420px;display: flex;flex-direction: column;align-items: center;text-align: center;padding: 32px 26px 22px;border-radius: 20px;background: var(--ox-surface);border: 1px solid var(--ox-line);box-shadow: var(--ox-pop-shadow);color: var(--ox-ink);font-family: var(--font-sans);animation: ox-scale-in var(--ox-d-scale) var(--ox-e-out) both}.oxa-leaving .oxa-popup{animation: ox-scale-out 0.18s var(--ox-e-in) both}.oxa-icon{--oxa-c: var(--ox-accent);width: 68px;height: 68px;flex: none;border-radius: 50%;display: grid;place-items: center;margin: 0 0 18px;color: var(--oxa-c);border: 3px solid var(--oxa-c);@supports (color: color-mix(in lab, red, red)){border: 3px solid color-mix(in oklch,var(--oxa-c) 30%, transparent)}background: var(--oxa-c);@supports (color: color-mix(in lab, red, red)){background: color-mix(in oklch,var(--oxa-c) 10%, transparent)}animation: ox-scale-in 0.3s var(--ox-e-out) 0.06s both}.oxa-icon svg{width: 32px;height: 32px;animation: ox-fade-in 0.24s var(--ox-e-out) 0.16s both}.oxa-icon--success{--oxa-c: var(--ox-ok)}.oxa-icon--error{--oxa-c: var(--ox-bad)}.oxa-icon--warning{--oxa-c: var(--ox-warn)}.oxa-icon--info{--oxa-c: var(--ox-info)}.oxa-icon--question{--oxa-c: var(--ox-accent)}.oxa-title{margin: 0 0 8px;font-size: 21px;line-height: 1.25;font-weight: 700;letter-spacing: -0.02em;color: var(--ox-ink)}.oxa-text{margin: 0;font-size: 15px;line-height: 1.55;color: var(--ox-ink-2);white-space: pre-line;word-break: break-word}.oxa-text b,.oxa-text strong{color: var(--ox-ink)}.oxa-input{width: 100%;margin-top: 16px;min-height: 44px;padding: 0 14px;border-radius: var(--ox-r-ctl);border: 1px solid var(--ox-line-2);background: var(--ox-bg);color: var(--ox-ink);font: 500 15px var(--font-sans)}.oxa-input:focus{outline: none;border-color: var(--ox-accent);box-shadow: 0 0 0 3px var(--ox-accent-soft)}.oxa-actions{display: flex;gap: 10px;width: 100%;margin-top: 24px}.oxa-actions.oxa-reverse{flex-direction: row-reverse}.oxa-btn{flex: 1;min-height: 46px;padding: 0 18px;border: 0;border-radius: 12px;cursor: pointer;display: inline-flex;align-items: center;justify-content: center;gap: 8px;font: 600 15px/1 var(--font-sans);letter-spacing: -0.005em}.oxa-confirm{background: var(--ox-accent);color: var(--ox-accent-ink)}.oxa-confirm.oxa-danger{background: var(--ox-bad);color: oklch(0.99 0.004 25)}.oxa-deny{background: var(--ox-bad);@supports (color: color-mix(in lab, red, red)){background: color-mix(in oklch,var(--ox-bad) 14%, transparent)}color: var(--ox-bad)}.oxa-cancel{background: var(--ox-surface-2);color: var(--ox-ink);box-shadow: inset 0 0 0 1px var(--ox-line)}@media (hover: hover){.oxa-confirm:hover{background: var(--ox-accent-hover)}.oxa-confirm.oxa-danger:hover{background: var(--ox-bad);@supports (color: color-mix(in lab, red, red)){background: color-mix(in oklch,var(--ox-bad) 88%, black)}}.oxa-cancel:hover{background: var(--ox-surface-3)}.oxa-deny:hover{background: var(--ox-bad);@supports (color: color-mix(in lab, red, red)){background: color-mix(in oklch,var(--ox-bad) 22%, transparent)}}}.oxa-close{position: absolute;top: 12px;right: 12px;width: 32px;height: 32px;border: 0;border-radius: 9px;display: grid;place-items: center;cursor: pointer;background: transparent;color: var(--ox-ink-3)}.oxa-close:hover{background: var(--ox-surface-2);color: var(--ox-ink)}.oxa-close svg{width: 16px;height: 16px}.oxa-timer{position: absolute;left: 20px;right: 20px;bottom: 0;height: 3px;border-radius: 3px;overflow: hidden}.oxa-timer i{display: block;height: 100%;background: var(--ox-accent);opacity: 0.55;transform-origin: left}.oxa-toasts{position: fixed;z-index: 10070;top: max(16px,env(safe-area-inset-top));right: 16px;display: flex;flex-direction: column;align-items: flex-end;gap: 8px;width: min(380px,calc(100vw - 24px));pointer-events: none}.oxa-toast{--oxa-c: var(--ox-ok);position: relative;overflow: hidden;pointer-events: auto;cursor: pointer;display: flex;align-items: center;gap: 12px;width: 100%;padding: 12px 14px 12px 12px;border-radius: 14px;border: 1px solid var(--ox-line);background: var(--ox-surface);color: var(--ox-ink);box-shadow: var(--ox-pop-shadow);font: 600 14px/1.4 var(--font-sans);animation: ox-slide-in-x var(--ox-d-slide) var(--ox-e-out) both}.oxa-toast.oxa-leaving{animation: ox-slide-out-x 0.2s var(--ox-e-in) both}.oxa-toast-ic{flex: none;width: 30px;height: 30px;border-radius: 50%;display: grid;place-items: center;color: var(--oxa-c);background: var(--oxa-c);@supports (color: color-mix(in lab, red, red)){background: color-mix(in oklch,var(--oxa-c) 14%, transparent)}border: 2px solid var(--oxa-c);@supports (color: color-mix(in lab, red, red)){border: 2px solid color-mix(in oklch,var(--oxa-c) 28%, transparent)}}.oxa-toast-ic svg{width: 16px;height: 16px}.oxa-toast-msg{flex: 1;min-width: 0;word-break: break-word}.oxa-toast-bar{position: absolute;left: 0;bottom: 0;height: 3px;width: 100%;background: var(--oxa-c);opacity: 0.5;transform-origin: left}.oxa-toast--error{--oxa-c: var(--ox-bad)}.oxa-toast--warning{--oxa-c: var(--ox-warn)}.oxa-toast--info{--oxa-c: var(--ox-info)}.oxa-toast--question{--oxa-c: var(--ox-accent)}@media (max-width: 640px){.oxa-toasts{right: 50%;transform: translateX(50%);align-items: stretch}.oxa-toast{animation-name: ox-slide-in-y}.oxa-toast.oxa-leaving{animation-name: ox-slide-out-y}.oxa-backdrop{align-items: end;padding: 12px}.oxa-popup{max-width: none;border-radius: 22px;padding: 28px 20px 18px;animation-name: ox-slide-in}.oxa-leaving .oxa-popup{animation-name: ox-slide-out}}</style><script id="ox-alert">(function () {
	if (window.OxAlert) return;
	var ICONS = {
		success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
		error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10M17 7L7 17"/></svg>',
		warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5.5v8"/><path d="M12 18.4h.01"/></svg>',
		info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10.5v8"/><path d="M12 5.6h.01"/></svg>',
		question: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9.2a3 3 0 1 1 4.2 2.8c-.8.4-1.2 1-1.2 1.9v.6"/><path d="M12 18.3h.01"/></svg>'
	};
	var CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';
	var current = null;
	function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
	function lockScroll(on) { document.documentElement.classList.toggle('ox-scroll-lock', !!on || !!document.querySelector('div[id$="-modal"]:not(.opacity-0)')); }
	function normIcon(i) { if (i === 'warn') return 'warning'; if (i === 'ok') return 'success'; return ICONS[i] ? i : null; }

	function fire(opts) {
		if (typeof opts === 'string') opts = { title: arguments[0], text: arguments[1], icon: arguments[2] };
		opts = opts || {};
		if (opts.toast) return toast(opts);
		if (current) current.close({ isDismissed: true, dismiss: 'replaced' }, true);
		return new Promise(function (resolve) {
			var lastFocus = document.activeElement;
			var back = el('div', 'oxa-backdrop');
			var pop = el('div', 'oxa-popup');
			pop.setAttribute('role', opts.icon === 'error' || opts.icon === 'warning' ? 'alertdialog' : 'dialog');
			pop.setAttribute('aria-modal', 'true');
			var icon = normIcon(opts.icon);
			if (icon) pop.appendChild(el('div', 'oxa-icon oxa-icon--' + icon, ICONS[icon]));
			if (opts.title) { var t = el('h2', 'oxa-title'); t.id = 'oxa-title-' + Date.now(); t.textContent = opts.title; pop.appendChild(t); pop.setAttribute('aria-labelledby', t.id); }
			if (opts.html) pop.appendChild(el('div', 'oxa-text', opts.html));
			else if (opts.text) { var p = el('p', 'oxa-text'); p.textContent = opts.text; pop.appendChild(p); }
			var input = null;
			if (opts.input) {
				input = el(opts.input === 'textarea' ? 'textarea' : 'input', 'oxa-input');
				if (opts.input !== 'textarea') input.type = opts.input === 'password' ? 'password' : (opts.input === 'number' ? 'number' : 'text');
				if (opts.inputValue != null) input.value = opts.inputValue;
				if (opts.inputPlaceholder) input.placeholder = opts.inputPlaceholder;
				pop.appendChild(input);
			}
			var acts = el('div', 'oxa-actions' + (opts.reverseButtons ? ' oxa-reverse' : ''));
			var bCancel = null, bDeny = null;
			if (opts.showCancelButton) { bCancel = el('button', 'oxa-btn oxa-cancel'); bCancel.type = 'button'; bCancel.textContent = opts.cancelButtonText || 'Cancel'; acts.appendChild(bCancel); }
			if (opts.showDenyButton) { bDeny = el('button', 'oxa-btn oxa-deny'); bDeny.type = 'button'; bDeny.textContent = opts.denyButtonText || 'No'; acts.appendChild(bDeny); }
			var bOk = null;
			if (opts.showConfirmButton !== false) { bOk = el('button', 'oxa-btn oxa-confirm' + (opts.danger ? ' oxa-danger' : '')); bOk.type = 'button'; bOk.textContent = opts.confirmButtonText || 'OK'; acts.appendChild(bOk); }
			if (acts.children.length) pop.appendChild(acts);
			if (opts.showCloseButton) { var bx = el('button', 'oxa-close', CLOSE); bx.type = 'button'; bx.setAttribute('aria-label', 'Close'); bx.onclick = function () { close({ isDismissed: true, dismiss: 'close' }); }; pop.appendChild(bx); }
			var timerId = null;
			if (opts.timer) {
				var bar = el('div', 'oxa-timer', '<i></i>'); pop.appendChild(bar);
				var i = bar.firstChild; if (i.animate) i.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: opts.timer, easing: 'linear', fill: 'forwards' });
				timerId = setTimeout(function () { close({ isDismissed: true, dismiss: 'timer' }); }, opts.timer);
			}
			back.appendChild(pop);
			document.body.appendChild(back);
			lockScroll(true);
			var done = false;
			function close(result, instant) {
				if (done) return; done = true;
				clearTimeout(timerId);
				document.removeEventListener('keydown', onKey, true);
				if (current && current.back === back) current = null;
				var finish = function () { if (back.parentNode) back.parentNode.removeChild(back); lockScroll(!!current); };
				if (instant) finish(); else { back.classList.add('oxa-leaving'); setTimeout(finish, 200); }
				try { if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); } catch (e) {}
				resolve(Object.assign({ isConfirmed: false, isDenied: false, isDismissed: false, value: undefined }, result));
			}
			function onKey(e) {
				if (e.key === 'Escape' && opts.allowEscapeKey !== false) { e.preventDefault(); e.stopPropagation(); close({ isDismissed: true, dismiss: 'esc' }); }
				else if (e.key === 'Enter' && document.activeElement !== bCancel && document.activeElement !== bDeny && (!input || input.tagName !== 'TEXTAREA') && bOk) { e.preventDefault(); bOk.click(); }
				else if (e.key === 'Tab') {
					var f = pop.querySelectorAll('button,input,textarea'); if (!f.length) return;
					var first = f[0], last = f[f.length - 1];
					if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
					else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
				}
			}
			document.addEventListener('keydown', onKey, true);
			if (bOk) bOk.onclick = function () { close({ isConfirmed: true, value: input ? input.value : true }); };
			if (bCancel) bCancel.onclick = function () { close({ isDismissed: true, dismiss: 'cancel' }); };
			if (bDeny) bDeny.onclick = function () { close({ isDenied: true, value: false }); };
			back.addEventListener('mousedown', function (e) { if (e.target === back && opts.allowOutsideClick !== false) close({ isDismissed: true, dismiss: 'backdrop' }); });
			current = { back: back, close: close };
			setTimeout(function () { try { (input || bOk || bCancel || pop).focus({ preventScroll: true }); } catch (e) {} }, 40);
		});
	}

	function toastBox() {
		var c = document.querySelector('.oxa-toasts');
		if (!c) { c = el('div', 'oxa-toasts'); c.setAttribute('aria-live', 'polite'); document.body.appendChild(c); }
		return c;
	}
	function toast(opts) {
		if (typeof opts === 'string') opts = { title: opts };
		opts = opts || {};
		var icon = normIcon(opts.icon) || 'success';
		var life = opts.timer || (icon === 'error' ? 4600 : 3000);
		var c = toastBox();
		var t = el('div', 'oxa-toast oxa-toast--' + icon);
		t.setAttribute('role', icon === 'error' ? 'alert' : 'status');
		t.appendChild(el('span', 'oxa-toast-ic', ICONS[icon]));
		var m = el('span', 'oxa-toast-msg'); m.textContent = String(opts.title == null ? (opts.text || '') : opts.title); t.appendChild(m);
		var bar = el('i', 'oxa-toast-bar'); t.appendChild(bar);
		c.appendChild(t);
		while (c.children.length > 4) c.removeChild(c.firstElementChild);
		if (bar.animate) bar.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: life, easing: 'linear', fill: 'forwards' });
		return new Promise(function (resolve) {
			var gone = false;
			function close() { if (gone) return; gone = true; t.classList.add('oxa-leaving'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); resolve({ isDismissed: true }); }, 210); }
			t.addEventListener('click', close);
			setTimeout(close, life);
		});
	}
	function confirmBox(text, o) {
		o = o || {};
		var danger = o.danger != null ? o.danger : /delete|remove|reset|wipe|erase|sign out|log ?out|disable|revoke/i.test(String(text));
		return fire(Object.assign({ icon: danger ? 'warning' : 'question', title: o.title || (danger ? 'Are you sure?' : 'Please confirm'), text: text, showCancelButton: true, confirmButtonText: danger ? 'Yes, do it' : 'Confirm', cancelButtonText: 'Cancel', danger: danger }, o)).then(function (r) { return !!r.isConfirmed; });
	}
	window.OxAlert = { fire: fire, toast: toast, confirm: confirmBox, close: function () { if (current) current.close({ isDismissed: true, dismiss: 'api' }); }, isVisible: function () { return !!current; } };
	if (!window.Swal) window.Swal = window.OxAlert;
})();
</script>
<style>
:root{--bg:#f5f5f7;--surface:#fff;--field:#fff;--fill:rgba(118,118,128,.12);--fill2:rgba(118,118,128,.08);--ink:#1d1d1f;--ink2:#6e6e73;--ink3:#86868b;--line:rgba(0,0,0,.08);--line2:#d2d2d7;--a:#9e3a93;--a3:rgba(13,138,123,.12);--aink:#fff;--c2:#0066cc;--ok:#248a3d;--bad:#e30000;--warn:#c93400;--nav:rgba(251,251,253,.78);--shadow:0 1px 1px rgba(0,0,0,.02),0 4px 16px rgba(0,0,0,.05);--spring:cubic-bezier(.22,1,.36,1);color-scheme:light}
html.dark{--bg:#000;--surface:#171318;--field:#171318;--fill:rgba(118,118,128,.24);--fill2:rgba(118,118,128,.16);--ink:#f5f5f7;--ink2:#a1a1a6;--ink3:#86868b;--line:rgba(255,255,255,.1);--line2:#3a3040;--a:#e48ed8;--a3:rgba(228,142,216,.16);--aink:#2a0f27;--c2:#e48ed8;--ok:#30d158;--bad:#ff453a;--warn:#ff9f0a;--nav:rgba(22,22,23,.72);--shadow:none;color-scheme:dark}
*{box-sizing:border-box}html,body{margin:0}
body{min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Geist',system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.47;letter-spacing:-.01em;-webkit-font-smoothing:antialiased;transition:background-color .45s ease,color .45s ease}
*,*::before,*::after{transition-property:background-color,border-color,color,fill,stroke,box-shadow,opacity;transition-duration:.28s;transition-timing-function:var(--spring)}
html.theming *,html.theming *::before,html.theming *::after{transition:background-color .55s ease,border-color .55s ease,color .55s ease,fill .55s ease,stroke .55s ease,box-shadow .55s ease!important}
::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}
::view-transition-new(root){z-index:2}
header{position:sticky;top:0;z-index:20;background:var(--nav);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}
header::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;opacity:.55}
.bar{max-width:760px;margin:0 auto;min-height:68px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.brand{display:flex;align-items:center;gap:12px}
.brand svg{width:38px;height:38px;border-radius:12px;box-shadow:0 4px 14px color-mix(in srgb,var(--a) 28%,transparent);flex:none}
.word{font-weight:700;font-size:18px;letter-spacing:.14em;line-height:1}
.tag{display:block;font-size:9.5px;letter-spacing:.2em;font-weight:600;color:var(--ink2);margin-top:4px}
.ver{font:600 11px/1 'Geist',sans-serif;background:var(--a3);color:var(--a);padding:5px 9px;border-radius:999px;margin-left:6px}
.pill{display:flex;gap:4px;padding:4px;border-radius:999px;background:var(--fill2)}
.ibtn{width:36px;height:36px;border-radius:50%;border:0;background:transparent;color:var(--ink2);display:inline-grid;place-items:center;cursor:pointer;padding:0;flex:none;aspect-ratio:1/1}
.ibtn:hover{background:var(--fill2);color:var(--ink)}.ibtn:active{transform:scale(.92)}
.ibtn svg{width:19px;height:19px}
html.dark .moon{display:none}html:not(.dark) .sun{display:none}
.wrap{max-width:760px;margin:0 auto;padding:24px 16px 8px}
.card{background:var(--surface);border-radius:20px;padding:22px;margin-bottom:16px;box-shadow:var(--shadow)}
html.dark .card{box-shadow:inset 0 0 0 1px var(--line)}
h2{font-size:17px;font-weight:700;margin:0 0 4px;letter-spacing:-.02em;display:flex;align-items:center;gap:10px}
.sub{color:var(--ink2);font-size:14px}
.cnt{font:700 11px/1 'Geist',sans-serif;background:var(--fill);color:var(--ink2);padding:4px 8px;border-radius:999px}
label{display:block;font-weight:600;font-size:13px;margin:14px 0 6px}
input[type=text],input[type=password],select{width:100%;height:46px;border-radius:12px;border:1px solid var(--line2);background:var(--field);color:var(--ink);padding:0 14px;font-family:inherit;font-size:15px;outline:none}
input:focus,select:focus{border-color:var(--a);box-shadow:0 0 0 4px var(--a3)}
.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:540px){.row{grid-template-columns:1fr}.tk .btn{width:100%}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 20px;border:0;border-radius:999px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap;background:var(--fill);color:var(--ink)}
.btn:hover:not(:disabled){filter:brightness(1.08)}.btn:active{transform:scale(.97)}.btn:disabled{opacity:.5;cursor:not-allowed}
.primary{background:var(--a);color:var(--aink);width:100%;margin-top:20px;height:48px;font-size:15px}
.sm{height:32px;padding:0 14px;font-size:12.5px}
.chk{display:flex;gap:12px;align-items:flex-start;margin-top:14px;color:var(--ink2);font-size:13px;font-weight:500;cursor:pointer}
.chk input{appearance:none;-webkit-appearance:none;flex:none;margin:2px 0 0;width:20px;height:20px;aspect-ratio:1/1;border-radius:50%;border:1.5px solid var(--line2);background:var(--field);display:inline-grid;place-content:center;cursor:pointer}
.chk input::after{content:"";width:9px;height:5px;border-left:2px solid var(--aink);border-bottom:2px solid var(--aink);transform:translateY(-1px) rotate(-45deg) scale(0);transition:transform .2s var(--spring)}
.chk input:checked{background:var(--a);border-color:var(--a)}.chk input:checked::after{transform:translateY(-1px) rotate(-45deg) scale(1)}
details{margin-top:16px;color:var(--ink2);font-size:13px;border-top:1px solid var(--line);padding-top:14px}
summary{cursor:pointer;font-weight:700;color:var(--ink)}
.tk{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap}.tk p{margin:0;color:var(--ink2);font-size:13.5px;max-width:380px}
#log{font-family:'Geist Mono',ui-monospace,monospace;font-size:12.5px;line-height:1.75;display:none}
#log div{display:flex;gap:10px;padding:3px 0}
.ok{color:var(--ok)}.warn{color:var(--warn)}.err{color:var(--bad)}.run{color:var(--ink2)}
#res{display:none;text-align:center}
#res .badge{display:inline-grid;place-items:center;width:56px;height:56px;border-radius:50%;background:var(--a3);color:var(--a);font-size:28px;margin-bottom:12px;aspect-ratio:1/1}
#res a.big{display:block;margin-top:16px;padding:16px;border-radius:14px;background:var(--a3);color:var(--a);font-family:'Geist Mono',monospace;font-weight:700;word-break:break-all;text-decoration:none}
.fine{color:var(--ink3);font-size:12.5px;margin-top:12px;text-align:center}
.res{display:none}.res.show{display:block;animation:rise .5s var(--spring)}
@keyframes rise{from{opacity:0;scale:.97}to{opacity:1;scale:1}}@keyframes ox-fadein{from{opacity:0}to{opacity:1}}@keyframes ox-fadeout{from{opacity:1}to{opacity:0}}@keyframes ox-scalein{from{opacity:0;scale:.95}to{opacity:1;scale:1}}@keyframes ox-scaleout{from{opacity:1;scale:1}to{opacity:0;scale:.95}}@keyframes ox-slidein{from{opacity:0;clip-path:inset(0 0 100% 0)}to{opacity:1;clip-path:inset(0)}}@keyframes ox-slideout{from{opacity:1;clip-path:inset(0)}to{opacity:0;clip-path:inset(0 0 100% 0)}}@keyframes ox-colorin{from{box-shadow:0 0 0 0 rgba(228,142,216,.5)}}@keyframes ox-colorout{to{box-shadow:0 0 0 8px rgba(228,142,216,0)}}button,a,label,input,select,textarea{transition-property:color,background-color,border-color,box-shadow,opacity,filter,scale!important;transition-duration:.42s!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important}@media(hover:hover){button:hover,a:hover,label:hover{transition-duration:.14s!important;transform:none!important;translate:none!important}}button:active:not(:disabled){transform:none!important;scale:.96!important;transition-duration:.08s!important}
.item{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;background:var(--fill2);margin-top:8px}
.item .ic{width:36px;height:36px;border-radius:50%;background:var(--a3);color:var(--a);display:grid;place-items:center;flex:none;aspect-ratio:1/1}
.item .ic svg{width:18px;height:18px}
.item .mid{min-width:0;flex:1}.item b{display:block;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.item small{color:var(--ink3);font-size:12px}
.item .acts{display:flex;gap:6px;flex:none}
.empty{color:var(--ink3);font-size:13.5px;padding:14px 4px}
.skel{height:58px;border-radius:14px;margin-top:8px;background-size:200% 100%;animation:sh 1.2s linear infinite}
@keyframes sh{to{background-position:-200% 0}}
.credit{display:flex;justify-content:center;align-items:center;gap:8px;margin:28px auto 28px;font:600 12px/1 'Geist',sans-serif;letter-spacing:.06em;color:var(--ink3)}
.credit b{color:#e48ed8}
.credit i{width:5px;height:5px;border-radius:50%;background:var(--a);display:inline-block}
.ox-foot{position:relative;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;width:100%;max-width:1068px;margin:0 auto;padding:12px 14px 12px 12px;border-radius:22px;border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 76%,transparent);-webkit-backdrop-filter:saturate(170%) blur(22px);backdrop-filter:saturate(170%) blur(22px);font-size:12.5px;color:var(--ink2)}
.ox-foot-brand{display:flex;align-items:center;gap:10px;min-width:0}
.ox-foot-mark{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:var(--a3);color:var(--a);flex:none}.ox-foot-mark svg{width:18px;height:18px}
.ox-foot-name{color:var(--ink);font-weight:600;letter-spacing:.12em;font-size:12px}
.ox-foot-ver{font:500 11px/1 'Geist Mono',monospace;color:var(--a);background:var(--a3);padding:4px 7px;border-radius:999px}
.ox-foot-by{display:flex;align-items:center;gap:8px;font-weight:500}.ox-foot-by b{font-weight:700;color:#e48ed8}
.ox-foot-dot{width:6px;height:6px;border-radius:50%;background:var(--a);box-shadow:0 0 0 3px var(--a3)}
.ox-foot-links{display:flex;gap:6px}.ox-foot-links a{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;color:var(--ink2);background:var(--fill2);font-weight:600;font-size:12.5px;text-decoration:none;transition:background-color .24s cubic-bezier(.4,0,.2,1),color .24s cubic-bezier(.4,0,.2,1)}
.ox-foot-links a svg{width:15px;height:15px}.ox-foot-links a:hover{color:var(--ink);background:var(--fill)}
@media(max-width:720px){.ox-foot{flex-direction:column;justify-content:center;text-align:center;padding:14px}.ox-foot-brand,.ox-foot-links{justify-content:center}}
html{overscroll-behavior-y:none}
body{min-height:100dvh;display:flex;flex-direction:column;padding:0 16px}
header{position:sticky;top:12px;z-index:45;width:100%;max-width:1068px;margin:12px auto 0;border-radius:24px;border:1px solid var(--line);background:color-mix(in srgb,var(--surface) 74%,transparent);box-shadow:0 10px 30px -18px rgba(0,0,0,.35);animation:rise .45s var(--spring) both}
header::after{left:24px;right:24px;bottom:-1px;opacity:.5}
.bar{max-width:none;padding:10px 14px 10px 12px}
.wrap{flex:1 0 auto;width:100%;max-width:760px;padding:24px 0 8px}
.card{border-radius:24px;animation:rise .45s var(--spring) both}
.card:nth-of-type(2){animation-delay:.05s}.card:nth-of-type(3){animation-delay:.1s}
.btn,.ibtn,input,select,.item{transition:background-color .24s cubic-bezier(.4,0,.2,1),border-color .24s cubic-bezier(.4,0,.2,1),color .24s cubic-bezier(.4,0,.2,1),box-shadow .24s cubic-bezier(.4,0,.2,1),transform .2s cubic-bezier(.4,0,.2,1),opacity .24s}
.primary{border-radius:999px}
body>.ox-foot{margin:28px auto max(16px,env(safe-area-inset-bottom))}
@media(max-width:720px){header{top:8px;margin-top:8px;border-radius:20px}body{padding:0 10px}.word{font-size:16px}.tag{font-size:8.5px}.card{padding:18px;border-radius:20px}.item{flex-wrap:wrap}.item .acts{width:100%}.item .acts .btn{flex:1}}
@media(max-width:380px){.ver{display:none}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
</style></head><body>
<header><div class="bar"><div class="brand"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#792370"/><path d="M40.6 14.2A19 19 0 1 0 50.9 29" fill="none" stroke="#fdeefa" stroke-width="6.4" stroke-linecap="round"/><circle cx="47" cy="17" r="4.6" fill="#f7d0f0"/><path d="M24.4 28.2 32 36.4l7.6-8.2" fill="none" stroke="#fdeefa" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
<div><span class="word">ORYVEX</span><span class="ver">v1.0.6</span><span class="tag">DEPLOYER · BY MUVIXO</span></div></div>
<div class="pill"><button class="ibtn" id="theme" type="button" title="Toggle theme" aria-label="Toggle theme"><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z"/></svg></button></div></div></header>
<div class="wrap">
<div class="card"><div class="tk"><p><b>Need a Cloudflare API token?</b> Creates a pre-configured token with D1 and Worker edit permissions.</p><a class="btn" id="tpl" href="/api/token-template/redirect" target="_blank" rel="noopener">Create token (template)</a></div></div>
<div class="card"><form id="f" autocomplete="off">
<label for="token" style="margin-top:0">Cloudflare API token</label><input type="password" id="token" placeholder="Paste your API token here" required>
<div class="row"><div><label for="wn">Worker name</label><input type="text" id="wn" value="oryvex-panel"></div><div><label for="db">D1 database name</label><input type="text" id="db" placeholder="auto"></div></div>
<div id="accBox" style="display:none"><label for="acc">Account</label><select id="acc"></select></div>
<details><summary>Advanced Options</summary>
<label for="repo">GitHub repo for updates (user/repo)</label><input type="text" id="repo" value="oryvexofficial/OryvexWorkerPanel">
<label class="chk"><input type="checkbox" id="obf" checked><span><b>Obfuscate before deploy:</b> Pack and obfuscate the worker script before sending to Cloudflare.</span></label>
<label class="chk"><input type="checkbox" id="store"><span><b>Remember token:</b> Store token inside panel for one-click in-panel updates. Off by default.</span></label>
</details>
<button class="btn primary" id="go" type="submit">Deploy panel</button>
<div class="fine">Your token is only used for this deployment and is never stored on any server.</div></form></div>
<div class="card res" id="panelsCard"><h2>Your panels <span class="cnt" id="panelsCnt">0</span></h2><div class="sub">Workers on this account. Pick one to update it in place.</div><div id="panelsList"></div></div>
<div class="card res" id="dbsCard"><h2>Your DBs <span class="cnt" id="dbsCnt">0</span></h2><div class="sub">D1 databases on this account. Pick one to reuse it, users are kept.</div><div id="dbsList"></div></div>
<div class="card" id="log"></div>
<div class="card" id="res"><div class="badge">&#10003;</div><h2 style="justify-content:center">Panel Deployed</h2><div class="sub">Open the link below to set up your administrator credentials.</div><a class="big" id="link" target="_blank" rel="noopener"></a></div>
</div>
<footer class="ox-foot" role="contentinfo"><div class="ox-foot-brand"><span class="ox-foot-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M8.2 11.2l3.8 3.8 3.8-3.8"/></svg></span><span class="ox-foot-name">ORYVEX</span><span class="ox-foot-ver">v1.0.6</span></div><div class="ox-foot-by"><i class="ox-foot-dot"></i><span>Created by <b>Muvixo</b></span></div><nav class="ox-foot-links"><a href="https://github.com/oryvexofficial/OryvexWorkerPanel" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>GitHub</a></nav></footer>
<script>
const $=id=>document.getElementById(id);
$('theme').addEventListener('click',()=>{const r=document.documentElement,toLight=r.classList.contains('dark');const apply=()=>{r.classList.toggle('dark',!toLight);try{localStorage.setItem('ox-theme',toLight?'light':'dark')}catch(e){}};
const b=$('theme').getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2,rad=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const t=document.startViewTransition(apply);t.ready.then(()=>{r.animate({clipPath:['circle(0px at '+x+'px '+y+'px)','circle('+rad+'px at '+x+'px '+y+'px)']},{duration:650,easing:'cubic-bezier(.22,1,.36,1)',pseudoElement:'::view-transition-new(root)'})}).catch(()=>{})}
else{r.classList.add('theming');apply();setTimeout(()=>r.classList.remove('theming'),650)}});
const ICON_PANEL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="12" rx="2.5"/><path d="M8 20h8M12 16v4"/></svg>';
const ICON_DB='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7.5" ry="3"/><path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/></svg>';
const fmtDate=s=>{if(!s)return'';const d=new Date(s);return isNaN(d)?'':d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})};
const fmtSize=n=>n==null?'':n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
function mk(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function btn(txt,fn,href){const e=mk(href?'a':'button','btn sm',txt);if(href){e.href=href;e.target='_blank';e.rel='noopener'}else e.type='button';if(fn)e.onclick=fn;return e}
function row(icon,title,meta,acts){const r=mk('div','item'),ic=mk('div','ic');ic.innerHTML=icon;const mid=mk('div','mid');mid.append(mk('b',null,title),mk('small',null,meta));const a=mk('div','acts');acts.forEach(x=>a.append(x));r.append(ic,mid,a);return r}
function skeleton(){['panelsList','dbsList'].forEach(id=>{const l=$(id);l.replaceChildren(mk('div','skel'),mk('div','skel'))});$('panelsCard').classList.add('show');$('dbsCard').classList.add('show')}
function hideRes(){$('panelsCard').classList.remove('show');$('dbsCard').classList.remove('show')}
function renderRes(d){
const pl=$('panelsList'),dl=$('dbsList');pl.replaceChildren();dl.replaceChildren();
$('panelsCnt').textContent=d.panels.length;$('dbsCnt').textContent=d.dbs.length;
if(!d.panels.length)pl.append(mk('div','empty','No panels yet. Deploy your first one above.'));
d.panels.forEach(p=>{const acts=[btn('Update',()=>{$('wn').value=p.name;$('wn').focus();window.scrollTo({top:0,behavior:'smooth'})})];if(p.panelUrl)acts.unshift(btn('Open',null,p.panelUrl));
pl.append(row(ICON_PANEL,p.name,p.modified?'Updated '+fmtDate(p.modified):'Worker',acts))});
if(!d.dbs.length)dl.append(mk('div','empty','No D1 databases yet. One is created on deploy.'));
d.dbs.forEach(x=>{const meta=[x.tables!=null?x.tables+' tables':'',fmtSize(x.size),x.created?'Created '+fmtDate(x.created):''].filter(Boolean).join(' · ');
dl.append(row(ICON_DB,x.name,meta||'D1 database',[btn('Use',()=>{$('db').value=x.name;$('db').focus()})]))});
(d.errors||[]).forEach(m=>{const t=mk('div','empty err',m);(m.indexOf('Panels')===0?pl:dl).append(t)});
$('panelsCard').classList.add('show');$('dbsCard').classList.add('show')}
let lookupSeq=0,lookupPromise=Promise.resolve();
async function lookup(){const t=$('token').value.trim(),seq=++lookupSeq,box=$('accBox'),select=$('acc');
if(t.length<20){hideRes();box.style.display='none';select.replaceChildren();return}
skeleton();
try{const r=await fetch('/api/accounts',{method:'POST',body:JSON.stringify({token:t})});const d=await r.json();if(seq!==lookupSeq)return;
if(d.error){hideRes();return}
const keep=select.value;box.style.display='none';select.replaceChildren();
if(Array.isArray(d.accounts)&&d.accounts.length>1){for(const a of d.accounts){const o=document.createElement('option');o.value=String(a.id??'');o.textContent=String(a.name??a.id??'Account');select.append(o)}if(keep)select.value=keep;box.style.display='block'}
const acc=box.style.display==='block'?select.value:undefined;
const rr=await fetch('/api/resources',{method:'POST',body:JSON.stringify({token:t,accountId:acc})});const dd=await rr.json();if(seq!==lookupSeq)return;
if(dd.error){hideRes();return}renderRes(dd)}catch(e){if(seq===lookupSeq)hideRes()}}
$('token').addEventListener('change',()=>{lookupPromise=lookup()});
$('token').addEventListener('paste',()=>setTimeout(()=>{lookupPromise=lookup()},50));
$('acc').addEventListener('change',()=>{lookupPromise=lookup()});
$('f').addEventListener('submit',async e=>{e.preventDefault();const log=$('log');log.style.display='block';log.innerHTML='';$('res').style.display='none';$('go').disabled=true;$('go').textContent='Deploying...';
const rows={};const line=(k,m,s)=>{let el=rows[k];if(!el||s!=='run'&&el.dataset.done){el=document.createElement('div');rows[k]=el;log.appendChild(el)}el.className=s==='ok'?'ok':s==='warn'?'warn':s==='err'?'err':'run';el.textContent=(s==='ok'?'✓ ':s==='warn'?'! ':s==='err'?'✗ ':'… ')+m;if(s!=='run')el.dataset.done=1};
let deployed=false;
try{await lookupPromise;const res=await fetch('/api/deploy',{method:'POST',body:JSON.stringify({token:$('token').value,workerName:$('wn').value,dbName:$('db').value,repoSlug:$('repo').value.trim(),storeToken:$('store').checked,obfuscate:$('obf').checked,accountId:$('accBox').style.display==='block'?$('acc').value:undefined})});
const rd=res.body.getReader(),dec=new TextDecoder();let buf='';
while(true){const{value,done}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});let i;while((i=buf.indexOf('\n'))>=0){const l=buf.slice(0,i);buf=buf.slice(i+1);if(!l)continue;const m=JSON.parse(l);
if(m.type==='log')line(m.step,m.message,m.status);else if(m.type==='error')line('err',m.message,'err');else if(m.type==='done'){deployed=true;$('res').style.display='block';$('link').href=m.result.panelUrl;$('link').textContent=m.result.panelUrl}}}
}catch(err){line('x',err.message,'err')}
$('go').disabled=false;$('go').textContent='Deploy panel';
if(deployed){OxAlert.fire({icon:'success',title:'Panel deployed',text:'Open your panel link to set the admin password.',confirmButtonText:'Great'});await lookup()}else{OxAlert.toast({icon:'error',title:'Deploy did not finish, check the log'})}$('token').value='';});
</script></body></html>`;
