
"use strict";

/* ── Stars ── */
(function() {
  const c = document.getElementById('stars');
  const ctx = c.getContext('2d');
  let stars = [];
  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    stars = Array.from({length:180}, () => ({
      x: Math.random()*c.width,
      y: Math.random()*c.height*0.75,
      r: Math.random()*1.2+0.2,
      a: Math.random(),
      speed: Math.random()*0.005+0.001,
      phase: Math.random()*Math.PI*2
    }));
  }
  resize();
  window.addEventListener('resize', resize);
  function draw(t) {
    ctx.clearRect(0,0,c.width,c.height);
    stars.forEach(s => {
      const alpha = s.a * (0.5 + 0.5*Math.sin(t*s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,200,150,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ── Particle Trail ── */
const trailCanvas = document.getElementById('trailCanvas');
const tctx = trailCanvas.getContext('2d');
trailCanvas.width = window.innerWidth;
trailCanvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
});

const particles = [];
const COLORS = ['#ff6a00','#ff2d55','#ffcc00','#c800ff','#ff8800','#ff0080'];

function spawnParticle(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 1.5 + 0.3;
  particles.push({
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 0.5,
    life: 1,
    decay: Math.random() * 0.035 + 0.015,
    r: Math.random() * 3 + 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  });
}

function drawParticles() {
  tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04;
    p.life -= p.decay;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    tctx.save();
    tctx.globalAlpha = p.life * 0.85;
    tctx.beginPath();
    const grad = tctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, p.color);
    grad.addColorStop(1, 'transparent');
    tctx.fillStyle = grad;
    tctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
    tctx.fill();
    tctx.restore();
  }
  requestAnimationFrame(drawParticles);
}
requestAnimationFrame(drawParticles);

/* ── Cursor dot ── */
const dot = document.getElementById('cursorDot');
window.addEventListener('pointermove', e => {
  dot.style.left = e.clientX + 'px';
  dot.style.top  = e.clientY + 'px';
  if (Math.random() < 0.4) spawnParticle(e.clientX, e.clientY);
});

/* ── Dragon ── */
const svg    = document.getElementById('dragonSvg');
const canvas = document.getElementById('canvas');
const xmlns  = "http://www.w3.org/2000/svg";
const xlinkns = "http://www.w3.org/1999/xlink";

const resize = () => { width = window.innerWidth; height = window.innerHeight; };
let width, height;
window.addEventListener("resize", () => resize(), false);
resize();

const pointer = { x: width / 2, y: height / 2 };
const radm = Math.min(pointer.x, pointer.y) - 20;
let frm = Math.random();
let rad = 0;

window.addEventListener("pointermove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  rad = 0;
}, false);

const N = 40;
const elems = [];
for (let i = 0; i < N; i++) elems[i] = { use: null, x: width / 2, y: 0 };

const prepend = (useId, i, filter) => {
  const elem = document.createElementNS(xmlns, "use");
  elems[i].use = elem;
  elem.setAttributeNS(xlinkns, "xlink:href", "#" + useId);
  if (filter) elem.setAttribute("filter", `url(#${filter})`);
  canvas.prepend(elem);
};

for (let i = 1; i < N; i++) {
  if (i === 1)            prepend("DragonHead",  i, "headGlow");
  else if (i === 8 || i === 14) prepend("DragonWings", i, "wingGlow");
  else                    prepend("DragonSpine", i, "bodyGlow");
}

/* Animate hue shift on gradients */
let hueShift = 0;
function shiftHue() {
  hueShift += 0.4;
  svg.style.filter = `hue-rotate(${hueShift}deg) saturate(1.4) brightness(1.1)`;
}

const run = () => {
  requestAnimationFrame(run);
  shiftHue();

  let e = elems[0];
  const ax = (Math.cos(3 * frm) * rad * width)  / height;
  const ay = (Math.sin(4 * frm) * rad * height) / width;
  e.x += (ax + pointer.x - e.x) / 10;
  e.y += (ay + pointer.y - e.y) / 10;

  for (let i = 1; i < N; i++) {
    let e  = elems[i];
    let ep = elems[i - 1];
    const a = Math.atan2(e.y - ep.y, e.x - ep.x);
    e.x += (ep.x - e.x + (Math.cos(a) * (100 - i)) / 5) / 4;
    e.y += (ep.y - e.y + (Math.sin(a) * (100 - i)) / 5) / 4;
    const s = (162 + 4 * (1 - i)) / 50;
    e.use.setAttributeNS(null, "transform",
      `translate(${(ep.x + e.x) / 2},${(ep.y + e.y) / 2}) rotate(${(180 / Math.PI) * a}) scale(${s},${s})`
    );
  }

  if (rad < radm) rad++;
  frm += 0.003;
  if (rad > 60) {
    pointer.x += (width / 2 - pointer.x) * 0.05;
    pointer.y += (height / 2 - pointer.y) * 0.05;
  }
};

run();
