/* ===========================================================
   Contact / enquiry form -> delivered straight to the HOD's inbox.

   How it works: the browser sends the enquiry (JSON over HTTPS) to a
   mail-forwarding endpoint, which e-mails it to RECIPIENT. No mail
   program opens on the visitor's device. To change the destination or
   provider, edit CONFIG below - nothing else needs to change.
   =========================================================== */
(() => {
  'use strict';

  const CONFIG = {
    recipient: 'hodei@becbgk.edu',                       // HOD's inbox
    endpoint: 'https://formsubmit.co/ajax/hodei@becbgk.edu',
    siteLabel: 'ECS Department Website',
    minFillMs: 3000,        // a human needs a few seconds to fill the form
    cooldownMs: 60 * 1000,  // wait between two sends
    maxPerHour: 5,          // per browser
    timeoutMs: 15000
  };

  const LIMITS = { name: 80, email: 120, subject: 120, message: 2000, minMessage: 10 };
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    name: form.elements.name,
    email: form.elements.email,
    subject: form.elements.subject,
    message: form.elements.message
  };
  const honeypot = form.elements._honey;
  const submitBtn = form.querySelector('[type="submit"]');
  const statusBox = document.getElementById('formStatus');
  const counter = document.getElementById('messageCount');
  const successPanel = document.getElementById('formSuccess');
  const errorPanel = document.getElementById('formError');
  const fallbackLink = document.getElementById('mailtoFallback');
  const DRAFT_KEY = 'ecs-contact-draft';
  const SENT_KEY = 'ecs-contact-sent';
  const openedAt = Date.now();
  // Don't let a blur-triggered error message shift the layout while the button is being pressed
  let pressingSubmit = false;
  submitBtn.addEventListener('pointerdown', () => { pressingSubmit = true; });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => submitBtn.addEventListener(t, () => { setTimeout(() => { pressingSubmit = false; }, 0); }));

  // ---------- helpers ----------
  const clean = v => String(v || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;

  const validators = {
    name: v => !v ? 'Please enter your name.'
      : v.length < 2 ? 'Name looks too short.'
      : v.length > LIMITS.name ? `Please keep your name under ${LIMITS.name} characters.` : '',
    email: v => !v ? 'Please enter your email so we can reply.'
      : (!EMAIL_RE.test(v) || v.length > LIMITS.email) ? 'That email address doesn\u2019t look right.' : '',
    subject: v => v.length > LIMITS.subject ? `Please keep the subject under ${LIMITS.subject} characters.` : '',
    message: v => !v ? 'Please write your message.'
      : v.length < LIMITS.minMessage ? `Please add a little more detail (at least ${LIMITS.minMessage} characters).`
      : v.length > LIMITS.message ? `Please keep the message under ${LIMITS.message} characters.` : ''
  };

  function setError(key, text) {
    const input = fields[key];
    const slot = document.getElementById(`${key}-error`);
    const group = input.closest('.form-group');
    if (slot) slot.textContent = text;
    input.setAttribute('aria-invalid', text ? 'true' : 'false');
    group.classList.toggle('has-error', !!text);
    group.classList.toggle('is-valid', !text && !!clean(input.value));
  }

  function validateField(key) {
    const msg = validators[key](clean(fields[key].value));
    setError(key, msg);
    return !msg;
  }

  function say(text, kind) {
    if (!statusBox) return;
    statusBox.textContent = text || '';
    statusBox.dataset.kind = kind || '';
  }

  // ---------- live feedback ----------
  function updateCounter() {
    if (!counter) return;
    const n = fields.message.value.length;
    counter.textContent = `${n} / ${LIMITS.message}`;
    counter.classList.toggle('is-near', n > LIMITS.message * 0.9);
  }

  Object.keys(fields).forEach(key => {
    const input = fields[key];
    input.setAttribute('maxlength', key === 'message' ? LIMITS.message + 200 : LIMITS[key] + 40);
    input.addEventListener('blur', () => { if (!pressingSubmit && clean(input.value)) validateField(key); });
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateField(key);
      saveDraft();
      if (key === 'message') { updateCounter(); autoGrow(); }
    });
  });

  function autoGrow() {
    const t = fields.message;
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight + 2, 360) + 'px';
  }

  // keep what was typed if the page is refreshed (cleared after a successful send)
  function saveDraft() {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        name: fields.name.value, email: fields.email.value,
        subject: fields.subject.value, message: fields.message.value
      }));
    } catch (_) { /* storage unavailable - ignore */ }
  }
  function restoreDraft() {
    try {
      const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null');
      if (!d || typeof d !== 'object') return;
      Object.keys(fields).forEach(k => { if (typeof d[k] === 'string') fields[k].value = d[k].slice(0, LIMITS[k] || 2000); });
    } catch (_) { /* corrupted draft - ignore */ }
  }
  restoreDraft(); updateCounter(); autoGrow();

  // ---------- anti-abuse (client side; the mail service adds its own filtering) ----------
  function recentSends() {
    try {
      const list = JSON.parse(localStorage.getItem(SENT_KEY) || '[]');
      return Array.isArray(list) ? list.filter(t => Number.isFinite(t) && Date.now() - t < 3600 * 1000) : [];
    } catch (_) { return []; }
  }
  function rememberSend() {
    try { localStorage.setItem(SENT_KEY, JSON.stringify([...recentSends(), Date.now()])); } catch (_) {}
  }
  function throttleMessage() {
    const sends = recentSends();
    const last = sends.length ? Math.max(...sends) : 0;
    if (Date.now() - last < CONFIG.cooldownMs) {
      return `Your last message was just sent. Please wait ${Math.ceil((CONFIG.cooldownMs - (Date.now() - last)) / 1000)} seconds before sending another.`;
    }
    if (sends.length >= CONFIG.maxPerHour) return 'You have sent several messages recently. Please try again later or call the department.';
    return '';
  }

  // ---------- UI state ----------
  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.classList.toggle('is-loading', busy);
    submitBtn.setAttribute('aria-busy', String(busy));
    const label = submitBtn.querySelector('.btn-label');
    if (label) label.textContent = busy ? 'Sending\u2026' : 'Send message';
    Object.values(fields).forEach(f => { f.readOnly = busy; });
  }

  function buildMailto() {
    const subject = clean(fields.subject.value) || 'Enquiry from department website';
    const body = `Name: ${clean(fields.name.value)}\nEmail: ${clean(fields.email.value)}\n\n${clean(fields.message.value)}`.slice(0, 1500);
    return `mailto:${CONFIG.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function showPanel(which) {
    form.hidden = which !== 'form';
    if (successPanel) successPanel.hidden = which !== 'success';
    if (errorPanel) errorPanel.hidden = which !== 'error';
    const target = which === 'success' ? successPanel : which === 'error' ? errorPanel : fields.name;
    if (target) { if (target !== fields.name) target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: false }); }
  }

  // ---------- submit ----------
  form.addEventListener('submit', async event => {
    event.preventDefault();
    say('');

    // bots fill the hidden field: pretend success, send nothing
    if (honeypot && honeypot.value) { showPanel('success'); return; }

    const results = Object.keys(fields).map(validateField);
    if (results.includes(false)) {
      const firstBad = Object.keys(fields).find(k => fields[k].getAttribute('aria-invalid') === 'true');
      if (firstBad) fields[firstBad].focus();
      say('Please fix the highlighted fields.', 'error');
      return;
    }
    if (Date.now() - openedAt < CONFIG.minFillMs) { say('That was quick! Please check your message and press send again.', 'error'); return; }
    if (!navigator.onLine) { say('You appear to be offline. Reconnect and try again - your message is saved.', 'error'); return; }
    const throttled = throttleMessage();
    if (throttled) { say(throttled, 'error'); return; }

    const payload = {
      name: clean(fields.name.value),
      email: clean(fields.email.value),
      subject: clean(fields.subject.value) || 'New enquiry',
      message: clean(fields.message.value),
      _subject: `[${CONFIG.siteLabel}] ${clean(fields.subject.value) || 'New enquiry'} - ${clean(fields.name.value)}`.slice(0, 200),
      _template: 'table',
      _captcha: 'false',
      _honey: ''
    };

    setBusy(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.timeoutMs);
    try {
      const response = await fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        mode: 'cors'
      });
      let data = {};
      try { data = await response.json(); } catch (_) { /* non-JSON reply */ }
      const ok = response.ok && (data.success === true || data.success === 'true');
      if (!ok) throw new Error(data.message || `HTTP ${response.status}`);

      rememberSend();
      try { sessionStorage.removeItem(DRAFT_KEY); } catch (_) {}
      form.reset(); updateCounter(); autoGrow();
      Object.keys(fields).forEach(k => setError(k, ''));
      const who = document.getElementById('successName');
      if (who) who.textContent = payload.name.split(' ')[0];
      showPanel('success');
    } catch (err) {
      if (fallbackLink) fallbackLink.href = buildMailto();
      showPanel('error');
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  });

  // panel buttons
  document.getElementById('sendAnother')?.addEventListener('click', () => showPanel('form'));
  document.getElementById('tryAgain')?.addEventListener('click', () => showPanel('form'));
})();
