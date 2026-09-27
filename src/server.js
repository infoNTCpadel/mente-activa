import express from 'express';
import layouts from 'express-ejs-layouts';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, getWeekPack, getActiveCenter, savePlay, todayPlays, weekStr } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const app = express();
const PORT = process.env.PORT || 3000;
const PANEL_CODE = process.env.PANEL_CODE || 'demo123';

getDb(); // crea esquema

app.set('view engine', 'ejs');
app.set('views', join(ROOT, 'views'));
app.use(layouts);
app.use(express.json({ limit: '256kb' }));
app.use(express.static(join(ROOT, 'public')));

const GAMES = {
  refranes: { titulo: 'Refranes', desc: 'Completa el refrán', js: 'refranes.js', icono: '💬' },
  parejas: { titulo: 'Parejas', desc: 'Encuentra las parejas', js: 'parejas.js', icono: '🃏' },
  cuentas: { titulo: 'Cuentas de la vida', desc: 'Cuentas de cada día', js: 'cuentas.js', icono: '🧮' },
};

// Home: sesión del día
app.get('/', (req, res) => {
  res.render('index', { games: GAMES, week: weekStr() });
});

// Juego individual
app.get('/jugar/:juego', (req, res) => {
  const g = GAMES[req.params.juego];
  if (!g) return res.status(404).send('Juego no encontrado');
  res.render('juego', { id: req.params.juego, game: g });
});

// Modo grupo (pantalla grande / TV)
app.get('/grupo', (req, res) => {
  res.render('grupo', { games: GAMES });
});

// Panel del animador (código sencillo; endurecer en producción)
app.get('/panel', (req, res) => {
  if (req.query.codigo !== PANEL_CODE) return res.status(403).render('panel-lock');
  const center = getActiveCenter();
  res.render('panel', { center, plays: center ? todayPlays(center.id) : [] });
});

// API: contenido de la semana (lo precarga el service worker para offline)
app.get('/api/contenido/semana', (req, res) => {
  const pack = getWeekPack(weekStr());
  if (!pack) return res.status(404).json({ error: 'sin contenido esta semana' });
  res.json({ week: weekStr(), ...pack });
});

// API: guardar partida (con cola offline en el cliente)
app.post('/api/partida', (req, res) => {
  const center = getActiveCenter();
  if (!center) return res.status(500).json({ error: 'sin centro' });
  const { juego, aciertos, total, duracion_s, modo, alias } = req.body || {};
  if (!juego || !GAMES[juego]) return res.status(400).json({ error: 'juego inválido' });
  savePlay({
    center_id: center.id,
    player_alias: String(alias || 'anonimo').slice(0, 40),
    game: juego,
    score: Number(aciertos) || 0,
    total: Number(total) || 0,
    duration_s: Number(duracion_s) || 0,
    mode: modo === 'grupo' ? 'grupo' : 'individual',
  });
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Mente Activa en puerto ${PORT} (semana ${weekStr()})`));
