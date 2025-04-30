import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
console.log('Database path:', dbPath);

// Create a new database instance
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating forms table:', err);
      } else {
        console.log('Forms table created');
      }
    });
    
    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        form_id INTEGER,
        text TEXT NOT NULL,
        type TEXT NOT NULL,
        required BOOLEAN DEFAULT false,
        FOREIGN KEY (form_id) REFERENCES forms(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating questions table:', err);
      } else {
        console.log('Questions table created');
      }
    });
  }
});

// Promisify the database methods
export const run = (sql: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    console.log('Running SQL:', sql, 'with params:', params);
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Error running query:', err);
        reject(err);
      } else {
        console.log('Query successful, lastID:', this.lastID);
        resolve(this);
      }
    });
  });
};

export const get = (sql: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    console.log('Getting row with SQL:', sql, 'and params:', params);
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Error getting row:', err);
        reject(err);
      } else {
        console.log('Got row:', row);
        resolve(row);
      }
    });
  });
};

export const all = (sql: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    console.log('Getting all rows with SQL:', sql, 'and params:', params);
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Error getting rows:', err);
        reject(err);
      } else {
        console.log('Got rows:', rows);
        resolve(rows);
      }
    });
  });
}; 