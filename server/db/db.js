import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'lastrace.sqlite');


const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open the database:', err.message);
    throw err;
  }
});


db.run('PRAGMA foreign_keys = ON;');

export default db;