const SWIPE_THRESHOLD = 40;

function initProyectoViewer() {
  const viewer = document.getElementById('proyecto-viewer');
  if (!viewer) return;

  const imageEl = document.getElementById('proyecto-viewer-image');
  const titleEl = document.getElementById('proyecto-viewer-title');
  const subtituloEl = document.getElementById('proyecto-viewer-subtitulo');
  const counterEl = document.getElementById('proyecto-viewer-counter');
  const prevBtn = document.getElementById('proyecto-viewer-prev');
  const nextBtn = document.getElementById('proyecto-viewer-next');

  let paginas = [];
  let currentIndex = 0;
  let currentSrc = null;
  let loadSeq = 0;
  let lastFocused = null;
  let touchStartX = null;

  function setActiveIndex(index) {
    const pagina = paginas[index];
    if (!pagina) return;
    currentIndex = index;

    counterEl.textContent = `${index + 1} / ${paginas.length}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === paginas.length - 1;

    if (pagina.src === currentSrc) {
      imageEl.classList.add('is-ready');
      return;
    }

    const seq = ++loadSeq;
    imageEl.classList.remove('is-ready');

    const reveal = () => {
      if (seq !== loadSeq) return;
      currentSrc = pagina.src;
      imageEl.classList.add('is-ready');
    };

    imageEl.addEventListener('load', reveal, { once: true });
    imageEl.addEventListener('error', reveal, { once: true });
    imageEl.src = pagina.src;
    imageEl.width = pagina.width;
    imageEl.height = pagina.height;
    imageEl.alt = pagina.alt;
  }

  function goTo(index) {
    if (index < 0 || index >= paginas.length) return;
    setActiveIndex(index);
  }

  function open(card) {
    try {
      paginas = JSON.parse(card.dataset.imagenes || '[]');
    } catch {
      paginas = [];
    }
    if (paginas.length === 0) return;

    lastFocused = document.activeElement;

    titleEl.textContent = card.dataset.titulo || '';
    subtituloEl.textContent = card.dataset.subtitulo || '';

    currentSrc = null;
    setActiveIndex(0);

    viewer.hidden = false;
    void viewer.offsetWidth;
    viewer.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    viewer.querySelector('.proyecto-viewer-close')?.focus();
  }

  function close() {
    if (viewer.hidden) return;
    viewer.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    if (lastFocused instanceof HTMLElement) lastFocused.focus();

    viewer.addEventListener(
      'transitionend',
      () => {
        viewer.hidden = true;
      },
      { once: true }
    );
  }

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('[data-proyecto-viewer-close]')) {
      close();
      return;
    }

    const card = target.closest('[data-proyecto-id]');
    if (card) {
      open(card);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (viewer.hidden) {
      if (event.key === 'Enter' || event.key === ' ') {
        const active = document.activeElement;
        if (active instanceof Element && active.matches('[data-proyecto-id]')) {
          event.preventDefault();
          open(active);
        }
      }
      return;
    }

    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'ArrowLeft') {
      goTo(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      goTo(currentIndex + 1);
    }
  });

  imageEl.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    { passive: true }
  );

  imageEl.addEventListener(
    'touchend',
    (event) => {
      if (touchStartX === null) return;
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (deltaX < 0) {
        goTo(currentIndex + 1);
      } else {
        goTo(currentIndex - 1);
      }
    },
    { passive: true }
  );
}

initProyectoViewer();
