/**
 * hCaptcha Integration Scaffold — AQUINTAQA
 *
 * ─── CONFIGURATION ───
 * Set HCAPTCHA_SITE_KEY to your real site key to enable hCaptcha.
 * Leave empty ("") for placeholder/dev mode.
 * ─────────────────────
 */

(function () {
  'use strict';

  // ════════════════════════════════════════════
  //  CONFIG — Set your hCaptcha site key here
  // ════════════════════════════════════════════

  var HCAPTCHA_SITE_KEY = ''; // ← Paste your hCaptcha site key

  // ════════════════════════════════════════════
  //  INTERNAL STATE
  // ════════════════════════════════════════════

  var captchaReady = false;
  var isPlaceholder = !HCAPTCHA_SITE_KEY;

  // Expose validation function globally for form scripts
  window.hcaptchaScaffold = {
    isValid: function () {
      // Placeholder / dev mode: no key configured → bypass captcha validation
      if (isPlaceholder) return true;
      // Real mode: check hCaptcha response token
      var response = document.querySelector('[name="h-captcha-response"]');
      return response && response.value.length > 0;
    },
    isPlaceholder: function () {
      return isPlaceholder;
    }
  };

  // ════════════════════════════════════════════
  //  STYLES (injected once)
  // ════════════════════════════════════════════

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.hcaptcha-wrapper {' +
        'margin: 24px 0 4px;' +
      '}' +
      '.hcaptcha-placeholder {' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'height: 78px;' +
        'background: rgba(255,255,255,.02);' +
        'border: 1px dashed rgba(255,255,255,.12);' +
        'border-radius: 4px;' +
        'color: rgba(230,237,243,.35);' +
        'font-family: Inter, system-ui, sans-serif;' +
        'font-size: 13px;' +
        'font-weight: 400;' +
        'letter-spacing: .02em;' +
        'user-select: none;' +
      '}' +
      '.hcaptcha-placeholder .lock-icon {' +
        'margin-right: 8px;' +
        'font-size: 15px;' +
        'opacity: .6;' +
      '}' +
      '.hcaptcha-error {' +
        'font-family: Inter, system-ui, sans-serif;' +
        'font-size: 12px;' +
        'color: #f85149;' +
        'margin-top: 6px;' +
        'display: none;' +
      '}' +
      '.hcaptcha-error.visible {' +
        'display: block;' +
      '}' +
      /* Ensure real hCaptcha widget fits the dark theme */
      '.hcaptcha-wrapper iframe {' +
        'border-radius: 4px;' +
      '}';
    document.head.appendChild(style);
  }

  // ════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════

  function renderContainers() {
    var containers = document.querySelectorAll('[data-hcaptcha]');
    if (!containers.length) return;

    containers.forEach(function (container) {
      // Build wrapper
      var wrapper = document.createElement('div');
      wrapper.className = 'hcaptcha-wrapper';

      if (isPlaceholder) {
        // ── Placeholder mode ──
        var placeholder = document.createElement('div');
        placeholder.className = 'hcaptcha-placeholder';
        placeholder.innerHTML = '<span class="lock-icon">🔒</span> hCaptcha will be enabled here';
        wrapper.appendChild(placeholder);
      } else {
        // ── Real hCaptcha widget ──
        var widget = document.createElement('div');
        widget.className = 'h-captcha';
        widget.setAttribute('data-sitekey', HCAPTCHA_SITE_KEY);
        widget.setAttribute('data-theme', 'dark');
        wrapper.appendChild(widget);
      }

      // Error message
      var errorMsg = document.createElement('div');
      errorMsg.className = 'hcaptcha-error';
      errorMsg.id = container.getAttribute('data-hcaptcha-error-id') || 'err-hcaptcha';
      errorMsg.textContent = isPlaceholder
        ? 'Captcha is required (not yet configured)'
        : 'Please complete the captcha';
      wrapper.appendChild(errorMsg);

      // Insert
      container.appendChild(wrapper);
    });
  }

  // ════════════════════════════════════════════
  //  LOAD HCAPTCHA SDK (only if key provided)
  // ════════════════════════════════════════════

  function loadHCaptchaSDK() {
    if (isPlaceholder) return;

    var script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    script.onload = function () {
      captchaReady = true;
      console.info('[hCaptcha] SDK loaded and ready.');
    };
    script.onerror = function () {
      console.warn('[hCaptcha] Failed to load SDK.');
    };
    document.head.appendChild(script);
  }

  // ════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════

  function init() {
    injectStyles();
    renderContainers();
    loadHCaptchaSDK();

    if (isPlaceholder) {
      console.info('[hCaptcha] Scaffold mode — set HCAPTCHA_SITE_KEY in js/hcaptcha-scaffold.js to activate.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
