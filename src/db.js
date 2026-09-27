import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = process.env.DATA_DIR || './data';
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = join(DATA_DIR, 'mente-activa.db');

let db = null;

export function getDb() {
  if (db) return db;
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS centers (
      id INTEGER PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      plan TEXT DEFAULT 'demo',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY,
      center_id INTEGER NOT NULL REFERENCES centers(id),
      alias TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS content_packs (
      id INTEGER PRIMARY KEY,
      week TEXT UNIQUE NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS plays (
      id INTEGER PRIMARY KEY,
      center_id INTEGER NOT NULL,
      player_alias TEXT NOT NULL DEFAULT 'anonimo',
      game TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      duration_s INTEGER DEFAULT 0,
      mode TEXT DEFAULT 'individual',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS group_sessions (
      id INTEGER PRIMARY KEY,
      center_id INTEGER NOT NULL,
      game TEXT NOT NULL,
      team_a INTEGER DEFAULT 0,
      team_b INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}

// Semana ISO: "2026-W40"
export function weekStr(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const first = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const fday = (first.getUTCDay() + 6) % 7;
  first.setUTCDate(first.getUTCDate() - fday + 3);
  const w = 1 + Math.round((t - first) / (7 * 864e5));
  return `${t.getUTCFullYear()}-W${String(w).padStart(2, '0')}`;
}

export function getWeekPack(week) {
  const row = getDb().prepare('SELECT payload FROM content_packs WHERE week = ?').get(week);
  return row ? JSON.parse(row.payload) : null;
}

export function getActiveCenter() {
  return getDb().prepare('SELECT * FROM centers ORDER BY id LIMIT 1').get() || null;
}

export function savePlay({ center_id, player_alias, game, score, total, duration_s, mode }) {
  getDb()
    .prepare(
      'INSERT INTO plays (center_id, player_alias, game, score, total, duration_s, mode) VALUES (?,?,?,?,?,?,?)'
    )
    .run(center_id, player_alias || 'anonimo', game, score || 0, total || 0, duration_s || 0, mode || 'individual');
}

export function todayPlays(center_id) {
  return getDb()
    .prepare(
      `SELECT player_alias, game, score, total, duration_s, mode, created_at
       FROM plays WHERE center_id = ? AND date(created_at) = date('now','localtime')
       ORDER BY created_at DESC LIMIT 200`
    )
    .all(center_id);
}
