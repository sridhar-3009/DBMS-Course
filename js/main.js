'use strict';

/* =============================================================
   DBMS Illustrated — main.js  v3.0
   Theme / Reading Progress / Scroll Reveals / Quiz / Q&A / Hero
   ============================================================= */

const THEME_KEY = 'dbms-theme';

// ── Theme ────────────────────────────────────────────────────
function isDark() {
  return document.documentElement.getAttribute('data-theme') !== 'light';
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(THEME_KEY, t);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = t === 'dark' ? '&#9788;' : '&#9790;';
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
}
function toggleTheme() {
  applyTheme(isDark() ? 'light' : 'dark');
}

// ── Reading progress ─────────────────────────────────────────
function initReadingProgress() {
  const bar = document.querySelector('.reading-progress') || document.getElementById('reading-progress');
  if (!bar) return;
  const update = () => {
    const st = document.documentElement.scrollTop;
    const sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    bar.style.width = (sh > 0 ? (st / sh) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ── Scroll reveals ───────────────────────────────────────────
function initScrollReveals() {
  const els = document.querySelectorAll('.reveal, .section-block, .mini-card, .step-item, .quiz-question, .at-a-glance');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => {
    el.classList.add('reveal');
    io.observe(el);
  });
}

// ── Quiz ─────────────────────────────────────────────────────
function initQuiz() {
  document.querySelectorAll('.quiz-question').forEach(q => {
    q.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        if (q.dataset.answered) return;
        q.dataset.answered = '1';
        const correct = opt.dataset.correct === 'true';
        q.querySelectorAll('.quiz-option').forEach(o => {
          o.classList.add('disabled');
          if (o.dataset.correct === 'true') o.classList.add('correct');
        });
        if (!correct) opt.classList.add('wrong');
        const fb = q.querySelector('.quiz-feedback');
        if (fb) {
          fb.textContent = (correct ? 'Correct. ' : 'Incorrect. ') + (opt.dataset.explanation || '');
          fb.classList.add('show', correct ? 'correct-fb' : 'wrong-fb');
        }
      });
    });
  });
}

// ── Q&A accordion ────────────────────────────────────────────
function initQA() {
  document.querySelectorAll('.qa-item').forEach(item => {
    const btn = item.querySelector('.qa-q');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.qa-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── Demo dispatcher ──────────────────────────────────────────
const DEMO_MAP = {
  'demo-intro':         'initIntroDemo',
  'demo-relational':    'initRelationalDemo',
  'demo-sql':           'initSQLDemo',
  'demo-normalization': 'initNormalizationDemo',
  'demo-transaction':   'initTransactionDemo',
  'demo-index':         'initIndexDemo',
  'demo-query':         'initQueryDemo',
  'demo-concurrency':   'initConcurrencyDemo',
  'demo-storage':       'initStorageDemo',
  'demo-nosql':         'initNoSQLDemo',
  'demo-distributed':   'initDistributedDemo',
  'demo-interview':     'initInterviewDemo',
};
function initDemos() {
  for (const [id, fn] of Object.entries(DEMO_MAP)) {
    const el = document.getElementById(id);
    if (el && typeof window[fn] === 'function') {
      try { window[fn](el); } catch(e) { console.warn(fn, e); }
    }
  }
}

// ── Shared canvas utilities ───────────────────────────────────
// HiDPI canvas setup
window.setupCanvas = function(canvas) {
  const dpr  = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width  = Math.floor(rect.width  * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height, dpr };
};

// Visibility-aware animation loop using IntersectionObserver
window.makeVisibleLoop = function(canvas, drawFn) {
  let raf = null, visible = false, last = performance.now();
  const tick = (now) => {
    if (!visible) { raf = null; return; }
    const dt = Math.min(50, now - last);
    last = now;
    drawFn(now, dt);
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!visible) { visible = true; last = performance.now(); raf = requestAnimationFrame(tick); }
      } else {
        visible = false;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      }
    });
  }, { threshold: 0.01 });
  io.observe(canvas);
};

// 3D isometric projection
window.iso = function(x, y, z, cx, cy, scale, rotY, tiltX) {
  const ry  = (rotY  === undefined) ? 0.60 : rotY;
  const tx  = (tiltX === undefined) ? 0.55 : tiltX;
  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const xr  = x * cosY - y * sinY;
  const yr  = x * sinY + y * cosY;
  const cosT = Math.cos(tx), sinT = Math.sin(tx);
  const yr2 = yr * cosT - z * sinT;
  const zr2 = yr * sinT + z * cosT;
  return { x: cx + xr * scale, y: cy + yr2 * scale, depth: zr2 };
};

// ── Hero: 3D query-cost surface + gradient-descent ball ──────
function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  let W, H, ctx, dpr;

  function resize() {
    const parent = canvas.parentElement;
    W   = parent.offsetWidth  || 640;
    H   = parent.offsetHeight || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ── Surface: query-cost landscape (bowl + data-wave perturbations) ──
  const N     = 28;
  const RANGE = 1.25;
  const STEP  = (2 * RANGE) / (N - 1);

  function surfaceZ(x, y, t) {
    return 0.54 * (x * x + y * y)
      - 0.11 * Math.sin(x * 2.8 + t * 0.78)
      - 0.09 * Math.cos(y * 2.2 - t * 0.64)
      + 0.06 * Math.sin((x + y) * 1.9 + t * 0.42);
  }

  // ── Ball (query optimizer) ────────────────────────────────
  const ball = {
    x:  (Math.random() - 0.5) * RANGE * 1.6,
    y:  (Math.random() - 0.5) * RANGE * 1.6,
    vx: (Math.random() - 0.5) * 0.04,
    vy: (Math.random() - 0.5) * 0.04,
  };
  const trail    = [];
  const TRAIL_MAX = 55;

  function resetBall() {
    ball.x  = (Math.random() - 0.5) * RANGE * 1.7;
    ball.y  = (Math.random() - 0.5) * RANGE * 1.7;
    ball.vx = (Math.random() - 0.5) * 0.06;
    ball.vy = (Math.random() - 0.5) * 0.06;
    trail.length = 0;
  }

  // ── Floating particles ────────────────────────────────────
  const PARTS = Array.from({ length: 80 }, () => ({
    gx:    (Math.random() - 0.5) * 3.4,
    gy:    (Math.random() - 0.5) * 3.4,
    gz:    (Math.random() - 0.5) * 2.0,
    alpha: 0.15 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    freq:  0.55 + Math.random() * 0.9,
  }));

  let rotY = 0.58;

  // ── Visibility-aware animation loop ──────────────────────
  let raf = null, visible = false;
  function tick(now) {
    if (!visible) { raf = null; return; }
    draw(now);
    raf = requestAnimationFrame(tick);
  }
  const heroIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        if (!visible) { visible = true; raf = requestAnimationFrame(tick); }
      } else {
        visible = false;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      }
    });
  }, { threshold: 0.01 });
  heroIO.observe(canvas);

  // Click anywhere on canvas to relaunch ball from new position
  canvas.addEventListener('click', resetBall);
  canvas.style.cursor = 'crosshair';

  // ── Main draw ─────────────────────────────────────────────
  function draw(now) {
    const t = now * 0.001;
    rotY += 0.00022;           // slow auto-rotation

    ctx.clearRect(0, 0, W, H);

    // Background — deep purple radial gradient
    const bgG = ctx.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.55, W * 0.72);
    bgG.addColorStop(0,    '#10062a');
    bgG.addColorStop(0.42, '#08031a');
    bgG.addColorStop(1,    '#05030e');
    ctx.fillStyle = bgG;
    ctx.fillRect(0, 0, W, H);

    const cx    = W * 0.5;
    const cy    = H * 0.44;
    const scale = Math.min(W, H) * 0.255;

    // Build grid point screen coords
    const pts = new Array(N * N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const gx = -RANGE + i * STEP;
        const gy = -RANGE + j * STEP;
        const gz = surfaceZ(gx, gy, t);
        const p  = window.iso(gx, gy, gz, cx, cy, scale, rotY);
        pts[j * N + i] = { sx: p.x, sy: p.y, d: p.depth };
      }
    }

    // Color a line segment by depth: far = dim navy, near = bright cyan
    function lineRGBA(depth) {
      const u = Math.max(0, Math.min(1, (depth + 2.0) / 3.8));
      const r = Math.round(16  + u * 87);
      const g = Math.round(5   + u * 227);
      const b = Math.round(50  + u * 199);
      const a = (0.10 + u * 0.52).toFixed(3);
      return `rgba(${r},${g},${b},${a})`;
    }

    ctx.lineWidth = 0.68;

    // Horizontal strands (j fixed, i varies)
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N - 1; i++) {
        const a = pts[j * N + i], b = pts[j * N + i + 1];
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = lineRGBA((a.d + b.d) * 0.5);
        ctx.stroke();
      }
    }
    // Vertical strands (i fixed, j varies)
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N - 1; j++) {
        const a = pts[j * N + i], b = pts[(j + 1) * N + i];
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = lineRGBA((a.d + b.d) * 0.5);
        ctx.stroke();
      }
    }

    // Floating particles
    for (let k = 0; k < PARTS.length; k++) {
      const p = PARTS[k];
      const a = p.alpha * (0.4 + 0.6 * Math.sin(t * p.freq + p.phase));
      const pp = window.iso(p.gx, p.gy, p.gz, cx, cy, scale, rotY);
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${a.toFixed(3)})`;
      ctx.fill();
    }

    // ── Ball physics: gradient descent on surface ────────────
    const H2  = 0.013;
    const dgx = (surfaceZ(ball.x + H2, ball.y, t) - surfaceZ(ball.x - H2, ball.y, t)) / (2 * H2);
    const dgy = (surfaceZ(ball.x, ball.y + H2, t) - surfaceZ(ball.x, ball.y - H2, t)) / (2 * H2);
    ball.vx = ball.vx * 0.82 - 0.12 * dgx;
    ball.vy = ball.vy * 0.82 - 0.12 * dgy;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Boundary and convergence resets
    const CLAMP = RANGE * 0.93;
    if (Math.abs(ball.x) > CLAMP || Math.abs(ball.y) > CLAMP) { resetBall(); }
    const spd2 = ball.vx * ball.vx + ball.vy * ball.vy;
    if (spd2 < 6e-6 && ball.x * ball.x + ball.y * ball.y < 0.05) { resetBall(); }

    const bz = surfaceZ(ball.x, ball.y, t);
    const bp = window.iso(ball.x, ball.y, bz, cx, cy, scale, rotY);

    trail.push({ x: bp.x, y: bp.y });
    if (trail.length > TRAIL_MAX) trail.shift();

    // Trail — fading cyan ribbon
    if (trail.length > 2) {
      for (let i = 1; i < trail.length; i++) {
        const frac = i / trail.length;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = `rgba(103,232,249,${(frac * 0.72).toFixed(3)})`;
        ctx.lineWidth   = frac * 2.6;
        ctx.stroke();
      }
    }

    // Ball outer glow halo
    const BR    = 7.5;
    const glowR = ctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, BR * 4);
    glowR.addColorStop(0,    'rgba(103,232,249,0.88)');
    glowR.addColorStop(0.28, 'rgba(103,232,249,0.42)');
    glowR.addColorStop(0.65, 'rgba(103,232,249,0.10)');
    glowR.addColorStop(1,    'rgba(103,232,249,0)');
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, BR * 4, 0, Math.PI * 2);
    ctx.fillStyle = glowR;
    ctx.fill();

    // Ball body — inner radial gradient for 3D sheen
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, BR, 0, Math.PI * 2);
    const ballG = ctx.createRadialGradient(
      bp.x - BR * 0.32, bp.y - BR * 0.32, BR * 0.08,
      bp.x, bp.y, BR
    );
    ballG.addColorStop(0, 'rgba(230,255,255,1)');
    ballG.addColorStop(1, 'rgba(103,232,249,1)');
    ctx.fillStyle = ballG;
    ctx.fill();
  }
}

// ── Navbar scroll shadow ─────────────────────────────────────
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const update = () => {
    nav.style.boxShadow = document.documentElement.scrollTop > 20
      ? '0 4px 24px rgba(0,0,0,0.5)' : '';
  };
  window.addEventListener('scroll', update, { passive: true });
}

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initReadingProgress();
  initNavbar();
  initQuiz();
  initQA();

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  if (document.getElementById('hero-canvas')) {
    initHero();
  }

  requestAnimationFrame(() => {
    initDemos();
    requestAnimationFrame(initScrollReveals);
  });
});
