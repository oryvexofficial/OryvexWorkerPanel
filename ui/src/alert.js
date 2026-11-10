/* OxAlert · SweetAlert-style dialogs and toasts for Oryvex 1.0.6 (no dependencies).
   OxAlert.fire({ icon, title, text, html, input, inputValue, inputPlaceholder,
                  showCancelButton, showDenyButton, showCloseButton,
                  confirmButtonText, cancelButtonText, denyButtonText,
                  danger, reverseButtons, timer, allowOutsideClick, allowEscapeKey })
     -> Promise<{ isConfirmed, isDenied, isDismissed, value, dismiss }>
   OxAlert.toast({ icon, title, timer })      OxAlert.confirm(text, opts) -> Promise<boolean>
   Also exposed as window.Swal when no real SweetAlert is loaded. */
(function () {
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
