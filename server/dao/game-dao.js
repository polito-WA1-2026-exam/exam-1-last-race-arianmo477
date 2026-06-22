

import db from '../db/db.js';

// --- Promisified helpers ---------------------------------------------------
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // this.lastID / this.changes
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });


export async function createGame(userId, startId, destId) {
  const startedAt = new Date().toISOString();
  const res = await run(
    `INSERT INTO games (user_id, start_id, dest_id, status, score, started_at)
     VALUES (?, ?, ?, 'planning', NULL, ?)`,
    [userId, startId, destId, startedAt]
  );
  return getGameById(res.lastID);
}


export function getGameById(gameId) {
  return get('SELECT * FROM games WHERE id = ?', [gameId]);
}


export async function saveSegments(gameId, resolvedSteps) {
  for (let i = 0; i < resolvedSteps.length; i++) {
    const { fromId, toId, eventId } = resolvedSteps[i];
    await run(
      `INSERT INTO game_segments (game_id, step, from_id, to_id, event_id)
       VALUES (?, ?, ?, ?, ?)`,
      [gameId, i, fromId, toId, eventId]
    );
  }
}


export function finishGame(gameId, score) {
  const safeScore = Math.max(0, score);
  return run(
    `UPDATE games SET status = 'done', score = ? WHERE id = ?`,
    [safeScore, gameId]
  );
}


export function getGameSegments(gameId) {
  return all(
    `SELECT gs.step,
            sf.name AS fromName,
            st.name AS toName,
            e.description AS eventDescription,
            e.effect AS eventEffect
     FROM game_segments gs
     JOIN stations sf ON sf.id = gs.from_id
     JOIN stations st ON st.id = gs.to_id
     LEFT JOIN events e ON e.id = gs.event_id
     WHERE gs.game_id = ?
     ORDER BY gs.step`,
    [gameId]
  );
}


export function getRanking() {
  return all(
    `SELECT u.username, MAX(g.score) AS bestScore
     FROM games g
     JOIN users u ON u.id = g.user_id
     WHERE g.status = 'done'
     GROUP BY g.user_id
     ORDER BY bestScore DESC, u.username ASC`
  );
}