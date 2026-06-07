const dayButtons = document.querySelectorAll('.day');
const btnGuardar = document.getElementById('btnGuardar');
const confirmacion = document.getElementById('confirmacion');
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

const showMessage = (text) => {
  confirmacion.textContent = text;
  confirmacion.classList.remove('hidden');
  setTimeout(() => confirmacion.classList.add('hidden'), 3600);
};

const openModal = (text) => {
  modalTexto.textContent = text;
  modal.classList.remove('hidden');
};

const closeModal = () => {
  modal.classList.add('hidden');
};

const saveSchedule = async (inicio, fin, days) => {
  try {
    const response = await fetch('save_schedule.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inicio, fin, days }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Error al guardar el horario.');
    }

    const daysText = days.length ? days.join(', ') : 'ningún día';
    showMessage(`Horario guardado de ${inicio} a ${fin}. Días: ${daysText}`);
    openModal(`Tu horario se guardó de ${inicio} a ${fin} para ${daysText}.`);
  } catch (error) {
    showMessage(`No se pudo guardar: ${error.message}`);
  }
};

dayButtons.forEach((button) => {
  button.addEventListener('click', () => toggleDay(button));
});

btnGuardar.addEventListener('click', () => {
  const inicio = inicioInput.value || '22:00';
  const fin = finInput.value || '06:00';
  const days = getSelectedDays();
  saveSchedule(inicio, fin, days);
});

modalCerrar.addEventListener('click', closeModal);
modalAceptar.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
