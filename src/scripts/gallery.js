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

  let imagenes = [];
  let lastFocused = null;
  let currentSrc = null;
  let loadSeq = 0;

  function setActiveIndex(index) {
    const img = imagenes[index];
    if (!img) return;
    imageEl.classList.remove('zoomed');

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

    if (target.closest('[data-lightbox-image]') && !lightbox.hidden) {
      imageEl.classList.toggle('zoomed');
      return;
    }

    const card = target.closest('[data-obra-id]');
    if (card) {
      open(card);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) {
      close();
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
