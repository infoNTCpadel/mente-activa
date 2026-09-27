// Semilla: centro demo + paquete de contenido de la semana actual.
// Uso: DATA_DIR=/tmp/ma-test node src/seed.js
import { getDb, weekStr } from './db.js';

const refranes = [
  { inicio: 'A caballo regalado…', opciones: ['no le mires el diente', 'no le des de comer', 'no lo montes deprisa', 'no lo dejes escapar'], correcta: 0 },
  { inicio: 'Más vale pájaro en mano…', opciones: ['que ciento volando', 'que dos en el nido', 'que águila en el cielo', 'que pez en el río'], correcta: 0 },
  { inicio: 'No hay mal…', opciones: ['que cien años dure', 'que no tenga remedio', 'que por bien no venga', 'que dure para siempre'], correcta: 0 },
  { inicio: 'A lo hecho…', opciones: ['pecho', 'ya no hay remedio', 'hay que llorar', 'no se vuelve'], correcta: 0 },
  { inicio: 'Quien madruga…', opciones: ['Dios le ayuda', 'coge el autobús', 'desayuna tranquilo', 'llega el primero'], correcta: 0 },
  { inicio: 'Dime con quién andas…', opciones: ['y te diré quién eres', 'y te diré a dónde vas', 'y te diré qué comes', 'y te diré tu edad'], correcta: 0 },
  { inicio: 'Ojos que no ven…', opciones: ['corazón que no siente', 'boca que no habla', 'oídos que no oyen', 'manos que no tocan'], correcta: 0 },
  { inicio: 'Perro ladrador…', opciones: ['poco mordedor', 'mucho corredor', 'buen guardián', 'poco comedor'], correcta: 0 },
  { inicio: 'En casa del herrero…', opciones: ['cuchillo de palo', 'sartén sin mango', 'puerta sin llave', 'mesa sin patas'], correcta: 0 },
  { inicio: 'Cría cuervos…', opciones: ['y te sacarán los ojos', 'y volarán lejos', 'y cantarán de noche', 'y te harán compañía'], correcta: 0 },
];

const parejas = [
  { emoji: '☀️', nombre: 'sol' },
  { emoji: '🏠', nombre: 'casa' },
  { emoji: '🍎', nombre: 'manzana' },
  { emoji: '🐟', nombre: 'pez' },
  { emoji: '🌹', nombre: 'rosa' },
  { emoji: '🚗', nombre: 'coche' },
  { emoji: '🐱', nombre: 'gato' },
  { emoji: '🍞', nombre: 'pan' },
];

const cuentas = [
  { pregunta: 'El pan cuesta 1,20 € la barra. Compras 3 barras. ¿Cuánto pagas?', opciones: ['3,60 €', '3,20 €', '4,20 €', '2,40 €'], correcta: 0 },
  { pregunta: 'Un café cuesta 1,50 €. ¿Cuánto cuestan 4 cafés?', opciones: ['6,00 €', '5,50 €', '6,50 €', '5,00 €'], correcta: 0 },
  { pregunta: 'Tienes 20 € y compras fruta por 7,50 €. ¿Cuánto te queda?', opciones: ['12,50 €', '13,50 €', '12,00 €', '11,50 €'], correcta: 0 },
  { pregunta: 'Una docena de huevos cuesta 2,40 €. ¿Cuánto cuesta media docena?', opciones: ['1,20 €', '1,50 €', '1,00 €', '2,00 €'], correcta: 0 },
  { pregunta: 'El autobús cuesta 1,35 €. Pagas con 5 €. ¿Cuánto te devuelven?', opciones: ['3,65 €', '3,55 €', '4,65 €', '3,75 €'], correcta: 0 },
  { pregunta: 'Compras 2 kilos de naranjas a 1,80 € el kilo. ¿Cuánto pagas?', opciones: ['3,60 €', '3,40 €', '4,60 €', '2,80 €'], correcta: 0 },
  { pregunta: 'Son las 10:30 y el médico es a las 12:00. ¿Cuánto falta?', opciones: ['1 hora y media', '2 horas', '1 hora', '2 horas y media'], correcta: 0 },
  { pregunta: 'Repartes 100 € entre tus 4 nietos a partes iguales. ¿Cuánto le toca a cada uno?', opciones: ['25 €', '20 €', '30 €', '40 €'], correcta: 0 },
];

const db = getDb();
db.prepare("INSERT OR IGNORE INTO centers (code, name, plan) VALUES ('DEMO','Centro de Día Demo','demo')").run();
const week = weekStr();
db.prepare('INSERT OR REPLACE INTO content_packs (week, payload) VALUES (?, ?)').run(
  week,
  JSON.stringify({ refranes, parejas, cuentas })
);
for (const alias of ['Carmen', 'Antonio', 'María', 'José']) {
  db.prepare('INSERT OR IGNORE INTO players (center_id, alias) SELECT id, ? FROM centers WHERE code = ?').run(alias, 'DEMO');
}
console.log(`Semilla lista: centro DEMO, semana ${week} (${refranes.length} refranes, ${parejas.length} parejas, ${cuentas.length} cuentas)`);
