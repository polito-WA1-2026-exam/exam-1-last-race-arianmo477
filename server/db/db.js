import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Resolve an absolute path to the database file so the connection works
// regardless of the current working directory when the server is started.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'lastrace.sqlite');

// Open a single shared connection to the SQLite database.
// Every DAO imports this same handle, so there is one source of truth
// for the database and no scattered connection logic across the codebase.
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open the database:', err.message);
    throw err;
  }
});

// Enforce foreign key constraints (off by default in SQLite). This keeps
// referential integrity between games, users, stations and lines.
db.run('PRAGMA foreign_keys = ON;');

export default db;