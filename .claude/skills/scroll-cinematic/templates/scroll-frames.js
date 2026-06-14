/* scroll-frames.js — scroll-scrubbed cinematic frame sequences.
 *
 * For each <canvas data-frames="path" data-count="N">, preloads frame_0001..N
 * (JPG) and draws the frame matching the canvas's scroll progress, smoothed in
 * a requestAnimationFrame loop. Vanilla JS, no dependencies.
 */
(function () {
  "use strict";

  const pad = (n) => String(n).padStart(4, "0");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const sequences = [];
  let totalImages = 0;
  let loadedImages = 0;

  const loaderBar = document.getElementById("loader-bar");
  const loader = document.getElementById("loader");

  function setLoader() {
    const pct = totalImages ? (loadedImages / totalImages) * 100 : 100;
    if (loaderBar) loaderBar.style.width = pct + "%";
    if (pct >= 100 && loader) {
      loader.classList.add("hidden");
    }
  }

  function buildSequence(canvas) {
    const base = canvas.dataset.frames;
    const count = parseInt(canvas.dataset.count, 10) || 0;
    const ctx = canvas.getContext("2d");
    const images = new Array(count);
    const seq = { canvas, ctx, images, count, current: 0, target: 0 };

    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.src = `${base}/frame_${pad(i + 1)}.jpg`;
      img.onload = img.onerror = () => {
        loadedImages++;
        setLoader();
      };
      images[i] = img;
    }
    totalImages += count;
    sequences.push(seq);
    return seq;
  }

  function resize(seq) {
    const { canvas } = seq;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
  }

  // Cover-fit draw (like background-size: cover)
  function draw(seq, index) {
    const img = seq.images[clamp(index, 0, seq.count - 1)];
    if (!img || !img.complete || !img.naturalWidth) return;
    const { ctx, canvas } = seq;
    const cw = canvas.width, ch = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cw / ch;
    let dw, dh, dx, dy;
    if (cr > ir) { dw = cw; dh = cw / ir; dx = 0; dy = (ch - dh) / 2; }
    else { dh = ch; dw = ch * ir; dy = 0; dx = (cw - dw) / 2; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Scroll progress (0..1) of a sequence's stage relative to viewport.
  function progressFor(seq) {
    const stage = seq.canvas.closest(".scroll-stage");
    const rect = stage.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return 0;
    return clamp(-rect.top / scrollable, 0, 1);
  }

  function tick() {
    for (const seq of sequences) {
      seq.target = progressFor(seq) * (seq.count - 1);
      // ease toward target for buttery scrub
      seq.current += (seq.target - seq.current) * 0.18;
      draw(seq, Math.round(seq.current));
    }
    requestAnimationFrame(tick);
  }

  function init() {
    document.querySelectorAll("canvas[data-frames]").forEach((c) => {
      const seq = buildSequence(c);
      resize(seq);
    });
    setLoader();
    window.addEventListener("resize", () => sequences.forEach(resize), { passive: true });
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
    requestAnimationFrame(tick);
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
