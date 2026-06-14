/* LeadExpert.be — scroll-cinematic canvas engine (zero-dependency).
 * Two scroll-driven pseudo-3D scenes:
 *   #scene-hero   — a network of "lead" nodes that converges as you scroll.
 *   #scene-funnel — particles flowing through a conversion funnel.
 * Plus: scroll-reveal, count-up stats, sticky nav, active funnel steps.
 */
(function () {
  "use strict";
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t); // smoothstep

  // ---- shared scroll progress for a stage (0..1) ----
  function stageProgress(canvas) {
    const stage = canvas.closest(".scroll-stage");
    const r = stage.getBoundingClientRect();
    const scrollable = r.height - window.innerHeight;
    if (scrollable <= 0) return 0;
    return clamp(-r.top / scrollable, 0, 1);
  }

  function fitCanvas(c) {
    const r = c.getBoundingClientRect();
    c.width = Math.max(1, r.width * DPR);
    c.height = Math.max(1, r.height * DPR);
  }

  // Simple Y/X rotation + perspective projection.
  function project(p, rotY, rotX, w, h, camZ, fov) {
    let { x, y, z } = p;
    // rotate Y
    let cz = Math.cos(rotY), sz = Math.sin(rotY);
    let x1 = x * cz - z * sz;
    let z1 = x * sz + z * cz;
    // rotate X
    let cx = Math.cos(rotX), sx = Math.sin(rotX);
    let y1 = y * cx - z1 * sx;
    let z2 = y * sx + z1 * cx;
    const zz = z2 + camZ;
    const scale = fov / Math.max(0.1, zz);
    return { sx: w / 2 + x1 * scale, sy: h / 2 + y1 * scale, scale, depth: zz };
  }

  /* ===================== HERO: lead network ===================== */
  function heroScene() {
    const c = document.getElementById("scene-hero");
    if (!c) return;
    const ctx = c.getContext("2d");
    const N = 150;
    const nodes = [];
    for (let i = 0; i < N; i++) {
      // scattered start + an organized "target" lattice position
      const a = Math.random() * Math.PI * 2;
      const r = 120 + Math.random() * 260;
      nodes.push({
        sx0: (Math.random() - 0.5) * 1400,
        sy0: (Math.random() - 0.5) * 900,
        sz0: (Math.random() - 0.5) * 900,
        // converged target: a swirling disc funneling to centre
        tx: Math.cos(a) * r * 0.55,
        ty: (Math.random() - 0.5) * 120 + (r - 250) * 0.4,
        tz: Math.sin(a) * r * 0.55,
        pulse: Math.random() * Math.PI * 2,
        x: 0, y: 0, z: 0,
      });
    }

    let prog = 0;
    fitCanvas(c);
    window.addEventListener("resize", () => fitCanvas(c), { passive: true });

    function frame(t) {
      const target = stageProgress(c);
      prog += (target - prog) * 0.08;
      const w = c.width, h = c.height;
      const k = ease(prog);
      ctx.clearRect(0, 0, w, h);

      const rotY = t * 0.00006 + prog * 1.4;
      const rotX = -0.25 + prog * 0.15;
      const camZ = lerp(1100, 520, k);     // fly in
      const fov = h * 0.9;

      // compute positions
      const pts = [];
      for (const n of nodes) {
        n.x = lerp(n.sx0, n.tx, k);
        n.y = lerp(n.sy0, n.ty, k);
        n.z = lerp(n.sz0, n.tz, k);
        const pr = project(n, rotY, rotX, w, h, camZ, fov);
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.002 + n.pulse);
        pts.push({ ...pr, pulse });
      }

      // connections (lead relationships) — distance-gated, brand-tinted
      ctx.lineWidth = DPR;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].sx - pts[j].sx, dy = pts[i].sy - pts[j].sy;
          const d2 = dx * dx + dy * dy;
          const maxD = (150 * DPR) * (150 * DPR);
          if (d2 < maxD) {
            const o = (1 - d2 / maxD) * 0.5 * (0.4 + 0.6 * k);
            const g = ctx.createLinearGradient(pts[i].sx, pts[i].sy, pts[j].sx, pts[j].sy);
            g.addColorStop(0, `rgba(34,211,238,${o})`);
            g.addColorStop(1, `rgba(91,140,255,${o})`);
            ctx.strokeStyle = g;
            ctx.beginPath();
            ctx.moveTo(pts[i].sx, pts[i].sy);
            ctx.lineTo(pts[j].sx, pts[j].sy);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const p of pts) {
        const rad = clamp(p.scale * 2.1, 0.6, 5) * DPR * p.pulse;
        const alpha = clamp(p.scale * 1.3, 0.15, 1);
        const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, rad * 4);
        glow.addColorStop(0, `rgba(120,220,255,${alpha})`);
        glow.addColorStop(1, "rgba(120,220,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, rad * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(225,245,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // subtle vignette darkening toward edges
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.75);
      vg.addColorStop(0, "rgba(7,11,24,0)");
      vg.addColorStop(1, "rgba(7,11,24,.65)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ===================== SHOWCASE: conversion funnel ===================== */
  function funnelScene() {
    const c = document.getElementById("scene-funnel");
    if (!c) return;
    const ctx = c.getContext("2d");
    const M = 240;
    const parts = [];
    for (let i = 0; i < M; i++) {
      parts.push({
        a: Math.random() * Math.PI * 2,
        rad: Math.random(),         // 0 centre .. 1 edge
        y: Math.random(),           // 0 top .. 1 bottom
        speed: 0.0006 + Math.random() * 0.0011,
        seed: Math.random() * Math.PI * 2,
      });
    }
    let prog = 0;
    fitCanvas(c);
    window.addEventListener("resize", () => fitCanvas(c), { passive: true });
    const steps = Array.from(document.querySelectorAll(".steps li"));

    function frame(t) {
      const target = stageProgress(c);
      prog += (target - prog) * 0.08;
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);

      // funnel geometry — placed right-of-centre so text sits left
      const cx = w * 0.66;
      const topY = h * 0.16, botY = h * 0.86;
      const topR = w * 0.20, botR = w * 0.035;

      // funnel walls
      ctx.strokeStyle = "rgba(91,140,255,.28)";
      ctx.lineWidth = DPR * 1.5;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + side * topR, topY);
        ctx.lineTo(cx + side * botR, botY);
        ctx.stroke();
      }
      // rings
      for (let r = 0; r <= 4; r++) {
        const ty = r / 4;
        const yy = lerp(topY, botY, ty);
        const rr = lerp(topR, botR, ty);
        ctx.strokeStyle = `rgba(34,211,238,${0.06 + 0.05 * (1 - ty)})`;
        ctx.beginPath();
        ctx.ellipse(cx, yy, rr, rr * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // particles flowing down + funneling inward
      for (const p of parts) {
        p.y += p.speed * (1 + prog * 1.6);
        if (p.y > 1) { p.y = 0; p.rad = Math.random(); }
        p.a += 0.01;
        const yy = lerp(topY, botY, p.y);
        const rr = lerp(topR, botR, p.y) * (0.25 + p.rad * 0.75);
        const px = cx + Math.cos(p.a + p.seed) * rr;
        const py = yy + Math.sin(p.a + p.seed) * rr * 0.22;
        // colour shifts cyan -> violet as it converts (descends)
        const conv = p.y;
        const col = `rgba(${Math.round(lerp(34,168,conv))},${Math.round(lerp(211,85,conv))},${Math.round(lerp(238,247,conv))},${0.5 + 0.5 * conv})`;
        const rad = lerp(1.4, 3.2, conv) * DPR;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, rad * 3);
        glow.addColorStop(0, col);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(px, py, rad * 3, 0, Math.PI * 2); ctx.fill();
      }

      // "deal closed" pulse at the spout, intensity by scroll
      const sx = cx, sy = botY + 6 * DPR;
      const pr = (0.5 + 0.5 * Math.sin(t * 0.004)) * prog;
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 60 * DPR);
      sg.addColorStop(0, `rgba(168,85,247,${0.5 * pr})`);
      sg.addColorStop(1, "rgba(168,85,247,0)");
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(sx, sy, 60 * DPR, 0, Math.PI * 2); ctx.fill();

      // activate the matching step
      const idx = clamp(Math.floor(prog * 4), 0, 3);
      steps.forEach((li, i) => li.classList.toggle("active", i <= idx));

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ===================== UI: reveal, counts, nav, loader ===================== */
  function ui() {
    // sticky nav state
    const nav = document.querySelector(".nav");
    const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // scroll-reveal
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.18 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // count-up stats
    const counters = document.querySelectorAll("[data-count]");
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target, end = +el.dataset.count;
        const dur = 1400, t0 = performance.now();
        const step = (now) => {
          const t = clamp((now - t0) / dur, 0, 1);
          el.textContent = Math.round(ease(t) * end).toLocaleString("nl-BE");
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));

    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    // loader: fade once first paint settles
    const loader = document.getElementById("loader");
    const bar = document.getElementById("loader-bar");
    if (bar) bar.style.width = "100%";
    setTimeout(() => loader && loader.classList.add("hidden"), 450);
  }

  function init() { heroScene(); funnelScene(); ui(); }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
