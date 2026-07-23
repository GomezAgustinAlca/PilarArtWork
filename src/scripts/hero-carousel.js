const AUTOPLAY_MS = 5000;

function initHeroCarousel() {
  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  if (slides.length <= 1) return;

  const controls = document.getElementById('hero-controls');
  const playPauseBtn = document.getElementById('hero-playpause');
  const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
  const status = document.getElementById('hero-status');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let currentIndex = 0;
  let paused = false;
  let timer = null;

  controls?.removeAttribute('hidden');

  function updateDots() {
    dots.forEach((dot, i) => {
      const active = i === currentIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });
  }

  function announce() {
    if (status) status.textContent = `Mostrando: ${slides[currentIndex].dataset.titulo ?? ''}`;
  }

  function goTo(index) {
    if (index === currentIndex) return;
    const incoming = slides[index];
    const outgoing = slides[currentIndex];

    if (reducedMotion) {
      outgoing.classList.remove('is-active');
      incoming.classList.add('is-active');
      currentIndex = index;
      updateDots();
      announce();
      return;
    }

    incoming.classList.add('is-incoming');
    void incoming.offsetWidth;
    requestAnimationFrame(() => incoming.classList.add('is-revealed'));

    incoming.addEventListener(
      'transitionend',
      () => {
        outgoing.classList.remove('is-active');
        incoming.classList.remove('is-incoming', 'is-revealed');
        incoming.classList.add('is-active');
        currentIndex = index;
        updateDots();
        announce();
      },
      { once: true }
    );
  }

  function next() {
    goTo((currentIndex + 1) % slides.length);
  }

  function startAutoplay() {
    if (reducedMotion || paused) return;
    stopAutoplay();
    timer = window.setInterval(next, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.goto));
      startAutoplay();
    });
  });

  playPauseBtn?.addEventListener('click', () => {
    paused = !paused;
    playPauseBtn.setAttribute('aria-pressed', String(paused));
    playPauseBtn.querySelector('.sr-only').textContent = paused ? 'Reanudar rotación de obras' : 'Pausar rotación de obras';
    if (paused) stopAutoplay();
    else startAutoplay();
  });

  // Sin pausa por hover: mouseenter puede dispararse por un recálculo de
  // hit-test del navegador (sin movimiento real del mouse) cuando el layout
  // se corre bajo un cursor ya posicionado ahí al cargar la página — eso
  // paraba el autoplay para siempre si el usuario entraba con el cursor
  // sobre el hero. El botón de play/pausa alcanza para controlar la rotación.
  startAutoplay();
}

initHeroCarousel();
