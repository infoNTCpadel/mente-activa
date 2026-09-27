# Mente Activa (nombre de trabajo)

Estimulación lúdica para centros de día: PWA con juegos sencillos para mayores
(refranes, parejas, cuentas cotidianas), modo grupo para la tele del centro y
panel mínimo para el animador. Sin registro para el residente, todo con audio,
botones grandes y funcionamiento offline.

Stack: Node 24 + Express + EJS + `node:sqlite` + Docker. Sin dependencias nativas.

## Arranque rápido

```bash
npm install
npm run icons        # genera los iconos PWA (una vez)
DATA_DIR=/tmp/ma-test npm run seed   # centro demo + contenido de la semana
DATA_DIR=/tmp/ma-test npm start      # http://localhost:3000
```

> No arrancar nunca el servidor apuntando `DATA_DIR` a `./data` para pruebas:
> toca el binario de la BD. Usar siempre una copia en `/tmp`.

## Docker

```bash
docker compose up -d --build
# http://localhost:3001
```

## Despliegue en el VPS

Igual que PadelVallès: `gh-push` al repo y en el VPS `git pull` +
`docker compose up -d --build`. Descomentar las `labels` de Traefik en
`docker-compose.yml` y poner el dominio.

## Rutas

- `/` — sesión del día (3 juegos)
- `/jugar/refranes|parejas|cuentas` — juego individual
- `/grupo` — modo grupo (marcador por equipos para la TV)
- `/panel?codigo=...` — panel del animador (código en `PANEL_CODE`)
- `/api/contenido/semana` — contenido semanal (lo precarga el service worker)

## Estructura

- `src/server.js` — Express + EJS + API
- `src/db.js` — esquema SQLite (`centers`, `players`, `content_packs`, `plays`, `group_sessions`)
- `src/seed.js` — centro demo + paquete semanal (10 refranes, 8 parejas, 8 cuentas)
- `public/js/*.js` — lógica de cada juego (voz con `speechSynthesis`, cola offline)
- `public/sw.js` — offline-first: precarga app + contenido semanal

## Notas

- **Privacidad:** los residentes se identifican por alias. Nada de DNI, datos de
  salud ni diagnósticos. Cero claims médicos en textos ("estimulación lúdica").
- **Panel:** el código por query es provisional; endurecer (sesión) en producción.
- **Roadmap:** 4º y 5º juego (atención, música), dificultad adaptativa,
  telemetría agregada por centro, plan familiar, envoltura Capacitor si un
  centro exige app de tienda.
