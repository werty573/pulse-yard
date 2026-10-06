// Pulse Yard: kinetic hero type, scroll-driven counters, schedule tabs, photo pile, free-week form.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- schedule tabs ---------- */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PLAN = {
  Mon: [['05:30', 'Strength', 'Coach Anya'], ['07:00', 'Engine', 'Coach Rishi'], ['12:15', 'Group HIIT', 'Coach Kezia'], ['17:30', 'Strength', 'Coach Anya'], ['19:00', 'Box fit', 'Coach Marlon']],
  Tue: [['05:30', 'Box fit', 'Coach Marlon'], ['12:15', 'Engine', 'Coach Rishi'], ['17:30', 'Group HIIT', 'Coach Kezia'], ['19:00', 'Strength', 'Coach Devon']],
  Wed: [['05:30', 'Strength', 'Coach Devon'], ['07:00', 'Group HIIT', 'Coach Kezia'], ['12:15', 'Box fit', 'Coach Marlon'], ['17:30', 'Engine', 'Coach Rishi'], ['19:00', 'Strength', 'Coach Anya']],
  Thu: [['05:30', 'Engine', 'Coach Rishi'], ['12:15', 'Strength', 'Coach Anya'], ['17:30', 'Box fit', 'Coach Marlon'], ['19:00', 'Group HIIT', 'Coach Kezia']],
  Fri: [['05:30', 'Strength', 'Coach Devon'], ['12:15', 'Group HIIT', 'Coach Kezia'], ['17:30', 'Strength', 'Coach Anya']],
  Sat: [['07:00', 'Group HIIT', 'Coach Kezia'], ['08:30', 'Box fit', 'Coach Marlon'], ['10:00', 'Open floor', 'Coach on duty']],
};
const days = document.querySelector('.days'), slots = document.querySelector('.slots');
function show(d) {
  days.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.d === d));
  slots.innerHTML = PLAN[d].map(([t, c, who]) => `<div class="slot"><time>${t}</time><b>${c}</b><span>${who}</span></div>`).join('');
  if (!reduce && window.gsap) gsap.from('.slot', { y: 16, opacity: 0, stagger: .05, duration: .4, ease: 'power2.out' });
}
days.innerHTML = DAYS.map(d => `<button role="tab" data-d="${d}">${d}</button>`).join('');
days.addEventListener('click', e => e.target.dataset.d && show(e.target.dataset.d));
days.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const i = DAYS.indexOf(days.querySelector('[aria-selected=true]').dataset.d) + (e.key === 'ArrowRight' ? 1 : -1);
  const d = DAYS[(i + DAYS.length) % DAYS.length]; show(d); days.querySelector(`[data-d=${d}]`).focus();
});
const today = DAYS[(new Date().getDay() + 6) % 7] || 'Mon';
show(today);

/* ---------- free-week form ---------- */
const form = document.querySelector('.form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const bad = ['name', 'phone'].filter(n => !form[n].value.trim() || (n === 'phone' && form.phone.value.replace(/\D/g, '').length < 7));
  ['name', 'phone'].forEach(n => form[n].setAttribute('aria-invalid', bad.includes(n)));
  form.querySelector('.err').hidden = !bad.length;
  if (bad.length) return form[bad[0]].focus();
  form.querySelector('.done').hidden = false;
});

/* ---------- counters (final values shown immediately without motion) ---------- */
const counters = [...document.querySelectorAll('[data-to]')];
const paint = (el, v) => (el.textContent = String(Math.round(v)).padStart(+el.dataset.pad || 1, '0') + (el.dataset.to === '5' ? 'AM' : ''));
if (reduce || !window.gsap) counters.forEach(el => paint(el, +el.dataset.to));

/* ---------- motion ---------- */
if (!reduce && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  // hero: lines punch in, then scroll pushes them in opposite directions
  gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } })
    .from('.r1', { xPercent: -30, opacity: 0 })
    .from('.r2', { xPercent: 30, opacity: 0 }, .1)
    .from('.hero-img', { scaleY: 0, transformOrigin: 'top', duration: 1 }, .3)
    .from('.hero-foot > *', { y: 20, opacity: 0, stagger: .1, duration: .6 }, .6);
  const hs = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.r1', { xPercent: -22, ease: 'none', scrollTrigger: hs });
  gsap.to('.r2', { xPercent: 14, ease: 'none', scrollTrigger: hs });
  gsap.to('.hero-img img', { scale: 1.2, filter: 'grayscale(0) contrast(1.1)', ease: 'none', scrollTrigger: hs });

  gsap.to('.marquee-track', { xPercent: -50, ease: 'none', duration: 18, repeat: -1 });

  // counters roll with the scroll, so they stop where you stop
  counters.forEach(el => {
    const o = { v: 0 };
    gsap.to(o, { v: +el.dataset.to, ease: 'none', onUpdate: () => paint(el, o.v), scrollTrigger: { trigger: '.stats', start: 'top 85%', end: 'top 35%', scrub: true } });
  });

  gsap.from('.type', { y: 60, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.types', start: 'top 80%' } });

  // the floor: photos get thrown onto the pile one by one while the section holds
  const pile = gsap.utils.toArray('.pile img');
  const rot = [-7, 5, -3, 8];
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.floor-pin', start: 'top top', end: '+=160%', pin: true, scrub: 1 } });
  pile.forEach((img, i) => tl.fromTo(img, { yPercent: 140, xPercent: i % 2 ? 40 : -40, rotation: rot[i] * 3, opacity: 0 }, { yPercent: 0, xPercent: 0, rotation: rot[i], opacity: 1, ease: 'power2.out' }, i * .8));

  gsap.from('.plan', { y: 50, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.plans', start: 'top 80%' } });
  gsap.from('.form', { y: 60, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.free', start: 'top 80%' } });
} else {
  document.querySelectorAll('.pile img').forEach((img, i) => (img.style.rotate = [-7, 5, -3, 8][i] + 'deg'));
}
