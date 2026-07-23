const STAGGER_STEP_MS = 60;
const STAGGER_MAX_STEPS = 6;

function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (targets.length === 0) return;

  const groups = new Map();
  targets.forEach((el) => {
    const parent = el.parentElement;
    const siblings = groups.get(parent) ?? 0;
    const step = Math.min(siblings, STAGGER_MAX_STEPS);
    el.style.setProperty('--reveal-delay', String(step * STAGGER_STEP_MS));
    groups.set(parent, siblings + 1);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

initReveal();
