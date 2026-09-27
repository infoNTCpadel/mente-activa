// Juego: Refranes — completa el refrán (5 por sesión).
async function main() {
  const box = document.getElementById('juego');
  let pack;
  try {
    pack = await (await fetch('/api/contenido/semana')).json();
  } catch (e) {
    box.innerHTML = '<p class="grande">Sin conexión y sin contenido guardado. Vuelve cuando haya internet.</p>';
    return;
  }
  const items = [...pack.refranes].sort(() => Math.random() - 0.5).slice(0, 5);
  let i = 0, aciertos = 0;
  const t0 = Date.now();

  function pintar() {
    if (i >= items.length) return fin();
    const it = items[i];
    box.innerHTML = `
      <div class="progreso">Refrán ${i + 1} de ${items.length}</div>
      <h2 class="pregunta">${it.inicio}</h2>
      <div class="opciones">
        ${it.opciones.map((op, k) => `<button class="btn-opcion" data-k="${k}">${op}</button>`).join('')}
      </div>
      <button class="btn btn-audio" id="oir">🔊 Escuchar</button>`;
    hablar('Completa el refrán: ' + it.inicio);
    document.getElementById('oir').onclick = () =>
      hablar(it.inicio + '. Opciones: ' + it.opciones.join(', '));
    box.querySelectorAll('.btn-opcion').forEach((b) => (b.onclick = () => responder(+b.dataset.k, it)));
  }

  function responder(k, it) {
    const ok = k === it.correcta;
    if (ok) {
      aciertos++;
      hablar('¡Muy bien!');
    } else {
      hablar('Casi. Era: ' + it.opciones[it.correcta]);
    }
    box.querySelectorAll('.btn-opcion').forEach((b) => {
      const kk = +b.dataset.k;
      b.disabled = true;
      if (kk === it.correcta) b.classList.add('ok');
      else if (kk === k) b.classList.add('ko');
    });
    setTimeout(() => { i++; pintar(); }, ok ? 1600 : 2800);
  }

  function fin() {
    const s = Math.round((Date.now() - t0) / 1000);
    guardarPartida({ juego: 'refranes', aciertos, total: items.length, duracion_s: s, modo: 'individual' });
    box.innerHTML = `
      <h2>¡Sesión terminada!</h2>
      <p class="grande">Has acertado ${aciertos} de ${items.length} refranes.</p>
      <a class="btn" href="/">Volver a los juegos</a>`;
    hablar(`Has acertado ${aciertos} de ${items.length}. ¡Muy bien!`);
  }

  pintar();
}
document.addEventListener('DOMContentLoaded', main);
