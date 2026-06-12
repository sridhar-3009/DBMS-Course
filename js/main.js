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

// ── Three.js Hero ─────────────────────────────────────────────
function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = () => canvas.parentElement.offsetWidth || 600;
  const H = () => canvas.parentElement.offsetHeight || 600;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(55, W()/H(), 0.1, 200);
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const sun = new THREE.DirectionalLight(0xA78BFA, 2.0);
  sun.position.set(6, 8, 6);
  scene.add(sun);
  const fillLight = new THREE.PointLight(0x7C3AED, 3.0, 30);
  fillLight.position.set(-6, -4, 4);
  scene.add(fillLight);

  const NODES = [
    { pos: [-5, -1.5, 0], color: 0x0EA5E9, emissive: 0x0369A1, label: 'OLTP'  },
    { pos: [ 5, -1.5, 0], color: 0xA78BFA, emissive: 0x6D28D9, label: 'OLAP'  },
    { pos: [ 0,  3.5, 0], color: 0x10B981, emissive: 0x065F46, label: 'NoSQL' },
  ];

  function makeLabel(text, hexColor) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 72;
    const cx = c.getContext('2d');
    cx.clearRect(0, 0, 256, 72);
    cx.font = 'bold 28px Inter, sans-serif';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillStyle = '#' + hexColor.toString(16).padStart(6, '0');
    cx.fillText(text, 128, 36);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    const spr = new THREE.Sprite(mat);
    spr.scale.set(2.8, 0.7, 1);
    return spr;
  }

  const meshes = [];
  NODES.forEach(n => {
    const geo = new THREE.CylinderGeometry(0.72, 0.72, 1.6, 40);
    const mat = new THREE.MeshPhongMaterial({
      color: n.color, emissive: n.emissive, emissiveIntensity: 0.35,
      shininess: 80, transparent: true, opacity: 0.88
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...n.pos);
    scene.add(mesh);

    const rGeo = new THREE.TorusGeometry(0.9, 0.045, 16, 64);
    const rMat = new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(n.pos[0], n.pos[1] + 0.82, n.pos[2]);
    scene.add(ring);

    const spr = makeLabel(n.label, n.color);
    spr.position.set(n.pos[0], n.pos[1] + 1.7, n.pos[2]);
    scene.add(spr);

    meshes.push({ mesh, mat, ring, rMat });
  });

  // Edges between nodes
  [[0,1],[1,2],[2,0]].forEach(([a, b]) => {
    const pts = [new THREE.Vector3(...NODES[a].pos), new THREE.Vector3(...NODES[b].pos)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: 0x3730a3, transparent: true, opacity: 0.55 });
    scene.add(new THREE.Line(geo, mat));
  });

  // Star field
  const starPts = [];
  for (let i = 0; i < 400; i++) {
    starPts.push((Math.random() - 0.5) * 90, (Math.random() - 0.5) * 90, (Math.random() - 0.5) * 90 - 20);
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPts, 3));
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0x6366F1, size: 0.08, transparent: true, opacity: 0.45 })));

  // Data particles travelling along edges
  const pGeo = new THREE.SphereGeometry(0.1, 6, 6);
  const EDGES = [[0,1],[1,2],[2,0]];
  const particles = [];
  let lastSpawn = 0;

  function spawnParticle() {
    const ei = Math.floor(Math.random() * EDGES.length);
    const [ai, bi] = Math.random() > 0.5 ? EDGES[ei] : [EDGES[ei][1], EDGES[ei][0]];
    const mat = new THREE.MeshBasicMaterial({ color: NODES[ai].color, transparent: true, opacity: 0.9 });
    const m = new THREE.Mesh(pGeo, mat);
    m.position.set(...NODES[ai].pos);
    scene.add(m);
    particles.push({
      m, mat,
      from: new THREE.Vector3(...NODES[ai].pos),
      to:   new THREE.Vector3(...NODES[bi].pos),
      t: 0,
      spd: 0.007 + Math.random() * 0.009
    });
  }

  let orbit = 0;
  function animate(t) {
    requestAnimationFrame(animate);
    orbit += 0.0022;
    camera.position.x = Math.sin(orbit) * 13;
    camera.position.z = Math.cos(orbit) * 13;
    camera.position.y = Math.sin(orbit * 0.3) * 2.5;
    camera.lookAt(0, 0, 0);

    meshes.forEach((n, i) => {
      n.mat.emissiveIntensity = 0.2 + Math.sin(t * 0.0016 + i * 2.1) * 0.14;
      n.rMat.opacity = 0.22 + Math.sin(t * 0.002 + i * 1.5) * 0.14;
    });

    if (t - lastSpawn > 700) { spawnParticle(); lastSpawn = t; }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t += p.spd;
      if (p.t >= 1) { scene.remove(p.m); particles.splice(i, 1); continue; }
      p.m.position.lerpVectors(p.from, p.to, p.t);
      p.mat.opacity = Math.sin(p.t * Math.PI) * 0.9;
    }
    renderer.render(scene, camera);
  }
  animate(0);

  window.addEventListener('resize', () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
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
    if (typeof THREE !== 'undefined') {
      initHero();
    } else {
      const check = setInterval(() => {
        if (typeof THREE !== 'undefined') { clearInterval(check); initHero(); }
      }, 80);
    }
  }

  requestAnimationFrame(() => {
    initDemos();
    // Scroll reveals run after demos so layout is settled
    requestAnimationFrame(initScrollReveals);
  });
});
