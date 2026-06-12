'use strict';

/* =============================================================
   DBMS Illustrated — main.js  v4.0
   Theme / Progress / Reveals / Quiz / QA / Three.js Hero / SVG packets
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
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => { el.classList.add('reveal'); io.observe(el); });
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
window.setupCanvas = function(canvas) {
  const dpr  = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width  = Math.floor(rect.width  * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height, dpr };
};

window.makeVisibleLoop = function(canvas, drawFn) {
  let raf = null, visible = false, last = performance.now();
  const tick = (now) => {
    if (!visible) { raf = null; return; }
    const dt = Math.min(50, now - last); last = now;
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

window.iso = function(x, y, z, cx, cy, scale, rotY, tiltX) {
  const ry = (rotY  === undefined) ? 0.60 : rotY;
  const tx = (tiltX === undefined) ? 0.55 : tiltX;
  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const xr  = x * cosY - y * sinY;
  const yr  = x * sinY + y * cosY;
  const cosT = Math.cos(tx), sinT = Math.sin(tx);
  const yr2 = yr * cosT - z * sinT;
  const zr2 = yr * sinT + z * cosT;
  return { x: cx + xr * scale, y: cy + yr2 * scale, depth: zr2 };
};

// ── SVG packet animation (ported from SDC) ───────────────────
function initDiagramPackets() {
  function eio(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  document.querySelectorAll('.diagram-box svg').forEach(function(svg) {
    const pkts  = Array.from(svg.querySelectorAll('.pkt'));
    const lines = Array.from(svg.querySelectorAll('line'));
    if (!pkts.length || !lines.length) return;

    // For each packet, find closest line endpoint and assign a travel path
    const animData = pkts.map(function(pkt, i) {
      const cx0 = parseFloat(pkt.getAttribute('cx') || 0);
      const cy0 = parseFloat(pkt.getAttribute('cy') || 0);
      let best = null, bestDist = Infinity;
      lines.forEach(function(l) {
        const x1 = parseFloat(l.getAttribute('x1')), y1 = parseFloat(l.getAttribute('y1'));
        const x2 = parseFloat(l.getAttribute('x2')), y2 = parseFloat(l.getAttribute('y2'));
        const d = Math.min(
          (cx0-x1)*(cx0-x1)+(cy0-y1)*(cy0-y1),
          (cx0-x2)*(cx0-x2)+(cy0-y2)*(cy0-y2)
        );
        if (d < bestDist) { bestDist = d; best = l; }
      });
      if (!best) return null;
      const x1 = parseFloat(best.getAttribute('x1')), y1 = parseFloat(best.getAttribute('y1'));
      const x2 = parseFloat(best.getAttribute('x2')), y2 = parseFloat(best.getAttribute('y2'));
      return { pkt, x1, y1, x2, y2, phase: i * 0.38, speed: 0.26 + (i % 5) * 0.06 };
    }).filter(Boolean);

    if (!animData.length) return;

    const t0 = performance.now();
    function tick(now) {
      const elapsed = (now - t0) * 0.001;
      animData.forEach(function(a) {
        const raw = (elapsed * a.speed + a.phase) % 1;
        const alpha = raw < 0.08 ? raw / 0.08 : raw > 0.9 ? (1 - raw) / 0.1 : 1;
        const ease  = eio(raw);
        a.pkt.setAttribute('cx', a.x1 + (a.x2 - a.x1) * ease);
        a.pkt.setAttribute('cy', a.y1 + (a.y2 - a.y1) * ease);
        a.pkt.setAttribute('opacity', (alpha * 0.9).toFixed(3));
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ── Hero: Three.js 3D DBMS architecture ──────────────────────
function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  if (!window.THREE) { setTimeout(initHero, 150); return; }
  const T = window.THREE;

  // ── Scene ─────────────────────────────────────────────────
  const scene = new T.Scene();
  scene.background = new T.Color(0x05030e);
  scene.fog = new T.FogExp2(0x05030e, 0.028);

  // ── Camera ────────────────────────────────────────────────
  const camera = new T.PerspectiveCamera(48, 1, 0.1, 120);
  camera.position.set(4.5, 2.2, 11.5);
  camera.lookAt(0, 0, 0);

  // ── Renderer ──────────────────────────────────────────────
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  function resize() {
    const p = canvas.parentElement;
    const W = p.offsetWidth  || 640;
    const H = p.offsetHeight || window.innerHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // ── Lighting ──────────────────────────────────────────────
  scene.add(new T.AmbientLight(0x7C3AED, 0.45));
  const sun = new T.DirectionalLight(0xffffff, 0.65);
  sun.position.set(4, 8, 6);
  scene.add(sun);

  // ── Grid floor ────────────────────────────────────────────
  const grid = new T.GridHelper(24, 24, 0x3b1d8c, 0x1a1030);
  grid.position.y = -6.5;
  grid.material.opacity = 0.35;
  grid.material.transparent = true;
  scene.add(grid);

  // ── DBMS architecture nodes ────────────────────────────────
  const ARCH = [
    { id:'client',  label:'CLIENT',       sub:'Application',    color:'#06B6D4', hex:0x06B6D4, pos:[  0,  5.0,  0.8] },
    { id:'parser',  label:'SQL PARSER',   sub:'Tokenize + AST', color:'#8B5CF6', hex:0x8B5CF6, pos:[  0,  3.0, -0.6] },
    { id:'opt',     label:'OPTIMIZER',    sub:'Cost-based plan',color:'#7C3AED', hex:0x7C3AED, pos:[  0,  1.0,  0.5] },
    { id:'buf',     label:'BUFFER POOL',  sub:'LRU page cache', color:'#F59E0B', hex:0xF59E0B, pos:[-3.2,-1.0,  1.5] },
    { id:'txn',     label:'TX MANAGER',   sub:'ACID + 2PL',     color:'#A78BFA', hex:0xA78BFA, pos:[ 3.2,-1.0, -0.5] },
    { id:'db',      label:'PRIMARY DB',   sub:'PostgreSQL',     color:'#10B981', hex:0x10B981, pos:[  0, -3.0,  0.2] },
    { id:'wal',     label:'WAL',          sub:'Write-Ahead Log',color:'#EF4444', hex:0xEF4444, pos:[-2.5,-5.0,  0.8] },
    { id:'replica', label:'READ REPLICA', sub:'Async replication',color:'#14B8A6',hex:0x14B8A6,pos:[ 2.5,-5.0, -0.4] },
  ];

  const EDGES = [
    ['client','parser'], ['parser','opt'],
    ['opt','buf'], ['opt','txn'],
    ['buf','db'],  ['txn','db'],
    ['db','wal'],  ['db','replica'],
  ];

  const nodeMap   = {};
  const edgeCurves = [];
  let camAngle    = 0;

  // Canvas-texture label for 3D box face
  function makeLabel(label, sub, color) {
    const c = document.createElement('canvas');
    c.width = 288; c.height = 96;
    const cx = c.getContext('2d');
    cx.fillStyle = 'rgba(10,6,24,0.96)';
    cx.beginPath();
    if (cx.roundRect) cx.roundRect(0, 0, 288, 96, 10); else cx.rect(0, 0, 288, 96);
    cx.fill();
    cx.fillStyle = color; cx.fillRect(0, 0, 288, 4);
    cx.strokeStyle = color; cx.lineWidth = 1.5; cx.globalAlpha = 0.85;
    cx.beginPath();
    if (cx.roundRect) cx.roundRect(1, 1, 286, 94, 9); else cx.rect(1, 1, 286, 94);
    cx.stroke();
    cx.globalAlpha = 1;
    cx.fillStyle = '#EDE9FE'; cx.font = 'bold 17px monospace';
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText(label, 144, 42);
    cx.fillStyle = 'rgba(148,144,180,0.80)'; cx.font = '12px monospace';
    cx.fillText(sub, 144, 67);
    return new T.CanvasTexture(c);
  }

  // Radial glow sprite
  function makeGlow(hexStr, size) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const cx = c.getContext('2d');
    const r = parseInt(hexStr.slice(1,3),16), g = parseInt(hexStr.slice(3,5),16), b = parseInt(hexStr.slice(5,7),16);
    const gr = cx.createRadialGradient(64,64,0,64,64,64);
    gr.addColorStop(0,   `rgba(${r},${g},${b},0.6)`);
    gr.addColorStop(0.35,`rgba(${r},${g},${b},0.2)`);
    gr.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    cx.fillStyle = gr; cx.fillRect(0,0,128,128);
    const mat = new T.SpriteMaterial({
      map: new T.CanvasTexture(c),
      transparent: true, blending: T.AdditiveBlending, depthWrite: false
    });
    const sp = new T.Sprite(mat);
    sp.scale.set(size, size, 1);
    return sp;
  }

  // Build node groups
  ARCH.forEach(d => {
    const group = new T.Group();
    group.position.set(d.pos[0], d.pos[1], d.pos[2]);

    const boxGeo = new T.BoxGeometry(2.9, 0.88, 0.46);
    const tex    = makeLabel(d.label, d.sub, d.color);
    const c      = d.hex;

    const mats = [
      new T.MeshStandardMaterial({ color: 0x0a0618, emissive: c, emissiveIntensity: 0.07, metalness: 0.3, roughness: 0.7 }),
      new T.MeshStandardMaterial({ color: 0x0a0618, emissive: c, emissiveIntensity: 0.07, metalness: 0.3, roughness: 0.7 }),
      new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.45, metalness: 0.5, roughness: 0.4 }),
      new T.MeshStandardMaterial({ color: 0x060412, emissive: c, emissiveIntensity: 0.03 }),
      new T.MeshBasicMaterial({ map: tex, transparent: true }),
      new T.MeshStandardMaterial({ color: 0x0a0618, emissive: c, emissiveIntensity: 0.05 }),
    ];
    const box = new T.Mesh(boxGeo, mats);
    group.add(box);

    const edges = new T.LineSegments(
      new T.EdgesGeometry(boxGeo),
      new T.LineBasicMaterial({ color: d.hex, transparent: true, opacity: 0.7 })
    );
    group.add(edges);

    const glow = makeGlow(d.color, 4.8);
    glow.position.z = -0.35;
    group.add(glow);

    const light = new T.PointLight(d.hex, 0.85, 5.5);
    group.add(light);
    scene.add(group);

    nodeMap[d.id] = {
      group,
      pos: new T.Vector3(d.pos[0], d.pos[1], d.pos[2]),
      color: d.color, hex: d.hex, light
    };
  });

  // Build curved edges
  EDGES.forEach(([aid, bid]) => {
    const a = nodeMap[aid], b = nodeMap[bid];
    if (!a || !b) return;
    const mid = new T.Vector3(
      (a.pos.x + b.pos.x) * 0.5,
      (a.pos.y + b.pos.y) * 0.5,
      (a.pos.z + b.pos.z) * 0.5 + 0.5
    );
    const curve = new T.CatmullRomCurve3([a.pos.clone(), mid, b.pos.clone()]);
    const pts   = curve.getPoints(64);
    const line  = new T.Line(
      new T.BufferGeometry().setFromPoints(pts),
      new T.LineBasicMaterial({ color: 0x5b21b6, transparent: true, opacity: 0.38 })
    );
    scene.add(line);
    edgeCurves.push({ curve, fromId: aid, toId: bid });
  });

  // Background particle cloud
  const ptPos = new Float32Array(260 * 3);
  for (let i = 0; i < 260; i++) {
    ptPos[i*3]   = (Math.random()-0.5) * 22;
    ptPos[i*3+1] = (Math.random()-0.5) * 16;
    ptPos[i*3+2] = (Math.random()-0.5) * 9 - 2;
  }
  const ptGeo = new T.BufferGeometry();
  ptGeo.setAttribute('position', new T.BufferAttribute(ptPos, 3));
  scene.add(new T.Points(ptGeo, new T.PointsMaterial({
    color: 0xA78BFA, size: 0.055, transparent: true, opacity: 0.5,
    blending: T.AdditiveBlending
  })));

  // Animated data packets
  const packets = [];
  let lastSpawn = 0;

  function spawnPacket() {
    const idx    = Math.floor(Math.random() * EDGES.length);
    const [aid, bid] = EDGES[idx];
    const edge   = edgeCurves.find(e => e.fromId === aid && e.toId === bid);
    if (!edge) return;
    const hexCol = nodeMap[aid].hex;
    const pkt = new T.Mesh(
      new T.SphereGeometry(0.13, 8, 8),
      new T.MeshBasicMaterial({ color: hexCol })
    );
    const glow = makeGlow(nodeMap[aid].color, 1.1);
    pkt.add(glow);
    scene.add(pkt);
    packets.push({ mesh: pkt, curve: edge.curve, t: 0, spd: 0.008 + Math.random() * 0.006 });
  }

  // ── Animation loop ────────────────────────────────────────
  let raf = null, visible = false;
  function tick(now) {
    if (!visible) { raf = null; return; }

    const t = now * 0.001;
    camAngle += 0.0004;

    // Very subtle camera drift — no full orbit to keep architecture readable
    camera.position.x = 4.5 * Math.cos(camAngle) - 0.5 * Math.sin(camAngle);
    camera.position.z = 11.5 * Math.cos(camAngle * 0.3) + 1.5;
    camera.lookAt(0, 0, 0);

    // Spawn packets periodically
    if (now - lastSpawn > 700) { spawnPacket(); lastSpawn = now; }

    // Advance packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.spd;
      if (p.t >= 1) {
        scene.remove(p.mesh);
        packets.splice(i, 1);
        continue;
      }
      const pos = p.curve.getPoint(p.t);
      p.mesh.position.copy(pos);
    }

    // Pulse node glows
    ARCH.forEach((d, i) => {
      const n = nodeMap[d.id];
      const pulse = 0.7 + 0.3 * Math.sin(t * 0.9 + i * 1.1);
      n.light.intensity = 0.85 * pulse;
    });

    renderer.render(scene, camera);
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
  initDiagramPackets();

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  if (document.getElementById('hero-canvas')) {
    initHero();
  }

  requestAnimationFrame(() => {
    initDemos();
    requestAnimationFrame(initScrollReveals);
  });
});
