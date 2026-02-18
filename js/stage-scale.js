/**
 * Stage Scale — Fixed-Design Viewport Scaling
 * AQUINTAQA
 *
 * Locks the page layout at DESIGN_WIDTH and scales uniformly
 * to fit any viewport. Preserves exact positions, spacing,
 * font sizes, and proportions.
 *
 * ─── CONFIG ───
 * DESIGN_WIDTH  — The reference design width (px).
 *                 Matches the Webflow desktop canvas / viewport meta.
 * MOBILE_BP     — Below this width, scaling is disabled and
 *                 normal responsive/mobile CSS takes over.
 * ──────────────
 */

(function () {
  'use strict';

  // ════════════════════════════════════════════
  //  CONFIG
  // ════════════════════════════════════════════

  var DESIGN_WIDTH = 1440;   // matches <meta name="viewport" content="width=1440">
  var MOBILE_BP    = 767;    // mobile breakpoint (px)

  // ════════════════════════════════════════════
  //  ELEMENTS
  // ════════════════════════════════════════════

  var viewport = document.getElementById('viewport');
  var stage    = document.getElementById('stage');
  if (!viewport || !stage) return;

  var isFit = stage.hasAttribute('data-stage-fit');
  var root  = document.documentElement;
  var body  = document.body;

  // ════════════════════════════════════════════
  //  UPDATE
  // ════════════════════════════════════════════

  var rafId;

  function update() {
    var ww = window.innerWidth;
    var wh = window.innerHeight;

    // ── Mobile: disable scaling ──
    if (ww <= MOBILE_BP) {
      body.classList.remove('stage-active');
      stage.removeAttribute('style');
      viewport.removeAttribute('style');
      root.style.removeProperty('--stage-h');
      root.style.removeProperty('--stage-w');
      return;
    }

    body.classList.add('stage-active');

    // ── Scale factor (width-locked) ──
    var scale = ww / DESIGN_WIDTH;

    // ── CSS custom properties for pages that replace vh/vw ──
    var stageH = wh / scale;
    root.style.setProperty('--stage-h', stageH + 'px');
    root.style.setProperty('--stage-w', DESIGN_WIDTH + 'px');

    // ── Apply stage dimensions + transform ──
    stage.style.width           = DESIGN_WIDTH + 'px';
    stage.style.position        = 'absolute';
    stage.style.top             = '0';
    stage.style.left            = '0';
    stage.style.transformOrigin = 'top left';
    stage.style.transform       = 'scale(' + scale + ')';

    // ── Viewport wrapper ──
    viewport.style.position = 'relative';
    viewport.style.overflow = 'hidden';
    viewport.style.width    = '100%';

    if (isFit) {
      // Fit-to-viewport (single-screen pages: technology, quality)
      stage.style.height   = stageH + 'px';
      stage.style.overflow = 'hidden';
      viewport.style.height = wh + 'px';
    } else {
      // Scrollable pages: measure content height and expose it
      rafId && cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () {
        var contentH  = stage.scrollHeight;
        var scaledH   = Math.ceil(contentH * scale);
        viewport.style.height = scaledH + 'px';
      });
    }
  }

  // ════════════════════════════════════════════
  //  INIT + LISTENERS
  // ════════════════════════════════════════════

  update();

  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(update, 60);
  });

  window.addEventListener('orientationchange', function () {
    setTimeout(update, 200);
  });

  // Recalculate for lazy content (iframes, images, etc.)
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      if (!isFit && window.innerWidth > MOBILE_BP) {
        var scale = window.innerWidth / DESIGN_WIDTH;
        var contentH = stage.scrollHeight;
        viewport.style.height = Math.ceil(contentH * scale) + 'px';
      }
    }).observe(stage);
  }
})();
