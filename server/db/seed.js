
import sqlite3 from 'sqlite3';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'lastrace.sqlite');

const db = new sqlite3.Database(DB_PATH);

// Promisified helpers so the seeding steps can run sequentially with await.
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // `this.lastID` available for inserts
    });
  });

const exec = (sql) =>
  new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, 32).toString('hex');
  return { hash, salt };
}

// ---------------------------------------------------------------------------
// Network definition (single source of truth for the seed).
// Each line lists its stations in physical order along the line.
// ---------------------------------------------------------------------------
const LINES = {
  'Linea Aurora': ['Quartiere Nord', 'San Celso', 'Belvedere', 'Foro Antico', 'Mercato Vecchio', 'Ponte Lungo'],
  'Linea Marea': ['San Celso', 'Cardo Massimo', 'Anfiteatro', 'Mercato Vecchio', 'Darsena', 'Faro'],
  'Linea Vento': ['Belvedere', 'Cardo Massimo', 'Orto Botanico', 'Collina Verde', 'Acquedotto'],
  'Linea Sole': ['Foro Antico', 'Orto Botanico', 'Teatro Grande', 'Darsena', 'Vigna Alta', 'Lido Sud'],
};

const STATION_COORDS = {
  'Quartiere Nord': { x: 80, y: 120 },
  'San Celso': { x: 180, y: 200 },
  'Belvedere': { x: 300, y: 150 },
  'Foro Antico': { x: 440, y: 130 },
  'Mercato Vecchio': { x: 560, y: 200 },
  'Ponte Lungo': { x: 700, y: 160 },
  'Cardo Massimo': { x: 280, y: 300 },
  'Anfiteatro': { x: 420, y: 280 },
  'Darsena': { x: 620, y: 340 },
  'Faro': { x: 760, y: 320 },
  'Orto Botanico': { x: 420, y: 400 },
  'Collina Verde': { x: 300, y: 470 },
  'Acquedotto': { x: 180, y: 520 },
  'Teatro Grande': { x: 520, y: 460 },
  'Vigna Alta': { x: 680, y: 460 },
  'Lido Sud': { x: 800, y: 500 },
};

const EVENTS = [
  { description: 'Quiet journey, nothing happens', effect: 0 },
  { description: 'Kind passenger gives you a coin', effect: 1 },
  { description: 'Found a coin on the platform', effect: 2 },
  { description: 'Street musician brightens the ride', effect: 1 },
  { description: 'Unexpected refund at the gate', effect: 3 },
  { description: 'Lucky ticket draw', effect: 4 },
  { description: 'Wrong platform, you lose time and a coin', effect: -1 },
  { description: 'Forgotten ticket fine', effect: -2 },
  { description: 'Train delay, you buy a snack', effect: -3 },
  { description: 'Pickpocket on a crowded car', effect: -4 },
];

const USERS = [
  { username: 'mario', password: 'password123' },
  { username: 'lucia', password: 'metro2026' },
  { username: 'paolo', password: 'lastrace!' },
];

async function seed() {
  // --- Reset schema so re-running the seed gives a clean state -----------
  await exec(`
    DROP TABLE IF EXISTS game_segments;
    DROP TABLE IF EXISTS games;
    DROP TABLE IF EXISTS line_stations;
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS stations;
    DROP TABLE IF EXISTS lines;
    DROP TABLE IF EXISTS users;
  `);

  await exec(`
    CREATE TABLE users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      hash     TEXT NOT NULL,
      salt     TEXT NOT NULL
    );

    CREATE TABLE lines (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE stations (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      x    INTEGER NOT NULL,
      y    INTEGER NOT NULL
    );

    -- Ordered membership of stations on each line. The (line_id, position)
    -- pair defines the physical order; adjacency in this order = a segment.
    CREATE TABLE line_stations (
      line_id    INTEGER NOT NULL,
      station_id INTEGER NOT NULL,
      position   INTEGER NOT NULL,
      PRIMARY KEY (line_id, position),
      FOREIGN KEY (line_id)    REFERENCES lines(id),
      FOREIGN KEY (station_id) REFERENCES stations(id)
    );

    CREATE TABLE events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      effect      INTEGER NOT NULL CHECK (effect BETWEEN -4 AND 4)
    );

    -- One row per played (or in-progress) game.
    CREATE TABLE games (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL,
      start_id     INTEGER NOT NULL,
      dest_id      INTEGER NOT NULL,
      status       TEXT NOT NULL DEFAULT 'planning',   -- planning | done
      score        INTEGER,                            -- final score, >= 0
      started_at   TEXT NOT NULL,                      -- ISO timestamp (server-authoritative timer)
      FOREIGN KEY (user_id)  REFERENCES users(id),
      FOREIGN KEY (start_id) REFERENCES stations(id),
      FOREIGN KEY (dest_id)  REFERENCES stations(id)
    );

    -- The route the player submitted, stored as ordered segments, plus the
    -- event that was rolled for each step. Kept for auditability / result replay.
    CREATE TABLE game_segments (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id   INTEGER NOT NULL,
      step      INTEGER NOT NULL,
      from_id   INTEGER NOT NULL,
      to_id     INTEGER NOT NULL,
      event_id  INTEGER,
      FOREIGN KEY (game_id)  REFERENCES games(id),
      FOREIGN KEY (from_id)  REFERENCES stations(id),
      FOREIGN KEY (to_id)    REFERENCES stations(id),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
  `);

  // --- Stations ----------------------------------------------------------
  const stationId = {};
  for (const [name, { x, y }] of Object.entries(STATION_COORDS)) {
    const res = await run('INSERT INTO stations (name, x, y) VALUES (?, ?, ?)', [name, x, y]);
    stationId[name] = res.lastID;
  }

  // --- Lines + ordered line_stations ------------------------------------
  for (const [lineName, stationsInOrder] of Object.entries(LINES)) {
    const res = await run('INSERT INTO lines (name) VALUES (?)', [lineName]);
    const lineId = res.lastID;
    for (let pos = 0; pos < stationsInOrder.length; pos++) {
      const sName = stationsInOrder[pos];
      await run(
        'INSERT INTO line_stations (line_id, station_id, position) VALUES (?, ?, ?)',
        [lineId, stationId[sName], pos]
      );
    }
  }

  // --- Events ------------------------------------------------------------
  for (const e of EVENTS) {
    await run('INSERT INTO events (description, effect) VALUES (?, ?)', [e.description, e.effect]);
  }

  // --- Users -------------------------------------------------------------
  const userId = {};
  for (const u of USERS) {
    const { hash, salt } = hashPassword(u.password);
    const res = await run(
      'INSERT INTO users (username, hash, salt) VALUES (?, ?, ?)',
      [u.username, hash, salt]
    );
    userId[u.username] = res.lastID;
  }


  const sampleGames = [
    {
      user: 'mario',
      start: 'San Celso',
      dest: 'Mercato Vecchio',
      score: 23,
      steps: [
        ['San Celso', 'Belvedere'],
        ['Belvedere', 'Foro Antico'],
        ['Foro Antico', 'Mercato Vecchio'],
      ],
    },
    {
      user: 'lucia',
      start: 'San Celso',
      dest: 'Mercato Vecchio',
      score: 18,
      steps: [
        ['San Celso', 'Cardo Massimo'],
        ['Cardo Massimo', 'Anfiteatro'],
        ['Anfiteatro', 'Mercato Vecchio'],
      ],
    },
    {
      user: 'mario',
      start: 'Belvedere',
      dest: 'Collina Verde',
      score: 11,
      steps: [
        ['Belvedere', 'Cardo Massimo'],
        ['Cardo Massimo', 'Orto Botanico'],
        ['Orto Botanico', 'Collina Verde'],
      ],
    },
  ];
  for (const g of sampleGames) {
    const gameRes = await run(
      `INSERT INTO games (user_id, start_id, dest_id, status, score, started_at)
       VALUES (?, ?, ?, 'done', ?, ?)`,
      [userId[g.user], stationId[g.start], stationId[g.dest], g.score, new Date().toISOString()]
    );
    const gameId = gameRes.lastID;
    for (let i = 0; i < g.steps.length; i++) {
      const [from, to] = g.steps[i];
      // assign a deterministic-ish event id (1..10) just for the sample data
      const eventId = ((i + g.score) % EVENTS.length) + 1;
      await run(
        `INSERT INTO game_segments (game_id, step, from_id, to_id, event_id)
         VALUES (?, ?, ?, ?, ?)`,
        [gameId, i, stationId[from], stationId[to], eventId]
      );
    }
  }

  console.log('Database seeded successfully.');
  console.log(`  ${Object.keys(STATION_COORDS).length} stations, ${Object.keys(LINES).length} lines`);
  console.log(`  ${EVENTS.length} events, ${USERS.length} users, ${sampleGames.length} sample games`);
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  })
  .finally(() => db.close());