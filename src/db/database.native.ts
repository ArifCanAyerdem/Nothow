import * as SQLite from 'expo-sqlite';

const DB_NAME = 'nothow_vault.db';

/**
 * Returns an instance of the SQLite database.
 */
export const getDB = async () => {
  return await SQLite.openDatabaseAsync(DB_NAME);
};

/**
 * Initializes the database tables if they do not exist.
 */
export const initDB = async () => {
  try {
    const db = await getDB();
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS vault_items (
        id TEXT PRIMARY KEY NOT NULL,
        isDecoy INTEGER DEFAULT 0,
        payload TEXT NOT NULL
      );
    `);
    
    console.log('Database initialized.');
  } catch (e) {
    console.error('Database initialization failed:', e);
  }
};

/**
 * Drops all tables and resets the database. Used for Panic Wipe.
 */
export const resetDB = async () => {
  try {
    const db = await getDB();
    await db.execAsync(`
      DROP TABLE IF EXISTS vault_items;
    `);
    await initDB();
    console.log('Database reset successfully.');
  } catch (e) {
    console.error('Database reset failed:', e);
  }
};
