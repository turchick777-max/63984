/**
 * GDPR Cookie Consent — Consent Mode v2
 * AQUINTAQA — Static site implementation
 *
 * ─── REPLACE GTM ID ───
 * Search for "GTM-XXXXXXX" and replace with your actual GTM container ID.
 * ───────────────────────
 */

(function () {
  'use strict';

  // ════════════════════════════════════════════
  //  CONFIG
  // ════════════════════════════════════════════

  var GTM_ID = 'GTM-XXXXXXX'; // ← Replace with your GTM container ID
  var STORAGE_KEY = 'cookie_consent_v2';
  var CONSENT_VERSION = 1;

  // ════════════════════════════════════════════
  //  GTAG STUB + CONSENT MODE v2 DEFAULT
  // ════════════════════════════════════════════

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  // Set default consent BEFORE any GTM/GA loads
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });

  // ════════════════════════════════════════════
  //  PERSISTENCE
  // ════════════════════════════════════════════

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.version !== CONSENT_VERSION) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(analytics) {
    var data = {
      essential: true,
      analytics: !!analytics,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  // ════════════════════════════════════════════
  //  GTM LOADER (only after analytics consent)
  // ════════════════════════════════════════════

  var gtmLoaded = false;

  function loadGTM() {
    if (gtmLoaded) return;
    if (GTM_ID === 'GTM-XXXXXXX') {
      console.info('[Consent] GTM ID is placeholder — skipping GTM load.');
      return;
    }
    gtmLoaded = true;

    // GTM script
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);

    // GTM noscript iframe
    var noscript = document.createElement('noscript');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.googletagmanager.com/ns.html?id=' + GTM_ID;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);

    console.info('[Consent] GTM loaded:', GTM_ID);
  }

  // ════════════════════════════════════════════
  //  APPLY CONSENT
  // ════════════════════════════════════════════

  function applyConsent(data) {
    if (data.analytics) {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      loadGTM();
    }
    // ad_storage, ad_user_data, ad_personalization stay 'denied'
  }

  // ════════════════════════════════════════════
  //  UI — INJECT HTML
  // ════════════════════════════════════════════

  function createBannerHTML() {
    return '' +
      '<div id="cc-banner" class="cc-banner" role="dialog" aria-label="Cookie consent">' +
        '<div class="cc-banner-text">' +
          'We use cookies to analyze site usage and improve your experience. ' +
          'Essential cookies are always active. You can choose whether to allow analytics cookies. ' +
          '<a href="privacy.html">Privacy Policy</a>' +
        '</div>' +
        '<div class="cc-banner-actions">' +
          '<button class="cc-btn cc-btn-accept" id="cc-accept">Accept all</button>' +
          '<button class="cc-btn cc-btn-reject" id="cc-reject">Reject</button>' +
          '<button class="cc-btn cc-btn-settings" id="cc-settings-btn">Settings</button>' +
        '</div>' +
      '</div>';
  }

  function createModalHTML() {
    return '' +
      '<div id="cc-overlay" class="cc-overlay" role="dialog" aria-label="Cookie settings">' +
        '<div class="cc-panel">' +
          '<h3>Cookie Settings</h3>' +
          '<div class="cc-panel-subtitle">Manage your cookie preferences. Essential cookies cannot be disabled as they are required for the site to function.</div>' +
          '<div class="cc-toggle-row">' +
            '<div class="cc-toggle-label">' +
              '<span>Essential</span>' +
              '<small>Required for core functionality</small>' +
            '</div>' +
            '<label class="cc-switch">' +
              '<input type="checkbox" checked disabled />' +
              '<span class="cc-switch-slider"></span>' +
            '</label>' +
          '</div>' +
          '<div class="cc-toggle-row">' +
            '<div class="cc-toggle-label">' +
              '<span>Analytics</span>' +
              '<small>Help us understand site usage</small>' +
            '</div>' +
            '<label class="cc-switch">' +
              '<input type="checkbox" id="cc-analytics-toggle" />' +
              '<span class="cc-switch-slider"></span>' +
            '</label>' +
          '</div>' +
          '<div class="cc-panel-actions">' +
            '<button class="cc-btn-save" id="cc-save">Save choices</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // ════════════════════════════════════════════
  //  UI — BEHAVIOR
  // ════════════════════════════════════════════

  function hideBanner() {
    var banner = document.getElementById('cc-banner');
    if (banner) {
      banner.classList.remove('visible');
      banner.classList.add('hidden');
    }
  }

  function showBanner() {
    var banner = document.getElementById('cc-banner');
    if (banner) {
      // Small delay to trigger CSS transition
      requestAnimationFrame(function () {
        banner.classList.add('visible');
      });
    }
  }

  function hideModal() {
    var overlay = document.getElementById('cc-overlay');
    if (overlay) overlay.classList.remove('visible');
  }

  function showModal() {
    var overlay = document.getElementById('cc-overlay');
    if (overlay) overlay.classList.add('visible');
  }

  function init() {
    // Check existing consent
    var existing = getConsent();
    if (existing) {
      applyConsent(existing);
      return; // Don't show banner
    }

    // Inject banner + modal
    var wrapper = document.createElement('div');
    wrapper.innerHTML = createBannerHTML() + createModalHTML();
    while (wrapper.firstChild) {
      document.body.appendChild(wrapper.firstChild);
    }

    // Show banner after short delay (allows page render)
    setTimeout(showBanner, 300);

    // ── Accept All ──
    document.getElementById('cc-accept').addEventListener('click', function () {
      var data = saveConsent(true);
      applyConsent(data);
      hideBanner();
      hideModal();
    });

    // ── Reject ──
    document.getElementById('cc-reject').addEventListener('click', function () {
      saveConsent(false);
      hideBanner();
      hideModal();
    });

    // ── Settings button ──
    document.getElementById('cc-settings-btn').addEventListener('click', function () {
      showModal();
    });

    // ── Close modal on overlay click ──
    document.getElementById('cc-overlay').addEventListener('click', function (e) {
      if (e.target === this) hideModal();
    });

    // ── Save choices ──
    document.getElementById('cc-save').addEventListener('click', function () {
      var analyticsChecked = document.getElementById('cc-analytics-toggle').checked;
      var data = saveConsent(analyticsChecked);
      applyConsent(data);
      hideBanner();
      hideModal();
    });
  }

  // ════════════════════════════════════════════
  //  BOOT
  // ════════════════════════════════════════════

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
