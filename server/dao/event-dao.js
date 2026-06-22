

import db from '../db/db.js';

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });


export function getEvents() {
  return all('SELECT id, description, effect FROM events ORDER BY id');
}


export async function getRandomEvent() {
  const events = await getEvents();
  const index = Math.floor(Math.random() * events.length);
  return events[index];
}