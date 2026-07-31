import * as SQLite from 'expo-sqlite';
import {
  CREATE_TASKS_TABLE,
  CREATE_NOTES_TABLE,
  CREATE_POMODORO_TABLE,
  CREATE_USER_STATS_TABLE,
  CREATE_ACTIVITY_LOG_TABLE,
  SEED_USER_STATS,
  CREATE_FINANCIAL_TRANSACTIONS_TABLE,
  CREATE_BUDGET_SETTINGS_TABLE,
  SEED_BUDGET_SETTINGS,
} from './schema';

const DB_NAME = 'tasktracker.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    await initDatabase(dbInstance);
    return dbInstance;
  })();
  
  return initPromise;
}

async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(CREATE_TASKS_TABLE);
  await db.execAsync(CREATE_NOTES_TABLE);
  await db.execAsync(CREATE_POMODORO_TABLE);
  await db.execAsync(CREATE_USER_STATS_TABLE);
  await db.execAsync(CREATE_ACTIVITY_LOG_TABLE);
  await db.execAsync(CREATE_FINANCIAL_TRANSACTIONS_TABLE);
  await db.execAsync(CREATE_BUDGET_SETTINGS_TABLE);
  await db.execAsync(SEED_USER_STATS);
  await db.execAsync(SEED_BUDGET_SETTINGS);

  // Migration for existing tables
  try {
    await db.execAsync('ALTER TABLE tasks ADD COLUMN is_system INTEGER NOT NULL DEFAULT 0');
  } catch (e) {}

  try {
    await db.execAsync("ALTER TABLE tasks ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
    await db.execAsync("UPDATE tasks SET status = 'done' WHERE completed = 1 AND status = 'active'");
  } catch (e) {}
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DROP TABLE IF EXISTS tasks');
  await db.execAsync('DROP TABLE IF EXISTS notes');
  await db.execAsync('DROP TABLE IF EXISTS pomodoro_sessions');
  await db.execAsync('DROP TABLE IF EXISTS user_stats');
  await db.execAsync('DROP TABLE IF EXISTS activity_log');
  await db.execAsync('DROP TABLE IF EXISTS financial_transactions');
  await db.execAsync('DROP TABLE IF EXISTS budget_settings');
  await initDatabase(db);
}
