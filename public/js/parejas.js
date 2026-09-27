// Juego: Parejas — memoria visual con 6 parejas (12 cartas grandes).
async function main() {
  const box = document.getElementById('juego');
  let pack;
  try {
    pack = await (await fetch('/api/contenido/semana')).json();
  } catch (e) {
    box.innerHTML = '<p class="grande">Sin conexión y sin contenido guardado. Vuelve cuando haya internet.</p>';
    return;
  }
  const base = [...pack.parejas].sort(() => Math.random() - 0.5).slice(0, 6);
  const cartas = [...base, ...base]
    .map((c, n) => ({ ...c, n }))
    .sort(() => Math.random() - 0.5);
  let abiertas = [], encontradas = 0, intentos = 0;
  const t0 = Date.now();

  box.innerHTML = `
    <div class="progreso">Toca dos cartas para encontrar las parejas</div>
    <div class="cartas" id="mesa"></div>
    <button class="btn btn-audio" id="oir">🔊 Escuchar</button>`;
  hablar('Encuentra las parejas. Toca dos cartas.');
  document.getElementById('oir').onclick = () => hablar('Encuentra las parejas iguales. Toca dos cartas.');

  const mesa = document.getElementById('mesa');
  cartas.forEach((c, idx) => {
    const b = document.createElement('button');
    b.className = 'carta';
    b.dataset.idx = idx;
    b.innerHTML = '<span>?</span>';
    b.setAttribute('aria-label', 'carta tapada');
    b.onclick = () => voltear(b, c);
    mesa.appendChild(b);
  });

  function voltear(b, c) {
    if (b.classList.contains('abierta') || b.classList.contains('encontrada') || abiertas.length === 2) return;
    b.classList.add('abierta');
    b.innerHTML = `<span>${c.emoji}</span><small>${c.nombre}</small>`;
    abiertas.push({ b, c });
    if (abiertas.length === 2) {
      intentos++;
      const [x, y] = abiertas;
      if (x.c.nombre === y.c.nombre && x.b !== y.b) {
        setTimeout(() => {
          x.b.classList.add('encontrada'); y.b.classList.add('encontrada');
          x.b.disabled = y.b.disabled = true;
          encontradas += 2;
          hablar('¡Pareja encontrada: ' + x.c.nombre + '!');
          abiertas = [];
          if (encontradas === cartas.length) fin();
        }, 700);
      } else {
        setTimeout(() => {
          x.b.classList.remove('abierta'); y.b.classList.remove('abierta');
          x.b.innerHTML = '<span>?</span>'; y.b.innerHTML = '<span>?</span>';
          abiertas = [];
        }, 1400);
      }
    }
  }

  function fin() {
    const s = Math.round((Date.now() - t0) / 1000);
    guardarPartida({ juego: 'parejas', aciertos: 6, total: 6, duracion_s: s, modo: 'individual' });
    box.innerHTML = `
      <h2>¡Todas encontradas!</h2>
      <p class="grande">Lo has conseguido en ${intentos} intentos.</p>
      <a class="btn" href="/">Volver a los juegos</a>`;
    hablar(`¡Todas encontradas en ${intentos} intentos! ¡Fenomenal!`);
  }
}
document.addEventListener('DOMContentLoaded', main);
