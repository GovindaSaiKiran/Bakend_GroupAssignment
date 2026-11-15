const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

function getDbPath() {
  return process.env.DB_FILE || path.join(__dirname, 'booknook.db');
}

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    const dbPath = getDbPath();
    dbInstance = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
      } else {
        console.log(`Connected to SQLite database at: ${dbPath}`);
      }
    });

    dbInstance.run('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

function run(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function exec(sql) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await exec(schemaSql);

  // Safe initial seed: only if guests and games are empty
  const guestCount = await get('SELECT COUNT(*) as count FROM guests');
  if (guestCount && guestCount.count === 0) {
    await run('INSERT INTO guests (name) VALUES (?)', ['Rahul']);
    await run('INSERT INTO guests (name) VALUES (?)', ['Priya']);
    await run('INSERT INTO guests (name) VALUES (?)', ['Alex']);
    console.log('Sample guests seeded.');
  }

  const gameCount = await get('SELECT COUNT(*) as count FROM games');
  if (gameCount && gameCount.count === 0) {
    await run('INSERT INTO games (name, players) VALUES (?, ?)', ['Chess', 2]);
    await run('INSERT INTO games (name, players) VALUES (?, ?)', ['Catan', 4]);
    await run('INSERT INTO games (name, players) VALUES (?, ?)', ['Scrabble', 4]);
    await run('INSERT INTO games (name, players) VALUES (?, ?)', ['Pandemic', 4]);
    console.log('Sample games seeded.');
  }
}

function close() {
  return new Promise((resolve, reject) => {
    if (!dbInstance) return resolve();
    dbInstance.close((err) => {
      if (err) return reject(err);
      dbInstance = null;
      resolve();
    });
  });
}

module.exports = {
  getDb,
  run,
  get,
  all,
  exec,
  initDb,
  close
};
