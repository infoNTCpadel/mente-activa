// Utilidades compartidas: voz, guardado de partidas con cola offline.
function hablar(texto) {
  try {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-ES';
    u.rate = 0.95;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (e) { /* sin voz no pasa nada */ }
}

function guardarPartida(datos) {
  const enviar = (p) =>
    fetch('/api/partida', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
  enviar(datos).catch(() => {
    const cola = JSON.parse(localStorage.getItem('ma_cola') || '[]');
    cola.push(datos);
    localStorage.setItem('ma_cola', JSON.stringify(cola));
  });
}

function vaciarCola() {
  const cola = JSON.parse(localStorage.getItem('ma_cola') || '[]');
  if (!cola.length) return;
  (async () => {
    const resto = [];
    for (const p of cola) {
      try {
        await fetch('/api/partida', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
      } catch (e) {
        resto.push(p);
      }
    }
    localStorage.setItem('ma_cola', JSON.stringify(resto));
  })();
}

window.addEventListener('online', vaciarCola);
document.addEventListener('DOMContentLoaded', vaciarCola);
