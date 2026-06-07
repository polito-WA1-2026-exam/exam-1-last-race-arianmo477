import crypto from 'crypto';
import db from '../db/db.js';

// Promisified single-row query helper.
const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

// Return the full user row for a username, or undefined if not found.
// (Includes hash + salt because verifyPassword needs them; this object is
// never sent to the client as-is — routes strip it down to { id, username }.)
export function getUserByUsername(username) {
  return get('SELECT * FROM users WHERE username = ?', [username]);
}

// Return the full user row for an id, or undefined if not found.
export function getUserById(id) {
  return get('SELECT * FROM users WHERE id = ?', [id]);
}

// Verify a plaintext password against a stored user row.
// Recomputes scrypt(password, user.salt) and compares it to user.hash in
// constant time. Returns true/false.
export function verifyPassword(user, password) {
  const computed = crypto.scryptSync(password, user.salt, 32);
  const stored = Buffer.from(user.hash, 'hex');

  // Lengths must match for timingSafeEqual; if they differ the password is wrong.
  if (computed.length !== stored.length) return false;

  return crypto.timingSafeEqual(computed, stored);
}