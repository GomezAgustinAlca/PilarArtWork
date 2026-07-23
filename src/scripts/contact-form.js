function initContactForm() {
  const form = document.getElementById('contacto-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const endpoint = form.getAttribute('action');

  function setStatus(state, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = state;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Honeypot: si un bot llenó el campo oculto, fingimos éxito sin enviar nada.
    const honeypot = form.querySelector('input[name="botcheck"]');
    if (honeypot instanceof HTMLInputElement && honeypot.value) {
      form.reset();
      setStatus('success', '¡Mensaje enviado! Te voy a responder a la brevedad.');
      return;
    }

    if (!endpoint) {
      setStatus('error', 'El formulario todavía no está conectado. Escribime por WhatsApp o email mientras tanto.');
      return;
    }

    submitBtn?.setAttribute('disabled', 'true');
    setStatus('sending', 'Enviando...');

    try {
      const formData = new FormData(form);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        form.reset();
        setStatus('success', '¡Mensaje enviado! Te voy a responder a la brevedad.');
      } else {
        setStatus('error', 'No se pudo enviar el mensaje. Probá de nuevo o escribime por WhatsApp/email.');
      }
    } catch {
      setStatus('error', 'No se pudo enviar el mensaje. Revisá tu conexión o escribime por WhatsApp/email.');
    } finally {
      submitBtn?.removeAttribute('disabled');
    }
  });
}

initContactForm();
