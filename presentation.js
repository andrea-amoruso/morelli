/* ================================================================
   morelli2026 · presentation.js
   ================================================================ */
(function () {
  "use strict";

  const CANVAS_W = 1280;
  const CANVAS_H = 720;

  /* ── SCALING ── */
  function resize() {
    const vw = window.visualViewport ? window.visualViewport.width  : window.innerWidth;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const scale = Math.min(vw / CANVAS_W, vh / CANVAS_H);
    document.documentElement.style.setProperty("--scale", scale);
  }
  window.addEventListener("resize", resize);

  /* ── STELLE ── */
  function initStars() {
    const canvas = document.getElementById("stars-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random() * CANVAS_W, y: Math.random() * CANVAS_H,
      r: Math.random() * 1.3 + 0.2, a: Math.random(),
      da: (Math.random() - 0.5) * 0.004,
    }));
    function draw() {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      stars.forEach(s => {
        s.a = Math.max(0.05, Math.min(1, s.a + s.da));
        if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
        ctx.save();
        ctx.globalAlpha = s.a;
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#a0b8ff";
        ctx.shadowBlur = s.r * 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── NAVIGAZIONE ── */
  let current = 0;
  let slides = [];
  let total  = 0;

  function showSlide(n) {
    // Clamp
    n = Math.max(0, Math.min(total - 1, n));
    if (n === current && slides[current].classList.contains("active")) {
      // già attiva, non fare nulla (evita doppio-click glitch)
    }
    // Nascondi tutte
    slides.forEach(s => s.classList.remove("active"));
    current = n;
    // Mostra la corrente — il reflow garantisce che l'animazione riparta
    slides[current].classList.add("active");
    // HUD
    const ctr  = document.getElementById("slide-counter");
    const fill = document.getElementById("progress-fill");
    if (ctr)  ctr.textContent  = (current + 1) + " / " + total;
    if (fill) fill.style.width = ((current + 1) / total * 100) + "%";
  }

  function changeSlide(dir) {
    showSlide(current + dir);
  }

  /* ── KaTeX: renderizza TUTTE le slide all'avvio ── */
  function renderAllKatex() {
    if (!window.renderMathInElement) return;
    slides.forEach(function(slide) {
      renderMathInElement(slide, {
        delimiters: [
          { left: "$$", right: "$$", display: true  },
          { left: "\\[", right: "\\]", display: true  },
          { left: "$",  right: "$",  display: false },
          { left: "\\(", right: "\\)", display: false },
        ],
        throwOnError: false,
      });
    });
  }

  /* ── INPUT ── */
  function initInput() {
    // Click metà sinistra/destra
    document.addEventListener("click", function(e) {
      if (e.target.closest("#fullscreen-btn")) return;
      changeSlide(e.clientX < window.innerWidth / 2 ? -1 : 1);
    });

    // Tastiera
    document.addEventListener("keydown", function(e) {
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   changeSlide(-1);
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") changeSlide(1);
      if (e.key === "Home") showSlide(0);
      if (e.key === "End")  showSlide(total - 1);
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    });

    // Touch swipe
    var touchX = null;
    document.addEventListener("touchstart", function(e) {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    document.addEventListener("touchend", function(e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) changeSlide(dx < 0 ? 1 : -1);
      touchX = null;
    });

    // Scroll wheel con debounce
    var wheelLock = false;
    document.addEventListener("wheel", function(e) {
      if (wheelLock) return;
      changeSlide(e.deltaY > 0 ? 1 : -1);
      wheelLock = true;
      setTimeout(function() { wheelLock = false; }, 700);
    }, { passive: true });
  }

  /* ── FULLSCREEN ── */
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }
  document.addEventListener("fullscreenchange", function() {
    var btn = document.getElementById("fullscreen-btn");
    if (btn) btn.textContent = document.fullscreenElement ? "⊹" : "⛶";
    resize();
  });

  /* ── BOOT ── */
  window.addEventListener("load", function() {
    slides = Array.from(document.querySelectorAll(".slide"));
    total  = slides.length;
    resize();
    initStars();
    initInput();
    // KaTeX: renderizza tutto ora che il DOM e la libreria sono pronti
    renderAllKatex();
    // Mostra prima slide
    showSlide(0);
    // Fullscreen btn
    var fsBtn = document.getElementById("fullscreen-btn");
    if (fsBtn) fsBtn.addEventListener("click", toggleFullscreen);
  });

})();