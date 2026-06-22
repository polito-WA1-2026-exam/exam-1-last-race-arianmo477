import crypto from 'crypto';
import db from '../db/db.js';

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });


export function getUserByUsername(username) {
  return get('SELECT * FROM users WHERE username = ?', [username]);
}

export function getUserById(id) {
  return get('SELECT * FROM users WHERE id = ?', [id]);
}


export function verifyPassword(user, password) {
  const computed = crypto.scryptSync(password, user.salt, 32);
  const stored = Buffer.from(user.hash, 'hex');

  if (computed.length !== stored.length) return false;

  return crypto.timingSafeEqual(computed, stored);
}