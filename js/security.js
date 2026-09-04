const canvas = document.getElementById('security-canvas');
const context = canvas.getContext('2d');
const visual = document.querySelector('.hero-visual');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let width = 0;
let height = 0;
let pointer = { x: -1000, y: -1000 };
let time = 0;
let sweep = 0;
const blips = Array.from({ length: 8 }, (_, index) => ({ angle: index * .8, distance: .18 + Math.random() * .3, life: Math.random() * 100 }));

function resize() {
  const bounds = visual.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = bounds.width;
  height = bounds.height;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function point(node) {
  return { x: node.x * width, y: node.y * height };
}

function draw() {
  context.clearRect(0, 0, width, height);
  const center = { x: width * .5, y: height * .53 };
  const radius = Math.min(width, height) * .38;
  context.strokeStyle = '#68e0d225';
  context.lineWidth = 1;
  [1, .72, .43].forEach((scale) => { context.beginPath(); context.arc(center.x, center.y, radius * scale, 0, Math.PI * 2); context.stroke(); });
  context.beginPath(); context.moveTo(center.x - radius, center.y); context.lineTo(center.x + radius, center.y); context.moveTo(center.x, center.y - radius); context.lineTo(center.x, center.y + radius); context.stroke();
  context.save();
  context.translate(center.x, center.y);
  context.rotate(sweep);
  context.beginPath(); context.moveTo(0, 0); context.lineTo(radius, 0); context.strokeStyle = '#68e0d2'; context.shadowBlur = 14; context.shadowColor = '#68e0d2'; context.stroke(); context.restore();
  blips.forEach((blip) => { blip.life += .9; const x = center.x + Math.cos(blip.angle) * radius * blip.distance; const y = center.y + Math.sin(blip.angle) * radius * blip.distance; const visible = Math.sin(blip.life / 13) > .35; if (visible) { context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fillStyle = '#ff6b67'; context.shadowBlur = 16; context.shadowColor = '#ff6b67'; context.fill(); context.shadowBlur = 0; } });
  context.beginPath(); context.arc(center.x, center.y, 4, 0, Math.PI * 2); context.fillStyle = '#f3b65d'; context.fill();
  sweep += .012;
  time += 1;
  if (!reduceMotion) requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
visual.addEventListener('pointermove', (event) => {
  const bounds = visual.getBoundingClientRect();
  pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
});
visual.addEventListener('pointerleave', () => { pointer = { x: -1000, y: -1000 }; });
resize();
draw();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach((element) => {
  element.style.animationPlayState = 'paused';
  observer.observe(element);
});

/* Cipher decode and manual controlled exploit simulation */
(function initSecurityInteractions() {
  const title = document.querySelector('.cipher-title');
  const targets = (title?.dataset.cipherTarget || '').split('|');
  const alphabet = '#@$%&*?!01XYZ';
  if (title && !reduceMotion) {
    let progress = 0;
    const decode = () => {
      progress += 1;
      const output = targets.map((target, lineIndex) => target.split('').map((character, index) => {
        const unlocked = progress > lineIndex * 8 + index * 2;
        return character === ' ' ? ' ' : unlocked ? character : alphabet[Math.floor(Math.random() * alphabet.length)];
      }).join('')).join('<br>');
      title.innerHTML = output.replace('weak point', '<em>weak point</em>');
      if (progress < 75) requestAnimationFrame(decode);
    };
    title.classList.add('cipher-active');
    decode();
  }

  const output = document.getElementById('sim-output');
  const nextButton = document.getElementById('sim-next');
  const score = document.getElementById('cvss-score');
  const stage = document.getElementById('sim-stage');
  const state = document.getElementById('server-state');
  const logs = document.getElementById('server-logs');
  const steps = [...document.querySelectorAll('.attack-stepper .step')];
  const sequence = [
    { name: 'FOUNDATION', score: '01', command: '$ profile --foundation', result: 'Software engineering background indexed', log: 'full-stack foundation verified' },
    { name: 'DEPI', score: '02', command: '$ track --current', result: 'DEPI · Penetration Testing · in progress', log: 'current learning track synchronized' },
    { name: 'LABS', score: '07', command: '$ evidence --controlled-labs', result: 'Blue · Relevant · Bounty Hacker · Kenobi · Steel Mountain', log: '7 controlled rooms marked completed' },
    { name: 'FOCUS', score: '08', command: '$ focus --security', result: 'XSS · Broken Access Control · Windows Server · Network Security', log: 'web, systems, and network foundations actively practiced' }
  ];
  let current = -1;
  function cycleProfile() {
    current = Math.min(current + 1, sequence.length - 1);
    if (current === sequence.length - 1 && nextButton) nextButton.innerHTML = 'Restart profile feed <span>↻</span>';
    const item = sequence[current];
    output.innerHTML = `<span class="sim-prompt">${item.command}</span><br><span class="sim-${current > 0 ? 'danger' : 'muted'}">${item.result}</span>`;
    score.textContent = item.score;
    stage.textContent = `${item.name} / CONTROLLED`;
    state.textContent = 'ONLINE';
    state.classList.remove('sim-alert');
    const liveLog = logs.querySelector('.live-profile-log');
    const liveLogMarkup = `<span>LIVE</span> ${item.log}`;
    if (liveLog) {
      liveLog.innerHTML = liveLogMarkup;
    } else {
      logs.insertAdjacentHTML('beforeend', `<p class="log-alert live-profile-log">${liveLogMarkup}</p>`);
    }
    steps.forEach((step, index) => step.classList.toggle('active', index === current));
    steps.forEach((step, index) => step.classList.toggle('complete', index < current));
    if (current === sequence.length - 1) current = -1;
  }
  nextButton?.addEventListener('click', cycleProfile);
  if (!reduceMotion) window.setInterval(cycleProfile, 4200);
})();

