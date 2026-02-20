/**
 * stage-scale.js — Tablet fit-to-width scaling
 *
 * DESIGN_WIDTH  = 1440  (MacBook reference — matches viewport meta width=1440)
 * DESIGN_HEIGHT =  900  (MacBook reference — standard 16:10 at 1440px)
 *
 * Behaviour by device class:
 *   >= 1440px  (Desktop)  → no transform; original Webflow layout unchanged
 *   768–1439px (Tablet)   → scale = vw / 1440, clamped only if height would overflow
 *   < 768px    (Mobile)   → no transform; existing mobile CSS layout takes over
 *
 * Debug: open DevTools console and look for [stage-scale] lines.
 */
(function () {
  'use strict';

  var DESIGN_WIDTH  = 1440;
  var DESIGN_HEIGHT =  900;

  /* ── helpers ─────────────────────────────────────────────── */

  function getStage() {
    return document.getElementById('stage');
  }

  function resetStage(stage) {
    stage.style.transform      = '';
    stage.style.width          = '';
    stage.style.height         = '';
    stage.style.transformOrigin = '';
    document.documentElement.classList.remove('stage-active');
  }

  /* ── main scaling logic ───────────────────────────────────── */

  function applyScale() {
    var stage = getStage();
    if (!stage) return;

    var vw = window.innerWidth;
    var vh = window.innerHeight;

    /* Debug (temporary — harmless in production) */
    // console.log('[stage-scale] vw=' + vw + ' vh=' + vh + ' dpr=' + window.devicePixelRatio);

    /* Desktop or wider: hands off */
    if (vw >= DESIGN_WIDTH) {
      resetStage(stage);
      return;
    }

    /* Mobile: hands off — let mobile CSS handle it */
    if (vw < 768) {
      resetStage(stage);
      return;
    }

    /* ── Tablet mode: 768 ≤ vw < 1440 ── */

    /* Primary: fit to width */
    var scale = vw / DESIGN_WIDTH;

    /* Secondary: clamp only if content would overflow vertically */
    if (DESIGN_HEIGHT * scale > vh) {
      scale = vh / DESIGN_HEIGHT;
    }

    /* Center horizontally (will be 0 when scale = vw/DESIGN_WIDTH exactly) */
    var offsetX = Math.max(0, (vw - DESIGN_WIDTH * scale) / 2);
    /* Center vertically within the visible viewport */
    var offsetY = Math.max(0, (vh - DESIGN_HEIGHT * scale) / 2);

    /* Lock stage to design dimensions so inner CSS doesn't stretch it */
    stage.style.width          = DESIGN_WIDTH  + 'px';
    stage.style.height         = DESIGN_HEIGHT + 'px';
    stage.style.transformOrigin = 'top left';
    stage.style.transform =
      'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + scale + ')';

    document.documentElement.classList.add('stage-active');

    /* Debug */
    // console.log('[stage-scale] scale=' + scale.toFixed(4)
    //   + ' offsetX=' + offsetX.toFixed(1) + ' offsetY=' + offsetY.toFixed(1)
    //   + ' stageBB=' + JSON.stringify(stage.getBoundingClientRect()));
  }

  /* ── boot ─────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyScale);
  } else {
    applyScale();
  }

  window.addEventListener('resize', applyScale);

  window.addEventListener('orientationchange', function () {
    /* Wait one frame for the browser to settle the new dimensions */
    setTimeout(applyScale, 200);
  });

}());
