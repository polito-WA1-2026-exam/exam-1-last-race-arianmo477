

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

// Create a new game. started_at is stamped on the server right now; the
// 90-second planning limit is checked later against this value, so the
// timer cannot be tampered with from the client.
export async function createGame(userId, startId, destId) {
  const startedAt = new Date().toISOString();
  const res = await run(
    `INSERT INTO games (user_id, start_id, dest_id, status, score, started_at)
     VALUES (?, ?, ?, 'planning', NULL, ?)`,
    [userId, startId, destId, startedAt]
  );
  return getGameById(res.lastID);
}

// Load a single game row (includes user_id, start_id, dest_id, status,
// score, started_at). Returns undefined if not found.
export function getGameById(gameId) {
  return get('SELECT * FROM games WHERE id = ?', [gameId]);
}

// Persist the executed route. `resolvedSteps` is an ordered array of
// { fromId, toId, eventId }. Written one row per step so the Result phase
// can replay the journey and the data is auditable.
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

// Mark a game finished and store its final score. The caller is responsible
// for clamping negative scores to 0 (scoring policy lives in services), but
// we guard here too so the DB never holds a negative score.
export function finishGame(gameId, score) {
  const safeScore = Math.max(0, score);
  return run(
    `UPDATE games SET status = 'done', score = ? WHERE id = ?`,
    [safeScore, gameId]
  );
}

// Ordered steps of a game, joined to event + station names for display.
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

// General ranking: each user's BEST score across their finished games.
// Only users who have completed at least one game appear. Ordered high->low.
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