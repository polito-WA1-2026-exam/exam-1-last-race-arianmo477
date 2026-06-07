

import db from '../db/db.js';

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

// All events, used both for reference and as the pool to draw from.
export function getEvents() {
  return all('SELECT id, description, effect FROM events ORDER BY id');
}

// Pick one event uniformly at random from the full pool.
// Done in JS after loading the pool so the choice is clearly server-side
// and easy to reason about (the event set is tiny).
export async function getRandomEvent() {
  const events = await getEvents();
  const index = Math.floor(Math.random() * events.length);
  return events[index];
}