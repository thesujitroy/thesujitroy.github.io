import * as THREE from "three";

/* ============================================================
   THE AUTONOMOUS SCIENTIST — cinematic
   Beat 1  world model ignites from chaos
   Beat 2  path creation detonates from one state
   Beat 3  validation rejects (red) / impossible collapses
   Beat 4  survivors crystallize into the ledger
   ============================================================ */

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = window.innerWidth < 760;

const canvas = document.getElementById("space");
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true }); }
catch (e) { document.getElementById("glfail").style.display = "block"; }

if (renderer) {
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06080f, 0.0055);
const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 600);
camera.position.set(0, 4, 60);

const C = {
  solar: new THREE.Color("#F2A93B"),
  terra: new THREE.Color("#3FBF9A"),
  oxide: new THREE.Color("#D85A30"),
  cyan:  new THREE.Color("#6FA8E8"),
  violet:new THREE.Color("#A78BDB"),
  rose:  new THREE.Color("#ff3c5a"),
  slate: new THREE.Color("#46506a"),
  ink:   new THREE.Color("#E8ECF4")
};

const ramp = (x, a, b) => x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a);
const smooth = t => t * t * (3 - 2 * t);
const backOut = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const scratch = new THREE.Vector3();

/* ---------- starfield ---------- */
(function () {
  const n = 1500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 70 + Math.random() * 220, t = Math.random() * 6.283, p = Math.acos(2 * Math.random() - 1);
    pos[i*3] = r*Math.sin(p)*Math.cos(t); pos[i*3+1] = r*Math.cos(p)*0.7; pos[i*3+2] = r*Math.sin(p)*Math.sin(t);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8a94a8, size: 0.45, transparent: true, opacity: 0.4, depthWrite: false })));
})();

/* ============================================================
   BEAT 1 : world model — chaos -> ignited lattice
   ============================================================ */
const NT = reduce ? 2200 : small ? 3200 : 5200;
let twinPts, twinChaos, twinLat, twinCol, twinBase;
const gTwin = new THREE.Group(); scene.add(gTwin);
let twinCore;
(function () {
  twinChaos = new Float32Array(NT * 3); twinLat = new Float32Array(NT * 3);
  const pos = new Float32Array(NT * 3); twinCol = new Float32Array(NT * 3); twinBase = new Float32Array(NT * 3);
  const ga = Math.PI * (3 - Math.sqrt(5)), R = 13, c = new THREE.Color();
  for (let i = 0; i < NT; i++) {
    const cr = 30 + Math.random() * 26, ct = Math.random() * 6.283, cp = Math.acos(2 * Math.random() - 1);
    twinChaos[i*3] = cr*Math.sin(cp)*Math.cos(ct); twinChaos[i*3+1] = cr*Math.cos(cp); twinChaos[i*3+2] = cr*Math.sin(cp)*Math.sin(ct);
    const y = 1 - (i / (NT - 1)) * 2, rad = Math.sqrt(1 - y*y), th = ga * i, sh = 1 + (Math.random()-0.5)*0.12;
    twinLat[i*3] = Math.cos(th)*rad*R*sh; twinLat[i*3+1] = y*R*sh; twinLat[i*3+2] = Math.sin(th)*rad*R*sh;
    pos[i*3] = twinChaos[i*3]; pos[i*3+1] = twinChaos[i*3+1]; pos[i*3+2] = twinChaos[i*3+2];
    c.copy(C.slate).lerp(C.solar, Math.random()*0.5);
    twinBase[i*3]=c.r; twinBase[i*3+1]=c.g; twinBase[i*3+2]=c.b;
    twinCol[i*3]=c.r; twinCol[i*3+1]=c.g; twinCol[i*3+2]=c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(twinCol, 3));
  twinPts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.6, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
  gTwin.add(twinPts);
  twinCore = new THREE.Mesh(new THREE.IcosahedronGeometry(13, 1),
    new THREE.MeshBasicMaterial({ color: C.solar, wireframe: true, transparent: true, opacity: 0 }));
  gTwin.add(twinCore);
})();

function updateTwin(p) {
  const a = backOut(ramp(p, 0.02, 0.24));            // assemble
  const fade = 1 - ramp(p, 0.30, 0.42) * 0.86;        // fade to faint backdrop
  const pa = twinPts.geometry.attributes.position.array;
  const ign = ramp(p, 0.18, 0.26);                    // ignition tint
  const cc = new THREE.Color();
  for (let i = 0; i < NT; i++) {
    pa[i*3]   = twinChaos[i*3]   + (twinLat[i*3]   - twinChaos[i*3])   * a;
    pa[i*3+1] = twinChaos[i*3+1] + (twinLat[i*3+1] - twinChaos[i*3+1]) * a;
    pa[i*3+2] = twinChaos[i*3+2] + (twinLat[i*3+2] - twinChaos[i*3+2]) * a;
    if (ign > 0) {
      cc.set(twinBase[i*3], twinBase[i*3+1], twinBase[i*3+2]).lerp(C.solar, ign * 0.6);
      twinCol[i*3]=cc.r; twinCol[i*3+1]=cc.g; twinCol[i*3+2]=cc.b;
    }
  }
  twinPts.geometry.attributes.position.needsUpdate = true;
  if (ign > 0) twinPts.geometry.attributes.color.needsUpdate = true;
  twinPts.material.opacity = 0.7 * fade;
  twinCore.material.opacity = ramp(p, 0.16, 0.24) * 0.5 * fade;
  twinCore.scale.setScalar(0.6 + a * 0.5);
  gTwin.rotation.y = p * 0.6;
}

/* ============================================================
   BEAT 2-3 : path detonation + validation
   ============================================================ */
const NP = reduce ? 900 : small ? 1400 : 2400;
const S = new THREE.Vector3(0, 0, 0);
const fams = [
  { t: new THREE.Vector3(46, 16, -4),  col: C.cyan,   kind: "ok" },
  { t: new THREE.Vector3(50, -2, 10),  col: C.terra,  kind: "ok" },
  { t: new THREE.Vector3(44, -18,-12), col: C.solar,  kind: "ok" },
  { t: new THREE.Vector3(30, 30, 18),  col: C.oxide,  kind: "reject" },
  { t: new THREE.Vector3(20, -30, 22), col: C.violet, kind: "impossible" }
];
fams.forEach(f => {
  const mid = S.clone().add(f.t).multiplyScalar(0.5);
  mid.y += (Math.random() * 26 - 13) + (f.kind === "reject" ? 16 : 0);
  mid.z += (Math.random() * 26 - 13);
  f.curve = new THREE.QuadraticBezierCurve3(S.clone(), mid, f.t.clone());
  f.rdir = f.t.clone().sub(mid).normalize().add(new THREE.Vector3(0.3, 0.6, 0.2)).normalize();
});
const gPath = new THREE.Group(); scene.add(gPath); gPath.visible = false;
let pathPts, pPos, pCol, pData = [], idxRej = [], idxImp = [];
(function () {
  pPos = new Float32Array(NP * 3); pCol = new Float32Array(NP * 3);
  const c = new THREE.Color();
  for (let i = 0; i < NP; i++) {
    const r = i % 10, fi = r < 7 ? (r % 3) : r < 9 ? 3 : 4;
    const f = fams[fi];
    const dir = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).normalize();
    pData.push({ f, fi, off: Math.random()*0.12, scs: 8 + Math.random()*22, dir, js: Math.random()*6.283 });
    if (fi === 3) idxRej.push(i); if (fi === 4) idxImp.push(i);
    c.copy(f.col);
    pCol[i*3]=c.r; pCol[i*3+1]=c.g; pCol[i*3+2]=c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
  pathPts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.78, depthWrite: false, blending: THREE.AdditiveBlending }));
  gPath.add(pathPts);
  // source flare
  const src = new THREE.Mesh(new THREE.SphereGeometry(1.8, 20, 20), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  gPath.add(src); gPath.src = src;
  // valid target rings
  fams.forEach(f => { if (f.kind === "ok") {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 0.16, 8, 44), new THREE.MeshBasicMaterial({ color: f.col, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending }));
    ring.position.copy(f.t); ring.lookAt(S); gPath.add(ring); f.ring = ring;
  }});
  // shockwave
  const sw = new THREE.Mesh(new THREE.RingGeometry(1, 1.5, 64), new THREE.MeshBasicMaterial({ color: C.solar, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  gPath.add(sw); gPath.sw = sw;
})();

const rc = new THREE.Color();
function updatePath(p, time) {
  const gp = ramp(p, 0.28, 0.80);          // travel along paths
  const vp = ramp(p, 0.55, 0.80);          // validation
  const decay = Math.max(0, 1 - gp / 0.18); // eruption offset decays fast
  const burst = Math.pow(decay, 0.6);
  for (let i = 0; i < NP; i++) {
    const d = pData[i], f = d.f;
    const ti = Math.min(1, gp * 1.12 + d.off);
    f.curve.getPoint(ti, scratch);
    const sh = Math.sin(time * 1.6 + d.js) * 0.7;
    let x = scratch.x + d.dir.x * d.scs * burst + d.dir.x * sh;
    let y = scratch.y + d.dir.y * d.scs * burst + d.dir.y * sh;
    let z = scratch.z + d.dir.z * d.scs * burst + d.dir.z * sh;
    if (d.fi === 3 && vp > 0) {                       // REJECTED: hurled away + reddened
      const k = smooth(vp), push = 70 * k;
      x += f.rdir.x * push; y += f.rdir.y * push + k * 10; z += f.rdir.z * push;
      rc.copy(f.col).lerp(C.rose, Math.min(1, vp * 1.6));
      pCol[i*3]=rc.r; pCol[i*3+1]=rc.g; pCol[i*3+2]=rc.b;
    } else if (d.fi === 4 && vp > 0) {                // IMPOSSIBLE: collapse to source, vanish
      const k = smooth(vp);
      x = x + (S.x - x) * k; y = y + (S.y - y) * k; z = z + (S.z - z) * k;
      rc.copy(f.col).multiplyScalar(1 - k * 0.85);
      pCol[i*3]=rc.r; pCol[i*3+1]=rc.g; pCol[i*3+2]=rc.b;
    }
    pPos[i*3] = x; pPos[i*3+1] = y; pPos[i*3+2] = z;
  }
  pathPts.geometry.attributes.position.needsUpdate = true;
  pathPts.geometry.attributes.color.needsUpdate = true;
  // chrome
  gPath.src.material.opacity = ramp(p, 0.26, 0.32);
  gPath.src.scale.setScalar(1 + burst * 2.5);
  gPath.sw.material.opacity = burst * 0.7;
  gPath.sw.scale.setScalar(1 + (1 - decay) * 60);
  gPath.sw.lookAt(camera.position);
  fams.forEach(f => { if (f.ring) { f.ring.material.opacity = ramp(p, 0.5, 0.66) * (0.5 + 0.5*Math.sin(time*3)); f.ring.rotation.z += 0.01; } });
}

/* ============================================================
   BEAT 4 : ledger crystallization
   ============================================================ */
const gLed = new THREE.Group(); scene.add(gLed); gLed.visible = false;
let ledLines;
(function () {
  const M = reduce ? 28 : 56, nodes = [];
  const posA = new Float32Array(M * 3), colA = new Float32Array(M * 3), c = new THREE.Color();
  const cols = [C.cyan, C.terra, C.solar, C.violet];
  for (let i = 0; i < M; i++) {
    const x = 38 + Math.random() * 22, y = (Math.random()*2-1) * 20, z = (Math.random()*2-1) * 20;
    nodes.push([x, y, z]); posA[i*3]=x; posA[i*3+1]=y; posA[i*3+2]=z;
    c.copy(cols[i % 4]); colA[i*3]=c.r; colA[i*3+1]=c.g; colA[i*3+2]=c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(posA, 3));
  g.setAttribute("color", new THREE.BufferAttribute(colA, 3));
  gLed.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.7, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })));
  gLed.nodePts = gLed.children[0];
  const lp = [];
  for (let a = 0; a < M; a++) for (let b = a + 1; b < M; b++) {
    const dx = nodes[a][0]-nodes[b][0], dy = nodes[a][1]-nodes[b][1], dz = nodes[a][2]-nodes[b][2];
    if (dx*dx+dy*dy+dz*dz < 110) lp.push(nodes[a][0],nodes[a][1],nodes[a][2], nodes[b][0],nodes[b][1],nodes[b][2]);
  }
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lp), 3));
  ledLines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: C.terra, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
  gLed.add(ledLines);
})();
function updateLedger(p, time) {
  const o = ramp(p, 0.62, 0.9);
  gLed.nodePts.material.opacity = o * 0.95;
  ledLines.material.opacity = Math.max(0, o - 0.4) * 0.5;
  gLed.nodePts.scale.setScalar(1 + 0.04 * Math.sin(time * 2));
  gLed.rotation.y = -0.1 + ramp(p,0.6,1) * 0.25;
}

/* ============================================================
   scroll, flashes, camera, loop
   ============================================================ */
let prog = 0;
const cinemaEl = document.querySelector(".cinema");
function setProg() {
  const span = (cinemaEl ? cinemaEl.offsetHeight : document.documentElement.scrollHeight) - innerHeight;
  prog = span > 0 ? Math.min(1, Math.max(0, scrollY / span)) : 0;
}
addEventListener("scroll", setProg, { passive: true });
addEventListener("resize", setProg);
setProg();

const progBar = document.getElementById("prog"), cue = document.getElementById("cue");
const flashW = document.getElementById("flash-white"), flashR = document.getElementById("flash-red");
let fwT = 0, frT = 0, shake = 0;
const armW = { v: false }, armR = { v: false };

function trigFlash(el, lvl) { el.style.transition = "none"; el.style.opacity = String(lvl); requestAnimationFrame(() => { el.style.transition = "opacity 0.8s ease-out"; el.style.opacity = "0"; }); }

let mx = 0, my = 0, tmx = 0, tmy = 0;
addEventListener("mousemove", e => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });

/* reveal */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }), { threshold: 0.2 });
document.querySelectorAll(".copy").forEach(el => io.observe(el));

const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const t = clock.getElapsedTime();
  progBar.style.width = (prog * 100) + "%";
  if (cue) cue.classList.toggle("gone", scrollY > innerHeight * 0.4);

  // group visibility
  gPath.visible = prog > 0.24;
  gLed.visible = prog > 0.58;

  updateTwin(prog);
  if (gPath.visible) updatePath(prog, t);
  if (gLed.visible) updateLedger(prog, t);

  // one-shot dramatic flashes (re-arm when scrolled away)
  if (prog > 0.285 && !armW.v) { armW.v = true; trigFlash(flashW, 0.5); shake = Math.max(shake, 0.5); }
  if (prog < 0.26) armW.v = false;
  if (prog > 0.605 && !armR.v) { armR.v = true; trigFlash(flashR, 0.6); shake = Math.max(shake, 0.85); }
  if (prog < 0.58) armR.v = false;

  // camera path
  mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
  const look = scratch.set(0, 0, 0).lerp(new THREE.Vector3(26, 0, 0), ramp(prog, 0.30, 0.62));
  let z = 60 - ramp(prog, 0, 0.24) * 24 + ramp(prog, 0.28, 0.55) * 50 - ramp(prog, 0.80, 1) * 8;
  shake *= 0.88;
  camera.position.set(
    mx * 9 + (Math.random()-0.5) * shake * 2,
    4 + Math.sin(prog * 3.14) * 3 - my * 5 + (Math.random()-0.5) * shake * 2,
    z
  );
  camera.lookAt(look);
  renderer.render(scene, camera);
}
loop();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
}
