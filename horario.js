window.addEventListener('DOMContentLoaded', () => {
  const dayButtons = document.querySelectorAll('.day');
  const btnGuardar = document.getElementById('btnGuardar');
  const confirmacion = document.getElementById('msg');
  const modal = document.getElementById('modal');
  const modalCerrar = document.getElementById('modalCerrar');
  const modalAceptar = document.getElementById('modalAceptar');
  const modalTexto = document.getElementById('modalTexto');
  const inicioInput = document.getElementById('inicio');
  const finInput = document.getElementById('fin');

  const toggleDay = (button) => {
    button.classList.toggle('active');
  };

  const getSelectedDays = () => {
    return [...dayButtons]
      .filter((button) => button.classList.contains('active'))
      .map((button) => button.textContent.trim());
  };

  const showMessage = (text, success = true) => {
    if (!confirmacion) return;
    confirmacion.textContent = text;
    confirmacion.classList.remove('hidden');
    if (success) confirmacion.classList.remove('error'); else confirmacion.classList.add('error');
    setTimeout(() => confirmacion.classList.add('hidden'), 3600);
  };

  const openModal = (text) => {
    if (!modal) return;
    modalTexto.textContent = text;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  const saveSchedule = async (inicio, fin, days) => {
    try {
      const payload = { inicio, fin, days };
      const response = await fetch('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al guardar en el servidor.');
      }

      const daysText = days.length ? days.join(', ') : 'ningún día';
      showMessage(`Horario guardado de ${inicio} a ${fin}. Días: ${daysText}`);
      openModal(`Tu horario se guardó de ${inicio} a ${fin} para ${daysText}.`);
    } catch (error) {
      try {
        const key = 'schedules';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({ id: Date.now(), inicio, fin, days });
        localStorage.setItem(key, JSON.stringify(existing));
        showMessage('Servidor no disponible: horario guardado localmente.', false);
      } catch (e) {
        showMessage(`No se pudo guardar: ${error.message}`, false);
      }
    }
  };

  dayButtons.forEach((button) => {
    button.addEventListener('click', () => toggleDay(button));
  });

  if (btnGuardar) {
    btnGuardar.addEventListener('click', () => {
      const inicio = inicioInput.value || '22:00';
      const fin = finInput.value || '06:00';
      const days = getSelectedDays();
      saveSchedule(inicio, fin, days);
    });
  }

  if (modalCerrar) modalCerrar.addEventListener('click', closeModal);
  if (modalAceptar) modalAceptar.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
});
