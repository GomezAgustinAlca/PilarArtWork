const SIN_SERIE = '__sin_serie__';

function initFilters() {
  const grid = document.getElementById('obra-grid');
  const filtersEl = document.getElementById('filters');
  if (!grid || !filtersEl) return;

  const selects = filtersEl.querySelectorAll('select[data-filter]');
  const resetBtn = document.getElementById('filtros-reset');
  const items = grid.querySelectorAll('li');

  function applyFilters() {
    const active = {};
    selects.forEach((select) => {
      if (select.value) active[select.dataset.filter] = select.value;
    });

    items.forEach((li) => {
      const card = li.querySelector('.obra-card');
      if (!card) return;
      const matches = Object.entries(active).every(([key, value]) => {
        if (key === 'serie' && value === SIN_SERIE) return card.dataset.serie === '';
        return card.dataset[key] === value;
      });
      li.hidden = !matches;
    });
  }

  selects.forEach((select) => select.addEventListener('change', applyFilters));
  resetBtn?.addEventListener('click', () => {
    selects.forEach((select) => (select.value = ''));
    applyFilters();
  });
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const imageEl = document.getElementById('lightbox-image');
  const zoomToggleEl = document.getElementById('lightbox-zoom-toggle');
  const thumbsEl = document.getElementById('lightbox-thumbs');
  const titleEl = document.getElementById('lightbox-title');
  const metaPrincipalEl = document.getElementById('lightbox-meta-principal');
  const metaDimensionesEl = document.getElementById('lightbox-meta-dimensiones');
  const metaSerieEl = document.getElementById('lightbox-meta-serie');
  const descEl = document.getElementById('lightbox-desc');
  const compraEl = document.getElementById('lightbox-compra');
  const precioEl = document.getElementById('lightbox-precio');
  const whatsappEl = document.getElementById('lightbox-whatsapp');
  const badgeEl = document.getElementById('lightbox-badge');

  const ZOOM_CLICK = 2.5;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

  let imagenes = [];
  let lastFocused = null;
  let currentSrc = null;
  let loadSeq = 0;

  let zoomLevel = 1;
  let pinchActive = false;
  let pinchStartDist = 0;
  let pinchStartZoom = 1;
  let touchMoved = false;
  // Rect capturado en el instante en que arranca el zoom (transform aún sin
  // aplicar): transform-origin en % siempre se resuelve contra el layout box
  // SIN transformar, así que hay que fijar esta referencia una sola vez por
  // sesión de zoom en vez de volver a leer getBoundingClientRect() en cada
  // mousemove/touchmove — leerlo de nuevo ya con `scale()` aplicado daría un
  // rect agrandado y produciría un feedback loop (el punto seguido por el
  // cursor "corre").
  let baseRect = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setZoomOrigin(clientX, clientY) {
    const rect = baseRect || imageEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    imageEl.style.transformOrigin = `${x}% ${y}%`;
  }

  function applyZoom(level) {
    const wasZoomed = zoomLevel > 1.01;
    zoomLevel = clamp(level, MIN_ZOOM, MAX_ZOOM);
    const isZoomed = zoomLevel > 1.01;
    if (isZoomed && !wasZoomed) baseRect = imageEl.getBoundingClientRect();
    imageEl.style.transform = isZoomed ? `scale(${zoomLevel})` : '';
    imageEl.classList.toggle('zoomed', isZoomed);
    zoomToggleEl?.setAttribute('aria-label', isZoomed ? 'Reducir imagen' : 'Ampliar imagen');
  }

  function resetZoom() {
    zoomLevel = 1;
    pinchActive = false;
    baseRect = null;
    imageEl.style.transform = '';
    imageEl.style.transformOrigin = '';
    imageEl.classList.remove('zoomed', 'is-panning');
    zoomToggleEl?.setAttribute('aria-label', 'Ampliar imagen');
  }

  function toggleZoomAt(clientX, clientY) {
    if (zoomLevel > 1) {
      resetZoom();
    } else {
      setZoomOrigin(clientX, clientY);
      applyZoom(ZOOM_CLICK);
    }
  }

  function touchDistance(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function touchMidpoint(a, b) {
    return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
  }

  imageEl.addEventListener('mousemove', (event) => {
    if (zoomLevel <= 1) return;
    setZoomOrigin(event.clientX, event.clientY);
  });

  imageEl.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length === 2) {
        pinchActive = true;
        pinchStartDist = touchDistance(event.touches[0], event.touches[1]);
        pinchStartZoom = zoomLevel;
        const mid = touchMidpoint(event.touches[0], event.touches[1]);
        setZoomOrigin(mid.x, mid.y);
        imageEl.classList.add('is-panning');
        event.preventDefault();
      } else if (event.touches.length === 1) {
        touchMoved = false;
      }
    },
    { passive: false }
  );

  imageEl.addEventListener(
    'touchmove',
    (event) => {
      if (pinchActive && event.touches.length === 2) {
        const dist = touchDistance(event.touches[0], event.touches[1]);
        const mid = touchMidpoint(event.touches[0], event.touches[1]);
        setZoomOrigin(mid.x, mid.y);
        applyZoom(pinchStartZoom * (dist / pinchStartDist));
        event.preventDefault();
      } else if (event.touches.length === 1 && zoomLevel > 1) {
        touchMoved = true;
        setZoomOrigin(event.touches[0].clientX, event.touches[0].clientY);
        event.preventDefault();
      }
    },
    { passive: false }
  );

  const endTouch = (event) => {
    if (pinchActive && event.touches.length < 2) {
      pinchActive = false;
      imageEl.classList.remove('is-panning');
      if (zoomLevel <= 1.05) resetZoom();
    }
    if (event.touches.length === 0) {
      if (touchMoved) event.preventDefault();
      touchMoved = false;
    }
  };

  imageEl.addEventListener('touchend', endTouch, { passive: false });
  imageEl.addEventListener('touchcancel', endTouch, { passive: false });

  function setActiveIndex(index) {
    const img = imagenes[index];
    if (!img) return;
    resetZoom();

    if (img.src === currentSrc) {
      // Ya es la imagen mostrada (ej. reclick de la misma miniatura): no hay
      // nada que cargar, así que no esperamos un evento 'load' que no va a
      // volver a dispararse.
      imageEl.classList.add('is-ready');
    } else {
      const seq = ++loadSeq;
      imageEl.classList.remove('is-ready');

      const reveal = () => {
        if (seq !== loadSeq) return; // llegó una imagen más nueva mientras cargaba esta
        currentSrc = img.src;
        imageEl.classList.add('is-ready');
      };

      imageEl.addEventListener('load', reveal, { once: true });
      imageEl.addEventListener('error', reveal, { once: true });
      imageEl.src = img.src;
      imageEl.width = img.width;
      imageEl.height = img.height;
      imageEl.alt = img.alt;
    }

    thumbsEl.querySelectorAll('[data-thumb-index]').forEach((thumb) => {
      thumb.classList.toggle('active', Number(thumb.dataset.thumbIndex) === index);
    });
  }

  function buildThumbs() {
    thumbsEl.innerHTML = '';
    if (imagenes.length <= 1) {
      thumbsEl.hidden = true;
      return;
    }
    thumbsEl.hidden = false;
    imagenes.forEach((img, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lightbox-thumb';
      button.dataset.thumbIndex = String(i);
      const thumbImg = document.createElement('img');
      thumbImg.src = img.src;
      thumbImg.alt = '';
      button.appendChild(thumbImg);
      thumbsEl.appendChild(button);
    });
  }

  function open(card) {
    try {
      imagenes = JSON.parse(card.dataset.imagenes || '[]');
    } catch {
      imagenes = [];
    }
    if (imagenes.length === 0) return;

    lastFocused = document.activeElement;

    titleEl.textContent = card.dataset.titulo || '';
    const anio = Number(card.dataset.anio);
    metaPrincipalEl.textContent = anio > 0 ? `${anio} · ${card.dataset.tecnica}` : card.dataset.tecnica || '';
    if (card.dataset.dimensiones) {
      metaDimensionesEl.textContent = card.dataset.dimensiones;
      metaDimensionesEl.hidden = false;
    } else {
      metaDimensionesEl.hidden = true;
    }

    if (card.dataset.serie) {
      metaSerieEl.textContent = `Serie: ${card.dataset.serie}`;
      metaSerieEl.hidden = false;
    } else {
      metaSerieEl.hidden = true;
    }

    descEl.textContent = card.dataset.descripcion || '';

    const estado = card.dataset.estado;
    if (estado === 'disponible' && card.dataset.precioFormateado) {
      precioEl.textContent = card.dataset.precioFormateado;
      whatsappEl.href = card.dataset.whatsapp || '#';
      compraEl.hidden = false;
      badgeEl.hidden = true;
    } else if (estado === 'vendida') {
      compraEl.hidden = true;
      badgeEl.hidden = false;
    } else {
      compraEl.hidden = true;
      badgeEl.hidden = true;
    }

    buildThumbs();
    setActiveIndex(0);

    lightbox.hidden = false;
    void lightbox.offsetWidth;
    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    lightbox.querySelector('.lightbox-close')?.focus();
  }

  function close() {
    if (lightbox.hidden) return;
    resetZoom();
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    if (lastFocused instanceof HTMLElement) lastFocused.focus();

    lightbox.addEventListener(
      'transitionend',
      () => {
        lightbox.hidden = true;
      },
      { once: true }
    );
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('[data-lightbox-close]')) {
      close();
      return;
    }

    const thumb = target.closest('[data-thumb-index]');
    if (thumb && !lightbox.hidden) {
      setActiveIndex(Number(thumb.dataset.thumbIndex));
      return;
    }

    if (target.closest('[data-lightbox-zoom-toggle]') && !lightbox.hidden) {
      const rect = imageEl.getBoundingClientRect();
      toggleZoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return;
    }

    if (target.closest('[data-lightbox-image]') && !lightbox.hidden) {
      toggleZoomAt(event.clientX, event.clientY);
      return;
    }

    const card = target.closest('[data-obra-id]');
    if (card) {
      open(card);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) {
      if (zoomLevel > 1) {
        resetZoom();
      } else {
        close();
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      const active = document.activeElement;
      if (active instanceof Element && active.matches('[data-obra-id]')) {
        event.preventDefault();
        open(active);
      }
    }
  });
}

initFilters();
initLightbox();
