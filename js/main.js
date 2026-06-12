'use strict';

/* =============================================================
   DBMS Illustrated — main.js  v2.0
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

// ── Canvas 2D Hero (DB node graph, no WebGL needed) ──────────
function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const panel = canvas.parentElement;

  function resize() {
    canvas.width  = panel.offsetWidth  || 640;
    canvas.height = panel.offsetHeight || 720;
  }
  resize();

  const ctx = canvas.getContext('2d');

  const NODES = [
    { label:'OLTP', sub:'MySQL / PostgreSQL', color:'#0EA5E9', x:0.35, y:0.28 },
    { label:'OLAP', sub:'Snowflake / BigQuery', color:'#A78BFA', x:0.72, y:0.22 },
    { label:'NoSQL', sub:'MongoDB / Cassandra', color:'#10B981', x:0.62, y:0.58 },
    { label:'Cache', sub:'Redis / Memcached',   color:'#F59E0B', x:0.28, y:0.62 },
    { label:'Graph', sub:'Neo4j / Neptune',      color:'#EC4899', x:0.78, y:0.78 },
  ];

  const EDGES = [[0,1],[0,3],[1,2],[2,3],[2,4],[1,4]];

  // Star field
  const STARS = Array.from({length:140}, () => ({
    x: Math.random(), y: Math.random(),
    r: 0.5 + Math.random() * 1.2,
    a: 0.15 + Math.random() * 0.45,
    speed: 0.0003 + Math.random() * 0.0005,
    phase: Math.random() * Math.PI * 2,
  }));

  // Data packets on edges
  const packets = [];
  let lastPkt = 0;

  function spawnPacket(t) {
    const [a, b] = EDGES[Math.floor(Math.random() * EDGES.length)];
    const dir = Math.random() > 0.5 ? [a, b] : [b, a];
    packets.push({ from: dir[0], to: dir[1], t: 0, spd: 0.004 + Math.random() * 0.005 });
  }

  let tick = 0;

  function draw(ts) {
    requestAnimationFrame(draw);
    tick = ts;
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Stars
    STARS.forEach(s => {
      const a = s.a * (0.6 + 0.4 * Math.sin(ts * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${a})`;
      ctx.fill();
    });

    // Resolve node screen coords
    const pos = NODES.map(n => ({
      x: n.x * W, y: n.y * H,
      glow: 0.55 + 0.35 * Math.sin(ts * 0.0008 + NODES.indexOf(n) * 1.3)
    }));

    // Edges
    EDGES.forEach(([a, b]) => {
      const ax = pos[a].x, ay = pos[a].y, bx = pos[b].x, by = pos[b].y;
      const grad = ctx.createLinearGradient(ax, ay, bx, by);
      grad.addColorStop(0, hexA(NODES[a].color, 0.22));
      grad.addColorStop(1, hexA(NODES[b].color, 0.22));
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.strokeStyle = grad; ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Packets
    if (ts - lastPkt > 600) { spawnPacket(ts); lastPkt = ts; }
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.spd;
      if (p.t > 1) { packets.splice(i, 1); continue; }
      const fa = pos[p.from], ta = pos[p.to];
      const px = fa.x + (ta.x - fa.x) * easeInOut(p.t);
      const py = fa.y + (ta.y - fa.y) * easeInOut(p.t);
      const alpha = Math.sin(p.t * Math.PI);
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = hexA(NODES[p.from].color, alpha * 0.9);
      ctx.shadowBlur = 10; ctx.shadowColor = NODES[p.from].color;
      ctx.fill(); ctx.shadowBlur = 0;
    }

    // Nodes
    const R = Math.min(W, H) * 0.065;
    pos.forEach((p, i) => {
      const n = NODES[i];
      const g = p.glow;

      // Glow ring
      const grd = ctx.createRadialGradient(p.x, p.y, R * 0.6, p.x, p.y, R * 2.2);
      grd.addColorStop(0, hexA(n.color, 0.22 * g));
      grd.addColorStop(1, hexA(n.color, 0));
      ctx.beginPath(); ctx.arc(p.x, p.y, R * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // Cylinder body (two rects + ellipses)
      const cw = R * 2, ch = R * 0.6, cy = p.y - R * 0.3;
      ctx.beginPath();
      roundRectPath(ctx, p.x - R, cy - ch / 2, cw, ch * 2.4 + ch * 0.5, 8);
      const bodyGrad = ctx.createLinearGradient(p.x - R, cy, p.x + R, cy + ch * 2);
      bodyGrad.addColorStop(0, hexA(n.color, 0.85));
      bodyGrad.addColorStop(1, hexA(n.color, 0.45));
      ctx.fillStyle = bodyGrad; ctx.fill();
      ctx.strokeStyle = hexA(n.color, 0.9 * g); ctx.lineWidth = 1.5; ctx.stroke();

      // Top ellipse (disk highlight)
      ctx.beginPath();
      ctx.ellipse(p.x, cy - ch / 2, R, ch * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = hexA('#ffffff', 0.14); ctx.fill();
      ctx.strokeStyle = hexA(n.color, 0.7 * g); ctx.lineWidth = 1.2; ctx.stroke();

      // Label
      ctx.font = `bold ${Math.max(10, R * 0.62)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#EDE9FE';
      ctx.fillText(n.label, p.x, p.y + ch * 0.3);

      // Sub-label
      ctx.font = `${Math.max(8, R * 0.42)}px Inter, sans-serif`;
      ctx.fillStyle = hexA(n.color, 0.8);
      ctx.fillText(n.sub, p.x, p.y + ch * 1.5);
    });
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  function hexA(hex, a) {
    const r = parseInt(hex.slice(1,3),16), g2 = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g2},${b},${a.toFixed(3)})`;
  }
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  requestAnimationFrame(draw);

  window.addEventListener('resize', () => {
    resize();
  });
}

// ── Navbar scroll shadow ─────────────────────────────────────
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const update = () => {
    nav.style.boxShadow = document.documentElement.scrollTop > 20 ? '0 4px 24px rgba(0,0,0,0.5)' : '';
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
    // Scroll reveals run after demos so layout is settled
    requestAnimationFrame(initScrollReveals);
  });
});
