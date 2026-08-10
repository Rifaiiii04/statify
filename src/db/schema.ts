export const CREATE_TASKS_TABLE = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Productivity',
    recurrence TEXT NOT NULL DEFAULT 'once',
    recurrence_days TEXT DEFAULT '[]',
    completed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    is_system INTEGER NOT NULL DEFAULT 0,
    parent_id INTEGER DEFAULT NULL,
    start_date TEXT DEFAULT NULL,
    deadline TEXT DEFAULT NULL,
    xp INTEGER NOT NULL DEFAULT 10,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );
`;

export const CREATE_NOTES_TABLE = `
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Creativity',
    executed INTEGER NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 20,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    executed_at TEXT
  );
`;

export const CREATE_POMODORO_TABLE = `
  CREATE TABLE IF NOT EXISTS pomodoro_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duration INTEGER NOT NULL DEFAULT 1500,
    completed INTEGER NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 15,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_USER_STATS_TABLE = `
  CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    physical_xp INTEGER NOT NULL DEFAULT 0,
    intelligence_xp INTEGER NOT NULL DEFAULT 0,
    creativity_xp INTEGER NOT NULL DEFAULT 0,
    discipline_xp INTEGER NOT NULL DEFAULT 0,
    social_xp INTEGER NOT NULL DEFAULT 0,
    productivity_xp INTEGER NOT NULL DEFAULT 0,
    username TEXT DEFAULT '',
    has_onboarded INTEGER DEFAULT 0
  );
`;

export const CREATE_ACTIVITY_LOG_TABLE = `
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'Productivity',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const SEED_USER_STATS = `
  INSERT OR IGNORE INTO user_stats (id, total_xp, level, physical_xp, intelligence_xp, creativity_xp, discipline_xp, social_xp, productivity_xp)
  VALUES (1, 0, 1, 0, 0, 0, 0, 0, 0);
`;

export const CREATE_FINANCIAL_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS financial_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, 
    amount INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_BUDGET_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS budget_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    daily_limit INTEGER NOT NULL DEFAULT 50000,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const SEED_BUDGET_SETTINGS = `
  INSERT OR IGNORE INTO budget_settings (id, daily_limit) VALUES (1, 50000);
`;


export type StatCategory = 'Physical' | 'Intelligence' | 'Creativity' | 'Discipline' | 'Social' | 'Productivity';

export const STAT_CATEGORIES: StatCategory[] = [
  'Physical',
  'Intelligence',
  'Creativity',
  'Discipline',
  'Social',
  'Productivity',
];

export type RecurrenceType = 'once' | 'daily' | 'specific_days';

export interface Task {
  id: number;
  title: string;
  category: StatCategory;
  recurrence: RecurrenceType;
  recurrence_days: string;
  completed: number;
  status: 'active' | 'done' | 'failed' | 'archived';
  is_system: number;
  parent_id: number | null;
  start_date: string | null;
  deadline: string | null;
  xp: number;
  created_at: string;
  completed_at: string | null;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: StatCategory;
  executed: number;
  xp: number;
  created_at: string;
  executed_at: string | null;
}

export interface PomodoroSession {
  id: number;
  duration: number;
  completed: number;
  xp: number;
  created_at: string;
}

export interface UserStats {
  id: number;
  total_xp: number;
  level: number;
  physical_xp: number;
  intelligence_xp: number;
  creativity_xp: number;
  discipline_xp: number;
  social_xp: number;
  productivity_xp: number;
  username: string;
  has_onboarded: number;
}

export interface ActivityLog {
  id: number;
  type: string;
  date: string;
  xp_earned: number;
  category: string;
  created_at: string;
}

export interface FinancialTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  created_at: string;
}

export interface BudgetSettings {
  id: number;
  daily_limit: number;
  created_at: string;
  updated_at: string;
}
