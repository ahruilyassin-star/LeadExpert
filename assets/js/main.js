/* LeadExpert — main.js
 * Minimaal, performant, vanilla JS. Geen frameworks, geen tracking-bloat.
 * - Mobile nav toggle (a11y)
 * - Sticky scroll CTA (na 600px scroll)
 * - KPI count-up animatie on viewport-enter (IntersectionObserver)
 * - Form submit (graceful: fallback naar mailto als API faalt)
 * - GDPR cookie banner (Belgian-compliant: opt-in, geen default analytics)
 * - Smooth focus management voor anchor navigation
 * - Lazy load reviews (defer non-critical work)
 */

(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year in footer ---------- */
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const navToggle = $('.nav-toggle');
  const mobileNav = $('#mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      }
    });
  }

  /* ---------- Sticky mobile CTA ---------- */
  const stickyCTA = $('.sticky-cta');
  if (stickyCTA) {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 600 && y > last) stickyCTA.classList.add('visible');
      else if (y < 400) stickyCTA.classList.remove('visible');
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Count-up animatie ---------- */
  const counters = $$('[data-count]');
  if (counters.length && !prefersReduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const dur = 1400;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('nl-BE');
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => io.observe(c));
  } else {
    counters.forEach((c) => {
      const n = parseInt(c.dataset.count, 10) || 0;
      c.textContent = n.toLocaleString('nl-BE');
    });
  }

  /* ---------- Form submit ---------- */
  const handleForm = (form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Honeypot
      const hp = form.querySelector('.hp');
      if (hp && hp.value) return;

      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = 'Versturen…'; }

      const data = Object.fromEntries(new FormData(form));
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('API failed');
        window.location.href = '/bedankt.html';
      } catch (err) {
        // Graceful fallback: open mail client met ingevulde gegevens
        const subject = encodeURIComponent('Gratis website audit aanvraag');
        const lines = Object.entries(data)
          .filter(([k]) => k !== 'website_url_confirm')
          .map(([k, v]) => `${k}: ${v}`).join('\n');
        const body = encodeURIComponent('Hallo LeadExpert,\n\nGraag een gratis audit voor:\n\n' + lines);
        window.location.href = `mailto:hallo@leadexpert.be?subject=${subject}&body=${body}`;
        if (btn) { btn.disabled = false; btn.innerHTML = original; }
      }
    });
  };
  $$('form#audit-form, form#audit-form-hero').forEach(handleForm);

  /* ---------- Cookie banner (GDPR opt-in) ---------- */
  const COOKIE_KEY = 'le_consent_v1';
  const banner = $('#cookie-banner');
  const stored = (() => { try { return localStorage.getItem(COOKIE_KEY); } catch { return null; } })();
  if (banner && !stored) {
    // Defer voor LCP
    setTimeout(() => { banner.hidden = false; }, 1500);
    banner.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-cookie]');
      if (!choice) return;
      try { localStorage.setItem(COOKIE_KEY, choice.dataset.cookie); } catch {}
      banner.hidden = true;
      if (choice.dataset.cookie === 'all') {
        // Hier zou je GA4 / consent-mode unlocken
        // gtag('consent','update',{analytics_storage:'granted'});
      }
    });
  } else if (banner) {
    banner.hidden = true;
  }

  /* ---------- Smooth focus na anchor click (a11y) ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    setTimeout(() => {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }, 400);
  });

  /* ---------- Reveal-on-scroll (subtle) ---------- */
  if (!prefersReduce && 'IntersectionObserver' in window) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          revealIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    $$('.problem-card,.service-card,.case-card,.steps li,.price-card,.stat-card,.review').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      revealIO.observe(el);
    });
  }
})();
