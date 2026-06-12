'use strict';
/* ============================================================
   DBMS Illustrated — demos.js  (12 Canvas demos)
   ============================================================ */

// ── Shared helpers ────────────────────────────────────────────
function mkCanvas(container, w, h) {
  const wrap = container.querySelector('.demo-canvas-wrap');
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  c.style.cssText = `width:100%;max-width:${w}px;height:auto;`;
  wrap.appendChild(c);
  return c;
}
function lerp(a,b,t){ return a+(b-a)*t; }
function eio(t){ return t<.5?2*t*t:-1+(4-2*t)*t; }
function isDark(){ return document.documentElement.getAttribute('data-theme') !== 'light'; }
function TC(){ // theme colors
  return isDark()
    ? { bg:'#070D19', bg2:'#1E293B', border:'#334155', text:'#F1F5F9', soft:'#94A3B8', muted:'#64748B' }
    : { bg:'#F0F4F8', bg2:'#FFFFFF', border:'#CBD5E1', text:'#0F172A', soft:'#475569', muted:'#94A3B8' };
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x,y,w,h,r)
    : (ctx.moveTo(x+r,y),ctx.lineTo(x+w-r,y),ctx.quadraticCurveTo(x+w,y,x+w,y+r),
       ctx.lineTo(x+w,y+h-r),ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h),
       ctx.lineTo(x+r,y+h),ctx.quadraticCurveTo(x,y+h,x,y+h-r),
       ctx.lineTo(x,y+r),ctx.quadraticCurveTo(x,y,x+r,y));
  ctx.closePath();
}

// ══════════════════════════════════════════════════════════════
// 01  ER Diagram
// ══════════════════════════════════════════════════════════════
function initIntroDemo(container) {
  const W=620, H=360;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');
  let sel = null;

  const ENT = [
    { id:0, x:105, y:180, w:130, h:54, label:'STUDENT' },
    { id:1, x:510, y:180, w:130, h:54, label:'COURSE'  },
    { id:2, x:310, y:180, w:140, h:54, label:'ENROLLMENT'},
  ];
  const RELS = [
    { x:208, y:180, label:'ENROLLS', sides:[0,2] },
    { x:415, y:180, label:'CONTAINS',sides:[2,1] },
  ];
  const ATTRS = [
    { eid:0, ox:-85, oy:-75, label:'student_id', key:true },
    { eid:0, ox:-95, oy:  0, label:'name' },
    { eid:0, ox:-75, oy: 72, label:'email' },
    { eid:0, ox: 55, oy:-72, label:'year' },
    { eid:1, ox: 85, oy:-75, label:'course_id', key:true },
    { eid:1, ox: 95, oy:  0, label:'credits' },
    { eid:1, ox: 75, oy: 72, label:'dept' },
    { eid:1, ox:-55, oy:-72, label:'title' },
    { eid:2, ox:  0, oy:-80, label:'grade' },
    { eid:2, ox:  0, oy: 80, label:'enroll_date' },
  ];

  function highlight(id) {
    if (id===null) return { e:[], r:[], a:[] };
    const rs = RELS.reduce((acc,r,i)=>{ if(r.sides.includes(id)) acc.push(i); return acc; },[]);
    const es = new Set([id]);
    rs.forEach(ri=>RELS[ri].sides.forEach(i=>es.add(i)));
    const as = ATTRS.reduce((acc,a,i)=>{ if(es.has(a.eid)) acc.push(i); return acc; },[]);
    return { e:[...es], r:rs, a:as };
  }

  function draw() {
    const c = TC(), h = highlight(sel);
    ctx.clearRect(0,0,W,H);

    // bg
    ctx.fillStyle = isDark() ? '#070D19' : '#F0F4F8';
    ctx.fillRect(0,0,W,H);

    // Attr lines
    ATTRS.forEach((a,i) => {
      const ex=ENT[a.eid].x, ey=ENT[a.eid].y;
      ctx.beginPath(); ctx.moveTo(ex,ey); ctx.lineTo(ex+a.ox,ey+a.oy);
      ctx.strokeStyle = h.a.includes(i) ? '#0EA5E9' : c.border;
      ctx.lineWidth = h.a.includes(i) ? 1.5 : 1; ctx.stroke();
    });
    // Rel lines
    RELS.forEach((r,ri) => {
      r.sides.forEach(eid => {
        ctx.beginPath(); ctx.moveTo(r.x,r.y); ctx.lineTo(ENT[eid].x,ENT[eid].y);
        ctx.strokeStyle = h.r.includes(ri) ? '#8B5CF6' : c.border;
        ctx.lineWidth = h.r.includes(ri) ? 2 : 1; ctx.stroke();
      });
    });
    // Attrs
    ATTRS.forEach((a,i) => {
      const ax=ENT[a.eid].x+a.ox, ay=ENT[a.eid].y+a.oy;
      const hi = h.a.includes(i);
      ctx.beginPath(); ctx.ellipse(ax,ay,40,17,0,0,Math.PI*2);
      ctx.fillStyle = hi ? 'rgba(14,165,233,.18)' : (isDark()?'rgba(30,41,59,.9)':'rgba(255,255,255,.9)');
      ctx.fill();
      ctx.strokeStyle = hi ? '#0EA5E9' : c.border; ctx.lineWidth = hi?2:1; ctx.stroke();
      if (a.key) {
        ctx.beginPath(); ctx.ellipse(ax,ay,37,14,0,0,Math.PI*2);
        ctx.strokeStyle = hi ? '#38BDF8' : c.muted; ctx.lineWidth=1; ctx.stroke();
      }
      ctx.fillStyle = hi ? '#7DD3FC' : c.soft; ctx.font = a.key?'bold 9.5px Inter':'9.5px Inter';
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(a.label,ax,ay);
    });
    // Relationships
    RELS.forEach((r,ri) => {
      const hi = h.r.includes(ri), s=28;
      ctx.beginPath(); ctx.moveTo(r.x,r.y-s); ctx.lineTo(r.x+s,r.y); ctx.lineTo(r.x,r.y+s); ctx.lineTo(r.x-s,r.y); ctx.closePath();
      ctx.fillStyle = hi?'rgba(139,92,246,.18)':(isDark()?'rgba(30,41,59,.9)':'rgba(255,255,255,.9)'); ctx.fill();
      ctx.strokeStyle = hi?'#8B5CF6':c.border; ctx.lineWidth=hi?2:1.5; ctx.stroke();
      ctx.fillStyle=hi?'#C4B5FD':c.soft; ctx.font='bold 8px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(r.label,r.x,r.y);
    });
    // Entities
    ENT.forEach(e => {
      const hi = h.e.includes(e.id);
      roundRect(ctx,e.x-e.w/2,e.y-e.h/2,e.w,e.h,6);
      ctx.fillStyle = hi?'rgba(14,165,233,.18)':(isDark()?'rgba(30,41,59,.95)':'rgba(255,255,255,.95)'); ctx.fill();
      ctx.strokeStyle = hi?'#0EA5E9':c.border; ctx.lineWidth=hi?2.5:1.5; ctx.stroke();
      ctx.fillStyle = hi?'#38BDF8':c.text; ctx.font='bold 13px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(e.label,e.x,e.y);
    });
  }

  canvas.addEventListener('click', e => {
    const r=canvas.getBoundingClientRect(), sx=W/r.width, sy=H/r.height;
    const mx=(e.clientX-r.left)*sx, my=(e.clientY-r.top)*sy;
    let clicked=null;
    ENT.forEach(en=>{ if(Math.abs(mx-en.x)<en.w/2&&Math.abs(my-en.y)<en.h/2) clicked=en.id; });
    sel = clicked===sel?null:clicked; draw();
  });
  canvas.style.cursor='pointer';
  draw();
}

// ══════════════════════════════════════════════════════════════
// 02  Relational / JOIN
// ══════════════════════════════════════════════════════════════
function initRelationalDemo(container) {
  const W=640, H=380;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  let joinType = 'INNER', anim = null, animT = 0, matchPairs=[];

  const LEFT = {
    title:'employees', color:'#0EA5E9',
    cols:['emp_id','name','dept_id'],
    rows:[ [1,'Alice',10],[2,'Bob',20],[3,'Carol',10],[4,'Dave',30] ]
  };
  const RIGHT = {
    title:'departments', color:'#8B5CF6',
    cols:['dept_id','dept_name'],
    rows:[ [10,'Engineering'],[20,'Marketing'],[40,'HR'] ]
  };

  const RH=28, RW=230, LX=20, RX=390, TY=60, CH=26;

  function buildResult(jt) {
    const res = [];
    LEFT.rows.forEach(lr=>{
      const rr = RIGHT.rows.find(r=>r[0]===lr[2]);
      if (jt==='INNER') { if(rr) res.push([lr[0],lr[1],lr[2],rr[1]]); }
      else if(jt==='LEFT')  res.push([lr[0],lr[1],lr[2],rr?rr[1]:'NULL']);
      else if(jt==='RIGHT') { /* handled below */ }
    });
    if(jt==='RIGHT'){
      RIGHT.rows.forEach(rr=>{
        const lr=LEFT.rows.find(l=>l[2]===rr[0]);
        res.push([lr?lr[0]:'NULL',lr?lr[1]:'NULL',rr[0],rr[1]]);
      });
    }
    return res;
  }

  function drawTable(table, x, y, highlightRow, alpha=1) {
    ctx.globalAlpha=alpha;
    // header
    roundRect(ctx,x,y,RW,CH,4);
    ctx.fillStyle=table.color; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(table.title, x+RW/2, y+CH/2);
    // cols
    const cw=RW/table.cols.length;
    table.cols.forEach((col,i)=>{
      ctx.fillStyle=isDark()?'#243347':'#E8EDF3';
      ctx.fillRect(x+i*cw, y+CH, cw-1, 20);
      ctx.fillStyle=TC().muted; ctx.font='bold 9px Inter'; ctx.textAlign='center';
      ctx.fillText(col, x+i*cw+cw/2, y+CH+10);
    });
    // rows
    table.rows.forEach((row,ri)=>{
      const ry=y+CH+20+ri*RH, hi=(highlightRow===ri);
      roundRect(ctx,x,ry,RW,RH-2,2);
      ctx.fillStyle=hi?color(table.color,.2):(isDark()?'#1E293B':'#fff'); ctx.fill();
      ctx.strokeStyle=hi?table.color:TC().border; ctx.lineWidth=hi?1.5:0.5; ctx.stroke();
      row.forEach((cell,ci)=>{
        ctx.fillStyle=String(cell)==='NULL'?TC().muted:TC().text;
        ctx.font='11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(cell), x+ci*cw+cw/2, ry+RH/2-1);
      });
    });
    ctx.globalAlpha=1;
  }

  function color(hex, a){ return hex+'%hex'; /* fallback */ }
  function withAlpha(hex,a){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);

    // result label
    const result = buildResult(joinType);
    const resY = TY + CH + 20 + Math.max(LEFT.rows.length, RIGHT.rows.length)*RH + 24;

    const hi = anim !== null ? matchPairs[Math.floor(anim)] : null;
    drawTable(LEFT,  LX, TY, hi?hi[0]:null);
    drawTable(RIGHT, RX, TY, hi?hi[1]:null);

    // Animated join line
    if (anim!==null && matchPairs.length) {
      const pi = Math.floor(animT * matchPairs.length);
      if (pi < matchPairs.length) {
        const [li, ri] = matchPairs[pi];
        const ly = TY+CH+20+li*RH+RH/2;
        const ry2 = TY+CH+20+ri*RH+RH/2;
        const t = (animT*matchPairs.length)%1;
        ctx.beginPath();
        ctx.moveTo(LX+RW, ly); ctx.bezierCurveTo(W/2, ly, W/2, ry2, RX, ry2);
        ctx.strokeStyle=`rgba(16,185,129,${0.3+t*0.5})`; ctx.lineWidth=2; ctx.stroke();
      }
    }

    // Result table
    if (result.length > 0) {
      const cols=['emp_id','name','dept_id','dept_name'];
      const rw=W-40, cx2=20, ry=resY;
      roundRect(ctx,cx2,ry,rw,CH,4);
      ctx.fillStyle='#10B981'; ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(`${joinType} JOIN Result (${result.length} rows)`, cx2+rw/2, ry+CH/2);
      const cw2=rw/cols.length;
      cols.forEach((col,i)=>{
        ctx.fillStyle=isDark()?'#243347':'#E8EDF3'; ctx.fillRect(cx2+i*cw2,ry+CH,cw2-1,20);
        ctx.fillStyle=TC().muted; ctx.font='bold 9px Inter'; ctx.textAlign='center'; ctx.fillText(col,cx2+i*cw2+cw2/2,ry+CH+10);
      });
      result.slice(0,4).forEach((row,ri)=>{
        const rowY=ry+CH+20+ri*RH;
        roundRect(ctx,cx2,rowY,rw,RH-2,2);
        ctx.fillStyle=isDark()?'#1E293B':'#fff'; ctx.fill();
        ctx.strokeStyle=TC().border; ctx.lineWidth=0.5; ctx.stroke();
        row.forEach((cell,ci)=>{
          ctx.fillStyle=String(cell)==='NULL'?TC().muted:TC().text;
          ctx.font='11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(String(cell),cx2+ci*cw2+cw2/2,rowY+RH/2-1);
        });
      });
    }
  }

  // Build match pairs for current join
  function buildPairs() {
    const pairs=[];
    LEFT.rows.forEach((lr,li)=>{
      RIGHT.rows.forEach((rr,ri)=>{ if(lr[2]===rr[0]) pairs.push([li,ri]); });
    });
    if(joinType==='LEFT') LEFT.rows.forEach((lr,li)=>{ if(!RIGHT.rows.find(r=>r[0]===lr[2])) pairs.push([li,-1]); });
    if(joinType==='RIGHT') RIGHT.rows.forEach((rr,ri)=>{ if(!LEFT.rows.find(l=>l[2]===rr[0])) pairs.push([-1,ri]); });
    return pairs;
  }

  let raf;
  function runAnim() {
    cancelAnimationFrame(raf);
    matchPairs = buildPairs();
    animT=0; anim=0;
    function step() {
      animT += 0.015;
      if(animT>=1){ animT=1; anim=null; draw(); return; }
      draw(); raf=requestAnimationFrame(step);
    }
    raf=requestAnimationFrame(step);
  }

  // Controls
  container.querySelectorAll('.join-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      container.querySelectorAll('.join-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      joinType=btn.dataset.join;
      runAnim();
    });
  });
  container.querySelector('[data-join="INNER"]')?.classList.add('active');
  draw();
  setTimeout(runAnim, 400);
}

// ══════════════════════════════════════════════════════════════
// 03  SQL Query Visualizer
// ══════════════════════════════════════════════════════════════
function initSQLDemo(container) {
  const W=620, H=300;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  const DATA = [
    { id:1, name:'Alice',   dept:'Engineering', salary:95000 },
    { id:2, name:'Bob',     dept:'Marketing',   salary:72000 },
    { id:3, name:'Carol',   dept:'Engineering', salary:110000},
    { id:4, name:'Dave',    dept:'HR',          salary:65000 },
    { id:5, name:'Eve',     dept:'Engineering', salary:88000 },
    { id:6, name:'Frank',   dept:'Marketing',   salary:78000 },
  ];

  const PRESETS = [
    'SELECT * FROM employees WHERE dept = \'Engineering\'',
    'SELECT * FROM employees WHERE salary > 80000',
    'SELECT * FROM employees WHERE dept = \'Marketing\' OR salary > 90000',
    'SELECT * FROM employees ORDER BY salary DESC',
  ];

  let rowState = DATA.map(()=>({ alpha:1, match:true }));
  let scanning = false, scanIdx=0, rowCount=0, scanAnim=0;

  function evalRow(row, query) {
    const q = query.toLowerCase();
    if (q.includes('where')) {
      const w = q.split('where')[1].trim();
      if (w.includes("dept = 'engineering'")) return row.dept==='Engineering';
      if (w.includes("dept = 'marketing'"))  return row.dept==='Marketing';
      if (w.includes("dept = 'hr'"))         return row.dept==='HR';
      if (w.includes('salary > 80000'))  return row.salary>80000;
      if (w.includes('salary > 90000'))  return row.salary>90000;
      if (w.includes('salary > 70000'))  return row.salary>70000;
      if (w.includes('or')) {
        return (w.includes("dept = 'marketing'")&&row.dept==='Marketing') || (w.includes('salary > 90000')&&row.salary>90000);
      }
    }
    return true;
  }

  let animData = DATA.slice();
  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);

    const cols=['id','name','dept','salary'];
    const cw=[40,140,160,100,80], cx=[10,50,190,350,450];
    const RH=34, headerY=10, dataY=44;

    // Header
    cols.forEach((col,i)=>{
      ctx.fillStyle=isDark()?'#243347':'#E8EDF3'; ctx.fillRect(cx[i],headerY,cw[i]-2,24);
      ctx.fillStyle=TC().muted; ctx.font='bold 10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(col.toUpperCase(), cx[i]+cw[i]/2, headerY+12);
    });
    // Scan indicator
    if(scanning && scanIdx<animData.length){
      ctx.fillStyle='rgba(14,165,233,.08)'; ctx.fillRect(0, dataY+scanIdx*RH, W, RH);
      ctx.strokeStyle='#0EA5E9'; ctx.lineWidth=1; ctx.setLineDash([4,3]);
      ctx.strokeRect(0, dataY+scanIdx*RH, W, RH); ctx.setLineDash([]);
    }
    // Rows
    animData.forEach((row,i)=>{
      const st = rowState[i];
      const y = dataY + i*RH;
      ctx.globalAlpha = st.alpha;
      roundRect(ctx,2,y,W-4,RH-2,3);
      if(st.match)      ctx.fillStyle=isDark()?'rgba(16,185,129,.15)':'rgba(16,185,129,.08)';
      else              ctx.fillStyle=isDark()?'rgba(30,41,59,.5)':'rgba(240,244,248,.5)';
      ctx.fill();
      ctx.strokeStyle=st.match?'#10B981':TC().border; ctx.lineWidth=st.match?1:0.5; ctx.stroke();
      [row.id,row.name,row.dept,'$'+row.salary.toLocaleString()].forEach((val,j)=>{
        ctx.fillStyle=st.match?TC().text:TC().muted; ctx.font='11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(val), cx[j]+cw[j]/2, y+RH/2);
      });
      ctx.globalAlpha=1;
    });
    // Stats overlay
    if(!scanning){
      const matched = rowState.filter(r=>r.match).length;
      ctx.fillStyle=isDark()?'rgba(7,13,25,.85)':'rgba(240,244,248,.9)';
      roundRect(ctx,W-165,dataY,160,40,6); ctx.fill();
      ctx.strokeStyle=TC().border; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle=TC().muted; ctx.font='10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(`Rows examined: ${DATA.length}`, W-85, dataY+14);
      ctx.fillStyle='#10B981'; ctx.font='bold 11px Inter';
      ctx.fillText(`✓ ${matched} rows returned`, W-85, dataY+28);
    }
  }

  let raf;
  function runQuery(query) {
    cancelAnimationFrame(raf);
    rowState = DATA.map(()=>({ alpha:1, match:false }));
    scanning=true; scanIdx=0;
    function step(){
      if(scanIdx < DATA.length){
        rowState[scanIdx].match = evalRow(DATA[scanIdx], query);
        rowState[scanIdx].alpha = rowState[scanIdx].match ? 1 : 0.3;
        scanIdx++; draw();
        raf = setTimeout(()=>requestAnimationFrame(step), 120);
      } else { scanning=false; draw(); }
    }
    requestAnimationFrame(step);
  }

  const input = container.querySelector('.demo-input');
  const runBtn = container.querySelector('[data-action="run-sql"]');
  if(input) input.value = PRESETS[0];
  runBtn?.addEventListener('click', ()=>{ if(input) runQuery(input.value); });
  container.querySelectorAll('[data-preset]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const q = PRESETS[parseInt(btn.dataset.preset)];
      if(input) input.value=q;
      runQuery(q);
    });
  });
  draw();
  setTimeout(()=>runQuery(PRESETS[0]),500);
}

// ══════════════════════════════════════════════════════════════
// 04  Normalization
// ══════════════════════════════════════════════════════════════
function initNormalizationDemo(container) {
  const W=620, H=310;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');
  let step = 0; // 0=denorm 1=1NF 2=2NF 3=3NF
  let animT = 1;

  const STAGES = [
    {
      title:'Denormalized (Violations)',
      tables:[{
        name:'order_data', color:'#EF4444',
        cols:['order_id','customer_name','customer_city','products','total'],
        rows:[
          [101,'Alice','NYC','Apple,Banana',25.00],
          [102,'Bob','LA','Cherry',8.00],
          [103,'Alice','NYC','Date,Fig,Grape',35.00],
        ],
        issues:[3] // col index with issues
      }]
    },
    {
      title:'1NF — Atomic values',
      tables:[{
        name:'orders_1nf', color:'#F59E0B',
        cols:['order_id','customer_name','customer_city','product','price'],
        rows:[
          [101,'Alice','NYC','Apple',10],[101,'Alice','NYC','Banana',15],
          [102,'Bob','LA','Cherry',8],
          [103,'Alice','NYC','Date',15],[103,'Alice','NYC','Fig',10],[103,'Alice','NYC','Grape',10],
        ],
        issues:[]
      }]
    },
    {
      title:'2NF — Remove partial dependencies',
      tables:[
        { name:'orders', color:'#0EA5E9',
          cols:['order_id','customer_id','order_date'],
          rows:[[101,1,'2024-01'],[102,2,'2024-01'],[103,1,'2024-02']] },
        { name:'customers', color:'#8B5CF6',
          cols:['customer_id','name','city'],
          rows:[[1,'Alice','NYC'],[2,'Bob','LA']] },
        { name:'order_items', color:'#10B981',
          cols:['order_id','product','price'],
          rows:[[101,'Apple',10],[101,'Banana',15],[102,'Cherry',8]] },
      ]
    },
    {
      title:'3NF — Remove transitive dependencies',
      tables:[
        { name:'orders', color:'#0EA5E9',
          cols:['order_id','cust_id'],
          rows:[[101,1],[102,2],[103,1]] },
        { name:'customers', color:'#8B5CF6',
          cols:['cust_id','name','zip'],
          rows:[[1,'Alice','10001'],[2,'Bob','90001']] },
        { name:'zip_city', color:'#14B8A6',
          cols:['zip','city','state'],
          rows:[['10001','NYC','NY'],['90001','LA','CA']] },
        { name:'order_items', color:'#10B981',
          cols:['order_id','product','price'],
          rows:[[101,'Apple',10],[101,'Banana',15]] },
      ]
    }
  ];

  function drawTable(table, x, y, maxW) {
    const RH=22, CH=24, cw=Math.floor(maxW/table.cols.length);
    roundRect(ctx,x,y,maxW,CH,4);
    ctx.fillStyle=table.color; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(table.name, x+maxW/2, y+CH/2);
    table.cols.forEach((col,i)=>{
      ctx.fillStyle=isDark()?'#243347':'#E8EDF3'; ctx.fillRect(x+i*cw,y+CH,cw-1,18);
      ctx.fillStyle=TC().muted; ctx.font='bold 8px Inter'; ctx.textAlign='center';
      ctx.fillText(col,x+i*cw+cw/2,y+CH+9);
    });
    table.rows.forEach((row,ri)=>{
      const ry=y+CH+18+ri*RH;
      ctx.fillStyle=isDark()?'#1E293B':'#fff'; ctx.fillRect(x,ry,maxW,RH-1);
      ctx.strokeStyle=TC().border; ctx.lineWidth=0.5;
      ctx.strokeRect(x,ry,maxW,RH-1);
      row.forEach((cell,ci)=>{
        const isIssue = table.issues && table.issues.includes(ci);
        ctx.fillStyle=isIssue?'#EF4444':TC().soft; ctx.font=(isIssue?'bold ':')+'9.5px Inter';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        const txt=String(cell).length>14?String(cell).slice(0,13)+'…':String(cell);
        ctx.fillText(txt,x+ci*cw+cw/2,ry+RH/2);
      });
    });
    return maxW;
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);
    const stage = STAGES[step];

    // Title
    ctx.fillStyle=TC().text; ctx.font='bold 13px Inter'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText(stage.title, W/2, 8);

    // Stage indicator
    STAGES.forEach((_,i)=>{
      const sx=W/2-60+i*40;
      ctx.beginPath(); ctx.arc(sx,H-16,7,0,Math.PI*2);
      ctx.fillStyle=i===step?TC().text:(isDark()?'#243347':'#CBD5E1'); ctx.fill();
      ctx.fillStyle=i===step?(isDark()?'#070D19':'#fff'):(i<step?TC().text:TC().muted);
      ctx.font='bold 8px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(i===0?'D':i+'NF',sx,H-16);
    });

    ctx.globalAlpha = eio(animT);
    if(stage.tables.length===1){
      drawTable(stage.tables[0], 10, 28, W-20);
    } else if(stage.tables.length===2){
      drawTable(stage.tables[0], 10, 28, (W-30)/2);
      drawTable(stage.tables[1], 20+(W-30)/2, 28, (W-30)/2);
    } else if(stage.tables.length===3){
      const tw=(W-40)/3;
      stage.tables.forEach((t,i)=>drawTable(t,10+i*(tw+10),28,tw));
    } else {
      const tw=(W-50)/4;
      stage.tables.forEach((t,i)=>drawTable(t,10+i*(tw+10),28,tw));
    }
    ctx.globalAlpha=1;
  }

  container.querySelector('[data-action="next-norm"]')?.addEventListener('click',()=>{
    if(step<3){ step++; animT=0; let t2=0; const go=()=>{ t2+=0.06; animT=Math.min(t2,1); draw(); if(t2<1) requestAnimationFrame(go); }; go(); }
  });
  container.querySelector('[data-action="reset-norm"]')?.addEventListener('click',()=>{ step=0; animT=1; draw(); });
  draw();
}

// ══════════════════════════════════════════════════════════════
// 05  Transaction Timeline
// ══════════════════════════════════════════════════════════════
function initTransactionDemo(container) {
  const W=620, H=320;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  let isolation = 'READ_COMMITTED';
  let progress = 0; // 0..1 slider
  let anomalyCount = 0;

  const T1_OPS = [
    { t:0.05, label:'BEGIN',       type:'ctrl',   color:'#64748B' },
    { t:0.15, label:'READ(bal)',   type:'read',   color:'#0EA5E9', val:100 },
    { t:0.45, label:'bal -= 30',   type:'compute',color:'#F59E0B' },
    { t:0.75, label:'WRITE(bal)',  type:'write',  color:'#10B981', val:70  },
    { t:0.92, label:'COMMIT',      type:'ctrl',   color:'#8B5CF6' },
  ];
  const T2_OPS = [
    { t:0.05, label:'BEGIN',       type:'ctrl',   color:'#64748B' },
    { t:0.30, label:'READ(bal)',   type:'read',   color:'#0EA5E9', val:100 },
    { t:0.60, label:'bal += 50',   type:'compute',color:'#F59E0B' },
    { t:0.82, label:'WRITE(bal)', type:'write',  color:'#10B981', val:150 },
    { t:0.97, label:'COMMIT',      type:'ctrl',   color:'#8B5CF6' },
  ];

  function detectAnomalies(iso, prog) {
    const anom=[];
    const t2read = T2_OPS[1].t, t1write = T1_OPS[3].t;
    if(iso==='READ_UNCOMMITTED' && prog>t1write && prog<T1_OPS[4].t && prog>t2read){
      anom.push({ label:'Dirty Read: T2 saw T1 uncommitted value', color:'#EF4444' });
    }
    if(['READ_UNCOMMITTED','READ_COMMITTED'].includes(iso)){
      if(prog>0.8) anom.push({ label:'Lost Update: T2 overwrites T1\'s write', color:'#F59E0B' });
    }
    return anom;
  }

  function drawTimeline(ops, y, label, color, prog) {
    const X0=90, X1=W-20;
    ctx.fillStyle=color; ctx.font='bold 11px Inter'; ctx.textAlign='right'; ctx.textBaseline='middle';
    ctx.fillText(label, 80, y+15);
    // Track
    ctx.beginPath(); ctx.moveTo(X0,y+15); ctx.lineTo(X1,y+15);
    ctx.strokeStyle=TC().border; ctx.lineWidth=1.5; ctx.stroke();
    // ops
    ops.forEach(op=>{
      const ox = X0+(X1-X0)*op.t;
      const visible = op.t <= prog;
      const active = Math.abs(op.t-prog)<0.06;
      ctx.globalAlpha=visible?1:0.2;
      roundRect(ctx,ox-30,y,60,30,5);
      ctx.fillStyle=active?op.color:(isDark()?'#1E293B':'#fff'); ctx.fill();
      ctx.strokeStyle=op.color; ctx.lineWidth=active?2:1; ctx.stroke();
      ctx.fillStyle=active?'#fff':op.color; ctx.font='bold 9px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(op.label,ox,y+15);
      // dot on timeline
      ctx.beginPath(); ctx.arc(ox,y+15,4,0,Math.PI*2);
      ctx.fillStyle=active?op.color:TC().border; ctx.fill();
    });
    ctx.globalAlpha=1;
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);

    drawTimeline(T1_OPS,  30,'T1','#0EA5E9', progress);
    drawTimeline(T2_OPS, 100,'T2','#8B5CF6', progress);

    // Shared resource
    ctx.fillStyle=TC().text; ctx.font='bold 11px Inter'; ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText('Balance:', 90, 178);
    const t1w=T1_OPS.find(o=>o.type==='write'), t2w=T2_OPS.find(o=>o.type==='write');
    let bal='$100';
    if(progress>=(t2w?.t||1)) bal='$150 ⚠';
    else if(progress>=(t1w?.t||1)) bal='$70';
    ctx.fillStyle='#10B981'; ctx.font='bold 16px Inter';
    ctx.fillText(bal, 160, 176);

    // Isolation label
    const isoLabels={'READ_UNCOMMITTED':'READ UNCOMMITTED','READ_COMMITTED':'READ COMMITTED','REPEATABLE_READ':'REPEATABLE READ','SERIALIZABLE':'SERIALIZABLE'};
    roundRect(ctx,W/2-120,170,240,30,6);
    ctx.fillStyle=isDark()?'#1E293B':'#fff'; ctx.fill();
    ctx.strokeStyle=TC().border; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle=TC().soft; ctx.font='10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Isolation: '+isoLabels[isolation], W/2, 185);

    // Anomalies
    const anoms = detectAnomalies(isolation, progress);
    anoms.forEach((a,i)=>{
      roundRect(ctx,10,212+i*34,W-20,28,5);
      ctx.fillStyle=`${a.color}22`; ctx.fill();
      ctx.strokeStyle=a.color; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle=a.color; ctx.font='bold 10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('⚠ '+a.label, W/2, 226+i*34);
    });

    // Progress bar
    ctx.fillStyle=TC().border; ctx.fillRect(90,158,W-110,6);
    ctx.fillStyle='#0EA5E9'; ctx.fillRect(90,158,(W-110)*progress,6);
    // knob
    ctx.beginPath(); ctx.arc(90+(W-110)*progress,161,7,0,Math.PI*2);
    ctx.fillStyle='#0EA5E9'; ctx.fill();
  }

  // Slider
  let dragging=false;
  canvas.addEventListener('mousedown',e=>{
    const r=canvas.getBoundingClientRect(),sx=W/r.width;
    const mx=(e.clientX-r.left)*sx;
    if(Math.abs(mx-(90+(W-110)*progress))<16) dragging=true;
  });
  canvas.addEventListener('mousemove',e=>{
    if(!dragging) return;
    const r=canvas.getBoundingClientRect(),sx=W/r.width;
    const mx=(e.clientX-r.left)*sx;
    progress=Math.max(0,Math.min(1,(mx-90)/(W-110))); draw();
  });
  window.addEventListener('mouseup',()=>dragging=false);

  container.querySelectorAll('[data-isolation]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      container.querySelectorAll('[data-isolation]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); isolation=btn.dataset.isolation; draw();
    });
  });
  draw();
}

// ══════════════════════════════════════════════════════════════
// 06  B-tree Index
// ══════════════════════════════════════════════════════════════
function initIndexDemo(container) {
  const W=620, H=330;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  // B+tree: root → 2 internal → 6 leaf nodes
  const TREE = {
    keys:[50],
    children:[
      { keys:[20,35],
        children:[
          { keys:[10,15,18], leaf:true, range:[0,20] },
          { keys:[22,28,32], leaf:true, range:[20,35]},
          { keys:[37,42,48], leaf:true, range:[35,50]},
        ]
      },
      { keys:[65,80],
        children:[
          { keys:[52,58,63], leaf:true, range:[50,65]},
          { keys:[67,72,77], leaf:true, range:[65,80]},
          { keys:[82,88,95], leaf:true, range:[80,100]},
        ]
      }
    ]
  };

  const POSITIONS = {
    root:  { x:W/2, y:30 },
    l0:    [{ x:W/4,   y:110},{ x:3*W/4, y:110}],
    l1:    [{ x:W/7,   y:210},{ x:2*W/7+10,y:210},{ x:3*W/7+10,y:210},
            { x:4*W/7, y:210},{ x:5*W/7,  y:210},{ x:6*W/7,   y:210}],
  };

  let highlighted=[], searchKey=null, indexOn=true, rowsExamined=0;
  let animPath=[], animStep=0, animTimer=null;

  function nodePos(n, depth, idx) {
    if(depth===0) return POSITIONS.root;
    if(depth===1) return POSITIONS.l0[idx];
    return POSITIONS.l1[idx];
  }

  function drawNode(keys, x, y, w, h, hi, isLeaf) {
    roundRect(ctx,x-w/2,y,w,h,5);
    ctx.fillStyle=hi==='search'?'rgba(14,165,233,.25)': hi==='path'?'rgba(139,92,246,.2)': (isDark()?'#1E293B':'#fff');
    ctx.fill();
    ctx.strokeStyle=hi==='search'?'#0EA5E9': hi==='path'?'#8B5CF6': (isLeaf?'#10B981':TC().border);
    ctx.lineWidth=hi?2:1; ctx.stroke();
    // dividers + keys
    const kw=w/keys.length;
    keys.forEach((k,i)=>{
      if(i>0){ ctx.beginPath(); ctx.moveTo(x-w/2+i*kw,y); ctx.lineTo(x-w/2+i*kw,y+h); ctx.strokeStyle=TC().border; ctx.lineWidth=0.5; ctx.stroke(); }
      ctx.fillStyle=hi?'#38BDF8':TC().text; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(k, x-w/2+i*kw+kw/2, y+h/2);
    });
  }

  function drawLine(x1,y1,x2,y2,hi){
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
    ctx.strokeStyle=hi?'#8B5CF6':TC().border; ctx.lineWidth=hi?2:1; ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);

    if(!indexOn){
      // Full table scan animation
      ctx.fillStyle=TC().soft; ctx.font='13px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('Full Table Scan — No Index',W/2,50);
      for(let i=0;i<12;i++){
        const rx=20+i*50, ry=90;
        const scanned = i < (rowsExamined%13);
        roundRect(ctx,rx,ry,44,32,4);
        ctx.fillStyle=scanned?'rgba(239,68,68,.2)':(isDark()?'#1E293B':'#fff'); ctx.fill();
        ctx.strokeStyle=scanned?'#EF4444':TC().border; ctx.lineWidth=scanned?1.5:0.5; ctx.stroke();
        ctx.fillStyle=TC().soft; ctx.font='10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText([10,15,18,22,28,32,37,42,48,52,58,63][i],rx+22,ry+16);
      }
      ctx.fillStyle='#EF4444'; ctx.font='bold 11px Inter'; ctx.textAlign='center';
      ctx.fillText(`Rows examined: ${rowsExamined} (all rows!)`,W/2,160);
      return;
    }

    // Lines level 0→1
    TREE.children.forEach((ch,ci)=>{
      const {x:px,y:py}=POSITIONS.root, {x:cx,y:cy}=POSITIONS.l0[ci];
      const hi=animPath.includes(`1-${ci}`);
      drawLine(px,py+26,cx,cy,hi);
    });
    // Lines level 1→2
    TREE.children.forEach((int,ci)=>{
      int.children.forEach((_,li)=>{
        const gi=ci*3+li;
        const {x:px,y:py}=POSITIONS.l0[ci], {x:cx,y:cy}=POSITIONS.l1[gi];
        const hi=animPath.includes(`2-${gi}`);
        drawLine(px,py+26,cx,cy,hi);
      });
    });
    // Leaf chain
    for(let i=0;i<5;i++){
      const a=POSITIONS.l1[i], b=POSITIONS.l1[i+1];
      ctx.beginPath(); ctx.moveTo(a.x+40,a.y+14); ctx.lineTo(b.x-40,b.y+14);
      ctx.strokeStyle='#10B981'; ctx.lineWidth=0.5; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
    }
    // Root
    const rp=animPath.includes('root');
    drawNode(TREE.keys, POSITIONS.root.x, POSITIONS.root.y, 80, 26, rp?'path':null, false);
    // Internal
    TREE.children.forEach((int,ci)=>{
      const {x,y}=POSITIONS.l0[ci];
      const hp=animPath.includes(`1-${ci}`)?'path':null;
      drawNode(int.keys, x, y, 110, 26, hp, false);
    });
    // Leaves
    TREE.children.forEach((int,ci)=>{
      int.children.forEach((leaf,li)=>{
        const gi=ci*3+li;
        const {x,y}=POSITIONS.l1[gi];
        const hs=animPath.includes(`leaf-${gi}`)?'search':null;
        drawNode(leaf.keys, x, y, 100, 26, hs, true);
      });
    });

    // Stats
    if(searchKey!==null){
      ctx.fillStyle=TC().muted; ctx.font='11px Inter'; ctx.textAlign='center'; ctx.textBaseline='top';
      const found=animPath.some(p=>p.startsWith('leaf'));
      ctx.fillText(`Search: ${searchKey} → Rows examined: ${found?3:'…'} (3 leaf nodes)`, W/2, H-24);
    }
  }

  function animateSearch(key) {
    clearInterval(animTimer); animPath=[]; searchKey=key; animStep=0;
    const n=parseInt(key);
    // Build path
    const path=['root'];
    const ri = n<=50 ? 0 : 1; path.push(`1-${ri}`);
    const int=TREE.children[ri];
    let li=0;
    if(n>int.keys[int.keys.length-1]) li=int.children.length-1;
    else for(let i=0;i<int.keys.length;i++){ if(n<=int.keys[i]){li=i;break;} }
    const gi=ri*3+li; path.push(`2-${gi}`); path.push(`leaf-${gi}`);
    let idx=-1;
    animTimer=setInterval(()=>{ if(idx<path.length-1){ idx++; animPath.push(path[idx]); draw(); } else clearInterval(animTimer); },400);
  }

  const searchInput=container.querySelector('[data-action="index-search"]');
  container.querySelector('[data-action="search-btn"]')?.addEventListener('click',()=>{
    if(searchInput) animateSearch(searchInput.value||'42');
  });
  container.querySelector('[data-action="toggle-index"]')?.addEventListener('click',function(){
    indexOn=!indexOn;
    this.textContent=indexOn?'Disable Index':'Enable Index';
    this.className=this.className.replace(indexOn?'danger':'','').replace(indexOn?'':' danger','');
    this.classList.toggle('danger',!indexOn);
    if(!indexOn){ let i=0; const t=setInterval(()=>{ rowsExamined=i++; draw(); if(i>12) clearInterval(t); },80); }
    else{ animPath=[]; searchKey=null; draw(); }
  });
  container.querySelector('[data-action="range-query"]')?.addEventListener('click',()=>{
    animPath=['root','1-0','2-0','leaf-0','2-1','leaf-1','2-2','leaf-2'];
    searchKey='RANGE: 10–48'; draw();
  });
  draw();
}

// ══════════════════════════════════════════════════════════════
// 07  Query Execution Plan
// ══════════════════════════════════════════════════════════════
function initQueryDemo(container) {
  const W=620, H=330;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  const PLANS = {
    simple: {
      label:'SELECT * FROM employees WHERE salary > 80000',
      nodes:[
        { id:0, type:'SeqScan',  label:'Seq Scan\nemployees', cost:120, x:W/2, y:260, color:'#EF4444' },
        { id:1, type:'Filter',   label:'Filter\nsalary>80k', cost:40,  x:W/2, y:170, color:'#F59E0B' },
        { id:2, type:'Result',   label:'Result\n(3 rows)',   cost:5,   x:W/2, y:80,  color:'#10B981' },
      ],
      edges:[[0,1],[1,2]]
    },
    join: {
      label:'SELECT * FROM orders JOIN customers ON orders.cust_id = customers.id',
      nodes:[
        { id:0, type:'SeqScan', label:'Seq Scan\norders',    cost:80,  x:W/4,   y:260, color:'#EF4444' },
        { id:1, type:'SeqScan', label:'Seq Scan\ncustomers', cost:40,  x:3*W/4, y:260, color:'#EF4444' },
        { id:2, type:'HashJoin',label:'Hash Join\n(batch)',  cost:200, x:W/2,   y:170, color:'#8B5CF6' },
        { id:3, type:'Result',  label:'Result\n(N rows)',    cost:10,  x:W/2,   y:80,  color:'#10B981' },
      ],
      edges:[[0,2],[1,2],[2,3]]
    },
    agg: {
      label:'SELECT dept, COUNT(*), AVG(salary) FROM employees GROUP BY dept',
      nodes:[
        { id:0, type:'SeqScan',  label:'Seq Scan\nemployees', cost:120, x:W/2,    y:270, color:'#EF4444' },
        { id:1, type:'Sort',     label:'Sort\nby dept',       cost:60,  x:W/2,    y:195, color:'#0EA5E9' },
        { id:2, type:'Aggregate',label:'Group Agg\nCOUNT,AVG',cost:30, x:W/2,    y:120, color:'#8B5CF6' },
        { id:3, type:'Result',   label:'Result\n(3 rows)',    cost:5,   x:W/2,    y:50,  color:'#10B981' },
      ],
      edges:[[0,1],[1,2],[2,3]]
    }
  };

  let currentPlan='simple', packets=[], lastSpawn=0;

  function drawNode(n, active) {
    const W2=90, H2=40;
    roundRect(ctx,n.x-W2/2,n.y-H2/2,W2,H2,6);
    ctx.fillStyle=active?n.color+33:((isDark()?'#1E293B':'#fff')); ctx.fill();
    ctx.strokeStyle=n.color; ctx.lineWidth=active?2.5:1.5; ctx.stroke();
    // cost badge
    roundRect(ctx,n.x+W2/2-28,n.y-H2/2-1,28,14,3);
    ctx.fillStyle=n.color+'44'; ctx.fill(); ctx.strokeStyle=n.color; ctx.lineWidth=0.5; ctx.stroke();
    ctx.fillStyle=n.color; ctx.font='bold 8px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('cost:'+n.cost,n.x+W2/2-14,n.y-H2/2+6);
    // label
    n.label.split('\n').forEach((line,i)=>{
      ctx.fillStyle=TC().text; ctx.font='bold 9.5px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(line, n.x, n.y+(i-0.5)*13);
    });
  }

  function draw(t=0) {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);
    const plan = PLANS[currentPlan];

    // Edges
    plan.edges.forEach(([a,b])=>{
      const na=plan.nodes[a], nb=plan.nodes[b];
      ctx.beginPath(); ctx.moveTo(na.x,na.y-20); ctx.lineTo(nb.x,nb.y+20);
      ctx.strokeStyle=TC().border; ctx.lineWidth=1.5; ctx.stroke();
      // Arrow
      ctx.beginPath(); ctx.moveTo(nb.x-5,nb.y+24); ctx.lineTo(nb.x,nb.y+18); ctx.lineTo(nb.x+5,nb.y+24);
      ctx.strokeStyle=TC().border; ctx.lineWidth=1.5; ctx.stroke();
    });

    // Packets flowing
    packets.forEach(p=>{
      const na=plan.nodes[p.from], nb=plan.nodes[p.to];
      const px2=lerp(na.x,nb.x,p.t), py2=lerp(na.y-20,nb.y+20,p.t);
      ctx.beginPath(); ctx.arc(px2,py2,5,0,Math.PI*2);
      ctx.fillStyle=plan.nodes[p.from].color; ctx.fill();
    });

    plan.nodes.forEach(n=>drawNode(n, packets.some(p=>p.to===n.id&&p.t>0.7)));

    // Query label
    ctx.fillStyle=TC().muted; ctx.font='10px Inter'; ctx.textAlign='center'; ctx.textBaseline='top';
    const q=plan.label; ctx.fillText(q.length>80?q.slice(0,78)+'…':q, W/2, H-20);
  }

  let raf;
  function animate(t) {
    raf=requestAnimationFrame(animate);
    if(t-lastSpawn>600){
      const plan=PLANS[currentPlan];
      plan.edges.forEach(([a,b])=>{
        packets.push({ from:a, to:b, t:0, spd:0.012+Math.random()*.008 });
      });
      lastSpawn=t;
    }
    for(let i=packets.length-1;i>=0;i--){
      packets[i].t+=packets[i].spd;
      if(packets[i].t>=1) packets.splice(i,1);
    }
    draw(t);
  }
  animate(0);

  container.querySelectorAll('[data-plan]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      container.querySelectorAll('[data-plan]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); currentPlan=btn.dataset.plan; packets=[];
    });
  });
  container.querySelector('[data-plan="simple"]')?.classList.add('active');
}

// ══════════════════════════════════════════════════════════════
// 08  Concurrency / 2PL
// ══════════════════════════════════════════════════════════════
function initConcurrencyDemo(container) {
  const W=620, H=300;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  const TXS=['T1','T2','T3'];
  const RES=['R_A','R_B','R_C','R_D','R_E'];
  let locks={}; // locks[res][tx] = 'S'|'X'|null
  let deadlock=[];
  let running=false, step=0;

  const SCRIPT = [
    { tx:'T1', res:'R_A', type:'S' },
    { tx:'T2', res:'R_B', type:'X' },
    { tx:'T1', res:'R_C', type:'S' },
    { tx:'T3', res:'R_D', type:'S' },
    { tx:'T2', res:'R_A', type:'X', wait:true }, // T2 wants X on R_A (held S by T1)
    { tx:'T3', res:'R_B', type:'S', wait:true }, // T3 wants S on R_B (held X by T2) → deadlock T2→T1→... or T3→T2
    { tx:'T1', res:'R_D', type:'X', wait:true }, // deadlock: T1 waits R_D (T3), T3 waits R_B (T2), T2 waits R_A (T1)
  ];

  function resetLocks(){
    locks={};
    RES.forEach(r=>{ locks[r]={}; TXS.forEach(t=>locks[r][t]=null); });
    deadlock=[]; step=0;
  }
  resetLocks();

  function applyStep(s){
    if(s.wait){
      deadlock = s.tx==='T1'?['T1','T3','T2','T1']:[];
      return;
    }
    if(locks[s.res]) locks[s.res][s.tx]=s.type;
  }

  const CW=76, CH=32, LX=110, TY=40, RY=100;

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);

    // Column headers (TX)
    TXS.forEach((tx,ti)=>{
      const cx=LX+ti*(CW+4);
      roundRect(ctx,cx,TY,CW,CH,4);
      ctx.fillStyle='#0EA5E9'+(ti===0?'':'88'); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(tx,cx+CW/2,TY+CH/2);
    });

    // Row headers (resources)
    RES.forEach((res,ri)=>{
      const ry=RY+ri*(CH+4);
      ctx.fillStyle=TC().soft; ctx.font='bold 10px Inter'; ctx.textAlign='right'; ctx.textBaseline='middle';
      ctx.fillText(res, LX-8, ry+CH/2);

      TXS.forEach((tx,ti)=>{
        const cx=LX+ti*(CW+4), cy=ry;
        const lk=locks[res]?.[tx];
        const isDeadlockTx=deadlock.includes(tx)&&lk;
        roundRect(ctx,cx,cy,CW,CH,4);
        ctx.fillStyle=lk==='X'?'rgba(139,92,246,.3)': lk==='S'?'rgba(14,165,233,.2)': (isDark()?'#1E293B':'#fff');
        if(isDeadlockTx) ctx.fillStyle='rgba(239,68,68,.3)';
        ctx.fill();
        ctx.strokeStyle=lk==='X'?'#8B5CF6': lk==='S'?'#0EA5E9': isDeadlockTx?'#EF4444': TC().border;
        ctx.lineWidth=lk||isDeadlockTx?1.5:0.5; ctx.stroke();
        if(lk){
          ctx.fillStyle=lk==='X'?'#C4B5FD':'#7DD3FC'; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(lk,cx+CW/2,cy+CH/2);
        }
      });
    });

    // Deadlock indicator
    if(deadlock.length){
      const dy=RY+RES.length*(CH+4)+12;
      roundRect(ctx,10,dy,W-20,36,6);
      ctx.fillStyle='rgba(239,68,68,.15)'; ctx.fill();
      ctx.strokeStyle='#EF4444'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='#EF4444'; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🔴 DEADLOCK: '+deadlock.join(' → '), W/2, dy+18);
      ctx.fillStyle=TC().muted; ctx.font='10px Inter';
      ctx.fillText('T1 rolled back — locks released', W/2, dy+28);
    }

    // Step counter
    ctx.fillStyle=TC().muted; ctx.font='10px Inter'; ctx.textAlign='right'; ctx.textBaseline='top';
    ctx.fillText(`Step ${step}/${SCRIPT.length}`, W-12, 8);
  }

  let timer;
  container.querySelector('[data-action="run-2pl"]')?.addEventListener('click',()=>{
    if(running) return; running=true; resetLocks(); draw();
    timer=setInterval(()=>{
      if(step<SCRIPT.length){ applyStep(SCRIPT[step]); step++; draw(); }
      else { clearInterval(timer); running=false; }
    },600);
  });
  container.querySelector('[data-action="reset-2pl"]')?.addEventListener('click',()=>{
    clearInterval(timer); running=false; resetLocks(); draw();
  });
  draw();
}

// ══════════════════════════════════════════════════════════════
// 09  Storage Engine (Page/Block)
// ══════════════════════════════════════════════════════════════
function initStorageDemo(container) {
  const W=620, H=290;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  const COLS=10, ROWS=4, BW=52, BH=42, GAP=4;
  const OX=(W-COLS*(BW+GAP))/2, OY=30;
  let blocks=Array(COLS*ROWS).fill(null).map((_,i)=>{
    if(i<12) return { state:'used', label:'row_'+i };
    return { state:'free' };
  });
  blocks[3].state='deleted'; blocks[7].state='deleted'; blocks[11].state='deleted';
  let fillFactor=0; let vacuumAnim=null;

  function calcFF(){ return Math.round(blocks.filter(b=>b.state==='used').length/blocks.length*100); }

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);

    blocks.forEach((b,i)=>{
      const col=i%COLS, row=Math.floor(i/COLS);
      const x=OX+col*(BW+GAP), y=OY+row*(BH+GAP);
      roundRect(ctx,x,y,BW,BH,4);
      ctx.fillStyle=b.state==='used'?'rgba(14,165,233,.25)': b.state==='deleted'?'rgba(239,68,68,.12)': (isDark()?'#1E293B':'#F0F4F8');
      ctx.fill();
      ctx.strokeStyle=b.state==='used'?'#0EA5E9': b.state==='deleted'?'#EF4444': TC().border;
      ctx.lineWidth=b.state==='free'?0.5:1.5;
      if(b.state==='deleted') ctx.setLineDash([3,3]);
      ctx.stroke(); ctx.setLineDash([]);
      if(b.label){
        ctx.fillStyle=b.state==='deleted'?TC().muted:TC().soft; ctx.font='8px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(b.label,x+BW/2,y+BH/2);
      }
      if(b.state==='free'){ ctx.fillStyle=TC().muted; ctx.font='10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('∅',x+BW/2,y+BH/2); }
    });

    // Fill factor gauge
    const ff=calcFF(), barW=200, barH=14, bx=W/2-barW/2, by=H-36;
    ctx.fillStyle=TC().border; roundRect(ctx,bx,by,barW,barH,barH/2); ctx.fill();
    const color=ff>80?'#EF4444':ff>60?'#F59E0B':'#10B981';
    ctx.fillStyle=color; roundRect(ctx,bx,by,barW*ff/100,barH,barH/2); ctx.fill();
    ctx.fillStyle=TC().text; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText(`Fill Factor: ${ff}%`, W/2, by+16);

    // Legend
    [['Used','#0EA5E9'],['Deleted (dashed)','#EF4444'],['Free','#334155']].forEach(([label,col],i)=>{
      const lx=20+i*170;
      ctx.fillStyle=col; ctx.fillRect(lx,H-16,12,10);
      ctx.fillStyle=TC().muted; ctx.font='9px Inter'; ctx.textAlign='left'; ctx.textBaseline='middle';
      ctx.fillText(label,lx+16,H-11);
    });
  }

  container.querySelector('[data-action="insert-row"]')?.addEventListener('click',()=>{
    const fi=blocks.findIndex(b=>b.state==='free');
    if(fi>=0){ blocks[fi]={ state:'used', label:'row_'+(Date.now()%100) }; draw(); }
  });
  container.querySelector('[data-action="delete-row"]')?.addEventListener('click',()=>{
    const ui=blocks.filter(b=>b.state==='used').map((_,i,arr)=>arr.indexOf(arr[i]));
    const used=blocks.reduce((acc,b,i)=>{ if(b.state==='used') acc.push(i); return acc; },[]);
    if(used.length){ const ri=used[Math.floor(Math.random()*used.length)]; blocks[ri].state='deleted'; blocks[ri].label=undefined; draw(); }
  });
  container.querySelector('[data-action="vacuum"]')?.addEventListener('click',()=>{
    // Compact: collect used rows, place back sequentially
    const used=blocks.filter(b=>b.state==='used');
    blocks=Array(COLS*ROWS).fill(null).map((_,i)=>{
      if(i<used.length) return used[i];
      return { state:'free' };
    });
    draw();
  });
  draw();
}

// ══════════════════════════════════════════════════════════════
// 10  NoSQL Comparison
// ══════════════════════════════════════════════════════════════
function initNoSQLDemo(container) {
  const W=640, H=320;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  let activeQuery='none', bytesDoc=0, bytesCol=0, anim=0, animTimer=null;

  const DOC_DATA = {
    "_id":"ORD001","customer":"Alice","city":"NYC",
    "items":[{"name":"Apple","price":1.5},{"name":"Banana","price":0.8}],
    "total":2.3,"date":"2024-01-15"
  };
  const COL_DATA = {
    '_id':   ['ORD001','ORD002','ORD003'],
    'customer':['Alice','Bob','Carol'],
    'city':  ['NYC','LA','Chicago'],
    'total': [2.3, 5.1, 3.8],
    'date':  ['2024-01-15','2024-01-16','2024-01-17'],
  };

  function drawDocStore(x,y,w,h, queryCol=null, progr=1) {
    roundRect(ctx,x,y,w,h,8);
    ctx.fillStyle=isDark()?'#1E293B':'#fff'; ctx.fill();
    ctx.strokeStyle='#0EA5E9'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#0EA5E9'; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('📄 Document Store',x+w/2,y+8);

    const lines=JSON.stringify(DOC_DATA,null,2).split('\n');
    lines.forEach((line,i)=>{
      const ly=y+28+i*14;
      if(ly>y+h-8) return;
      const highlight=queryCol&&line.includes(queryCol);
      if(highlight&&progr>0){
        ctx.fillStyle='rgba(14,165,233,.18)';
        ctx.fillRect(x+4,ly-1,w-8,14);
      }
      ctx.fillStyle=line.includes('"')?'#86EFAC':TC().soft;
      if(highlight) ctx.fillStyle='#7DD3FC';
      ctx.font='8.5px JetBrains Mono,monospace'; ctx.textAlign='left'; ctx.textBaseline='top';
      ctx.fillText(line.length>45?line.slice(0,44)+'…':line, x+8, ly);
    });
    // "whole doc read" overlay
    if(queryCol&&progr>0){
      const alpha=Math.min(progr,0.4);
      ctx.fillStyle=`rgba(14,165,233,${alpha})`;
      roundRect(ctx,x,y,w,h,8); ctx.fill();
      ctx.fillStyle='#7DD3FC'; ctx.font='bold 10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('← reads ENTIRE doc',x+w/2,y+h/2);
    }
  }

  function drawColStore(x,y,w,h, queryCol=null, progr=1) {
    roundRect(ctx,x,y,w,h,8);
    ctx.fillStyle=isDark()?'#1E293B':'#fff'; ctx.fill();
    ctx.strokeStyle='#8B5CF6'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#8B5CF6'; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('📊 Column Store',x+w/2,y+8);

    const CW2=(w-20)/Object.keys(COL_DATA).length;
    Object.entries(COL_DATA).forEach(([col,vals],ci)=>{
      const cx2=x+10+ci*CW2, isTarget=queryCol===col;
      // header
      roundRect(ctx,cx2,y+26,CW2-2,18,3);
      ctx.fillStyle=isTarget&&progr>0?'#8B5CF6':(isDark()?'#243347':'#E8EDF3'); ctx.fill();
      ctx.fillStyle=isTarget?'#fff':TC().muted; ctx.font='bold 8px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(col,cx2+CW2/2,y+35);
      // values
      vals.forEach((v,vi)=>{
        const vy=y+48+vi*22;
        ctx.fillStyle=isTarget&&progr>0?'rgba(139,92,246,.2)':(isDark()?'rgba(30,41,59,.7)':'rgba(240,244,248,.7)');
        ctx.fillRect(cx2,vy,CW2-2,20);
        ctx.strokeStyle=isTarget?'#8B5CF6':TC().border; ctx.lineWidth=0.5; ctx.strokeRect(cx2,vy,CW2-2,20);
        ctx.fillStyle=isTarget&&progr>0?'#C4B5FD':TC().soft; ctx.font='8px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(String(v).slice(0,6),cx2+CW2/2,vy+10);
      });
    });
    if(queryCol&&progr>0){
      const ci=Object.keys(COL_DATA).indexOf(queryCol);
      if(ci>=0){
        const cx2=x+10+ci*(w-20)/Object.keys(COL_DATA).length;
        ctx.strokeStyle='#8B5CF6'; ctx.lineWidth=2; ctx.setLineDash([4,2]);
        ctx.strokeRect(cx2-2,y+24,((w-20)/Object.keys(COL_DATA).length)+2,220);
        ctx.setLineDash([]);
        ctx.fillStyle='#8B5CF6'; ctx.font='bold 9px Inter'; ctx.textAlign='center'; ctx.textBaseline='bottom';
        ctx.fillText('← reads 1 column only',cx2+30,y+h-4);
      }
    }
  }

  function drawBars() {
    const by=H-28, barH=14, bx=10;
    if(bytesDoc>0){
      const maxB=Math.max(bytesDoc,bytesCol,1);
      ctx.fillStyle=TC().muted; ctx.font='9px Inter'; ctx.textAlign='left'; ctx.textBaseline='middle';
      ctx.fillText(`Doc: ${bytesDoc}B`, bx, by-8);
      ctx.fillStyle='rgba(14,165,233,.15)'; ctx.fillRect(bx,by,120*bytesDoc/maxB,barH);
      ctx.strokeStyle='#0EA5E9'; ctx.lineWidth=1; ctx.strokeRect(bx,by,120*bytesDoc/maxB,barH);
      ctx.fillText(`Col: ${bytesCol}B`, bx+160, by-8);
      ctx.fillStyle='rgba(139,92,246,.15)'; ctx.fillRect(bx+160,by,120*bytesCol/maxB,barH);
      ctx.strokeStyle='#8B5CF6'; ctx.lineWidth=1; ctx.strokeRect(bx+160,by,120*bytesCol/maxB,barH);
    }
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);
    const qc=activeQuery==='none'?null:activeQuery;
    drawDocStore(8,8,W/2-14,H-50,qc,anim);
    drawColStore(W/2+6,8,W/2-14,H-50,qc,anim);
    drawBars();
  }

  function runQuery(col, docBytes, colBytes) {
    clearInterval(animTimer); activeQuery=col; anim=0; bytesDoc=0; bytesCol=0; draw();
    let t=0;
    animTimer=setInterval(()=>{
      t+=0.05; anim=Math.min(t,1);
      bytesDoc=Math.round(docBytes*anim);
      bytesCol=Math.round(colBytes*anim);
      draw(); if(t>=1) clearInterval(animTimer);
    },30);
  }

  container.querySelector('[data-action="query-total"]')?.addEventListener('click',()=>runQuery('total',480,32));
  container.querySelector('[data-action="query-all"]')?.addEventListener('click',()=>runQuery('all cols',480,480));
  container.querySelector('[data-action="reset-nosql"]')?.addEventListener('click',()=>{ clearInterval(animTimer); activeQuery='none'; anim=0; bytesDoc=0; bytesCol=0; draw(); });
  draw();
}

// ══════════════════════════════════════════════════════════════
// 11  Raft Consensus
// ══════════════════════════════════════════════════════════════
function initDistributedDemo(container) {
  const W=620, H=310;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  let nodes=[
    { id:0, x:W/2, y:60,  role:'leader',   term:1, log:[], alive:true, ackCount:0 },
    { id:1, x:130, y:230,  role:'follower', term:1, log:[], alive:true, ackCount:0 },
    { id:2, x:490, y:230,  role:'follower', term:1, log:[], alive:true, ackCount:0 },
  ];
  let packets=[], electionTimer=0, electionRunning=false;
  let messages=[];

  function addMsg(txt, color='#94A3B8'){
    messages.unshift({ txt, color, alpha:1 });
    if(messages.length>4) messages.pop();
  }

  function drawNode(n) {
    const r=36;
    ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2);
    ctx.fillStyle=!n.alive?'rgba(100,116,139,.15)': n.role==='leader'?'rgba(14,165,233,.2)': n.role==='candidate'?'rgba(245,158,11,.2)':'rgba(30,41,59,.8)';
    ctx.fill();
    ctx.strokeStyle=!n.alive?TC().border: n.role==='leader'?'#0EA5E9': n.role==='candidate'?'#F59E0B':'#8B5CF6';
    ctx.lineWidth=n.role==='leader'?2.5:1.5; ctx.stroke();
    // Crown
    if(n.role==='leader'){
      ctx.fillStyle='#F59E0B'; ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('👑',n.x,n.y-r-10);
    }
    // Node label
    ctx.fillStyle=n.alive?TC().text:TC().muted; ctx.font='bold 10px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Node '+(n.id+1), n.x, n.y-6);
    const roleColor=n.role==='leader'?'#38BDF8':n.role==='candidate'?'#FCD34D':'#C4B5FD';
    ctx.fillStyle=n.alive?roleColor:TC().muted; ctx.font='9px Inter';
    ctx.fillText(n.role.toUpperCase(), n.x, n.y+6);
    ctx.fillStyle=TC().muted; ctx.font='9px Inter';
    ctx.fillText('term '+n.term, n.x, n.y+18);
    // Log
    n.log.slice(-2).forEach((entry,ei)=>{
      const lx=n.x-16+ei*18, ly=n.y+r+6;
      roundRect(ctx,lx,ly,14,10,2); ctx.fillStyle='rgba(16,185,129,.3)'; ctx.fill();
      ctx.strokeStyle='#10B981'; ctx.lineWidth=0.5; ctx.stroke();
      ctx.fillStyle='#6EE7B7'; ctx.font='7px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(entry,lx+7,ly+5);
    });
    if(!n.alive){
      ctx.fillStyle='#EF4444'; ctx.font='bold 20px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('✕',n.x,n.y);
    }
  }

  function drawEdge(a,b,highlight,color='#334155'){
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
    ctx.strokeStyle=highlight?color:TC().border; ctx.lineWidth=highlight?2:0.8; ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);

    // Edges
    [[0,1],[1,2],[0,2]].forEach(([a,b])=>drawEdge(nodes[a],nodes[b]));

    // Packets
    packets.forEach(p=>{
      const a=nodes[p.from], b=nodes[p.to];
      if(!a||!b) return;
      const px2=lerp(a.x,b.x,p.t), py2=lerp(a.y,b.y,p.t);
      ctx.beginPath(); ctx.arc(px2,py2,6,0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='bold 7px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(p.label,px2,py2);
    });

    nodes.forEach(n=>drawNode(n));

    // Election timer bar
    if(electionRunning){
      const bw=200, bx=W/2-100, by=H-44;
      ctx.fillStyle=TC().border; ctx.fillRect(bx,by,bw,10);
      ctx.fillStyle='#F59E0B'; ctx.fillRect(bx,by,bw*electionTimer,10);
      ctx.fillStyle=TC().muted; ctx.font='9px Inter'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText('Election timeout…',W/2,by+12);
    }

    // Messages
    messages.forEach((m,i)=>{
      ctx.fillStyle=m.color; ctx.font='10px Inter'; ctx.textAlign='left'; ctx.textBaseline='top'; ctx.globalAlpha=1-i*.2;
      ctx.fillText('› '+m.txt, 10, H-22-i*14);
    });
    ctx.globalAlpha=1;
  }

  let raf;
  function animLoop(t) {
    raf=requestAnimationFrame(animLoop);
    for(let i=packets.length-1;i>=0;i--){
      packets[i].t+=packets[i].spd;
      if(packets[i].t>=1){
        if(packets[i].onArrive) packets[i].onArrive();
        packets.splice(i,1);
      }
    }
    draw();
  }
  animLoop(0);

  function sendPacket(from,to,label,color,onArrive){
    packets.push({ from,to,label,color,t:0,spd:0.03+(Math.random()*.01),onArrive });
  }

  container.querySelector('[data-action="raft-write"]')?.addEventListener('click',()=>{
    const leader=nodes.find(n=>n.role==='leader'&&n.alive);
    if(!leader){ addMsg('No leader — elect one first','#EF4444'); return; }
    const entry='W'+Math.floor(Math.random()*100);
    leader.log.push(entry);
    addMsg(`Leader appends log entry: ${entry}`,'#10B981');
    nodes.filter(n=>n.id!==leader.id&&n.alive).forEach(n=>{
      sendPacket(leader.id,n.id,'AppendEntries','#10B981',()=>{
        n.log.push(entry);
        sendPacket(n.id,leader.id,'ACK','#6EE7B7',()=>{
          addMsg(`Committed ${entry} — majority ack`,'#10B981');
        });
      });
    });
  });

  container.querySelector('[data-action="kill-leader"]')?.addEventListener('click',()=>{
    const leader=nodes.find(n=>n.role==='leader'&&n.alive);
    if(!leader){ addMsg('No leader to kill','#64748B'); return; }
    leader.alive=false; leader.role='follower';
    addMsg('Leader node '+(leader.id+1)+' killed','#EF4444');
    electionRunning=true; electionTimer=0;
    const interval=setInterval(()=>{
      electionTimer+=0.04;
      if(electionTimer>=1){
        clearInterval(interval); electionRunning=false;
        const alive=nodes.filter(n=>n.alive);
        if(alive.length===0) return;
        const newLeader=alive[Math.floor(Math.random()*alive.length)];
        alive.forEach(n=>{ n.term++; n.role='follower'; });
        newLeader.role='leader';
        addMsg('Node '+(newLeader.id+1)+' elected leader (term '+newLeader.term+')', '#0EA5E9');
      }
    },50);
  });

  container.querySelector('[data-action="reset-raft"]')?.addEventListener('click',()=>{
    nodes=[
      { id:0, x:W/2, y:60,  role:'leader',   term:1, log:[], alive:true },
      { id:1, x:130, y:230,  role:'follower', term:1, log:[], alive:true },
      { id:2, x:490, y:230,  role:'follower', term:1, log:[], alive:true },
    ];
    packets=[]; messages=[]; electionRunning=false; electionTimer=0;
  });
  draw();
}

// ══════════════════════════════════════════════════════════════
// 12  Schema Designer
// ══════════════════════════════════════════════════════════════
function initInterviewDemo(container) {
  const W=680, H=400;
  const canvas = mkCanvas(container, W, H);
  const ctx = canvas.getContext('2d');

  let tables=[], fks=[], dragging=null, dragOffX=0, dragOffY=0;
  let drawingFK=null;
  const TYPES=['INT','VARCHAR','BOOL','DATE','FLOAT','TEXT'];

  function makeTable(name, x, y, cols=[]) {
    return { id:Date.now()+Math.random(), name, x, y, w:180, cols, color:'#0EA5E9' };
  }

  const DEFAULT_TABLES = [
    makeTable('users', 30, 50, [
      { name:'user_id',   type:'INT',     pk:true  },
      { name:'username',  type:'VARCHAR', pk:false },
      { name:'email',     type:'VARCHAR', pk:false },
      { name:'created_at',type:'DATE',    pk:false },
    ]),
    makeTable('orders', 280, 50, [
      { name:'order_id',  type:'INT',     pk:true  },
      { name:'user_id',   type:'INT',     pk:false, fk:true },
      { name:'total',     type:'FLOAT',   pk:false },
      { name:'order_date',type:'DATE',    pk:false },
    ]),
    makeTable('products',530, 50, [
      { name:'product_id',type:'INT',     pk:true  },
      { name:'name',      type:'VARCHAR', pk:false },
      { name:'price',     type:'FLOAT',   pk:false },
    ]),
  ];
  tables=DEFAULT_TABLES;
  fks=[
    { from:{ tid:DEFAULT_TABLES[1].id, col:'user_id' }, to:{ tid:DEFAULT_TABLES[0].id, col:'user_id' } }
  ];

  const ROW_H=22, HEAD_H=28;

  function tableHeight(t){ return HEAD_H+t.cols.length*ROW_H+6; }

  function draw() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=isDark()?'#070D19':'#F0F4F8'; ctx.fillRect(0,0,W,H);

    // FK lines
    fks.forEach(fk=>{
      const ft=tables.find(t=>t.id===fk.from.tid), tt=tables.find(t=>t.id===fk.to.tid);
      if(!ft||!tt) return;
      const fi=ft.cols.findIndex(c=>c.name===fk.from.col), ti=tt.cols.findIndex(c=>c.name===fk.to.col);
      if(fi<0||ti<0) return;
      const fx=ft.x+ft.w, fy=ft.y+HEAD_H+fi*ROW_H+ROW_H/2;
      const tx=tt.x, ty=tt.y+HEAD_H+ti*ROW_H+ROW_H/2;
      ctx.beginPath(); ctx.moveTo(fx,fy);
      ctx.bezierCurveTo(fx+40,fy,tx-40,ty,tx,ty);
      ctx.strokeStyle='#F59E0B'; ctx.lineWidth=1.5; ctx.setLineDash([5,3]); ctx.stroke(); ctx.setLineDash([]);
      // Arrow
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx-8,ty-4); ctx.lineTo(tx-8,ty+4); ctx.closePath();
      ctx.fillStyle='#F59E0B'; ctx.fill();
    });

    // Tables
    tables.forEach(t=>{
      const h=tableHeight(t);
      roundRect(ctx,t.x,t.y,t.w,h,6);
      ctx.fillStyle=isDark()?'#1E293B':'#fff'; ctx.fill();
      ctx.strokeStyle=t.color; ctx.lineWidth=1.5; ctx.stroke();
      // Header
      roundRect(ctx,t.x,t.y,t.w,HEAD_H,6);
      ctx.fillStyle=t.color; ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 11px Inter'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(t.name,t.x+t.w/2,t.y+HEAD_H/2);
      // Columns
      t.cols.forEach((col,ci)=>{
        const cy=t.y+HEAD_H+ci*ROW_H;
        ctx.fillStyle=ci%2===0?(isDark()?'rgba(30,41,59,.5)':'rgba(240,244,248,.5)'):'transparent';
        ctx.fillRect(t.x,cy,t.w,ROW_H);
        ctx.strokeStyle=TC().border; ctx.lineWidth=0.3; ctx.strokeRect(t.x,cy,t.w,ROW_H);

        if(col.pk){ ctx.fillStyle='#F59E0B'; ctx.font='bold 9px Inter'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText('PK',t.x+4,cy+ROW_H/2); }
        else if(col.fk){ ctx.fillStyle='#F59E0B'; ctx.font='9px Inter'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText('FK',t.x+4,cy+ROW_H/2); }

        ctx.fillStyle=col.pk?'#FCD34D':TC().text; ctx.font=(col.pk?'bold ':'')+' 10px Inter'; ctx.textAlign='left';
        ctx.fillText(col.name, t.x+24, cy+ROW_H/2);
        ctx.fillStyle=TC().muted; ctx.font='9px Inter'; ctx.textAlign='right';
        ctx.fillText(col.type, t.x+t.w-6, cy+ROW_H/2);
      });
    });
  }

  // Drag
  canvas.addEventListener('mousedown',e=>{
    const r=canvas.getBoundingClientRect(), sx=W/r.width, sy=H/r.height;
    const mx=(e.clientX-r.left)*sx, my=(e.clientY-r.top)*sy;
    tables.forEach(t=>{
      if(mx>=t.x&&mx<=t.x+t.w&&my>=t.y&&my<=t.y+HEAD_H){
        dragging=t; dragOffX=mx-t.x; dragOffY=my-t.y;
      }
    });
  });
  canvas.addEventListener('mousemove',e=>{
    if(!dragging) return;
    const r=canvas.getBoundingClientRect(), sx=W/r.width, sy=H/r.height;
    const mx=(e.clientX-r.left)*sx, my=(e.clientY-r.top)*sy;
    dragging.x=Math.max(0,Math.min(W-dragging.w,mx-dragOffX));
    dragging.y=Math.max(0,Math.min(H-tableHeight(dragging),my-dragOffY));
    draw();
  });
  window.addEventListener('mouseup',()=>{ dragging=null; });
  canvas.style.cursor='grab';

  // Export SQL
  container.querySelector('[data-action="export-sql"]')?.addEventListener('click',()=>{
    let sql='';
    tables.forEach(t=>{
      sql+=`CREATE TABLE ${t.name} (\n`;
      t.cols.forEach((col,i)=>{
        sql+=`  ${col.name} ${col.type}`;
        if(col.pk) sql+=' PRIMARY KEY';
        if(i<t.cols.length-1) sql+=',';
        sql+='\n';
      });
      sql+=');\n\n';
    });
    fks.forEach(fk=>{
      const ft=tables.find(t=>t.id===fk.from.tid), tt=tables.find(t=>t.id===fk.to.tid);
      if(ft&&tt) sql+=`ALTER TABLE ${ft.name} ADD FOREIGN KEY (${fk.from.col}) REFERENCES ${tt.name}(${fk.to.col});\n`;
    });
    const modal=container.closest('.section')?.parentElement?.querySelector('#sql-modal') || document.getElementById('sql-modal');
    if(modal){ modal.querySelector('pre').textContent=sql; modal.classList.add('open'); }
    else { alert(sql); }
  });

  container.querySelector('[data-action="add-table"]')?.addEventListener('click',()=>{
    const name=prompt('Table name:','new_table');
    if(!name) return;
    tables.push(makeTable(name,Math.random()*(W-200)+10,Math.random()*(H-150)+10,[
      { name:'id',type:'INT',pk:true }
    ]));
    draw();
  });

  draw();
}

// Expose all init functions globally
window.initIntroDemo        = initIntroDemo;
window.initRelationalDemo   = initRelationalDemo;
window.initSQLDemo          = initSQLDemo;
window.initNormalizationDemo= initNormalizationDemo;
window.initTransactionDemo  = initTransactionDemo;
window.initIndexDemo        = initIndexDemo;
window.initQueryDemo        = initQueryDemo;
window.initConcurrencyDemo  = initConcurrencyDemo;
window.initStorageDemo      = initStorageDemo;
window.initNoSQLDemo        = initNoSQLDemo;
window.initDistributedDemo  = initDistributedDemo;
window.initInterviewDemo    = initInterviewDemo;
