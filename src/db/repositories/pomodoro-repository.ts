import { getDatabase } from '../database';
import { PomodoroSession } from '../schema';

export async function getAllSessions(): Promise<PomodoroSession[]> {
  const db = await getDatabase();
  return db.getAllAsync<PomodoroSession>('SELECT * FROM pomodoro_sessions ORDER BY created_at DESC');
}

export async function createSession(duration: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO pomodoro_sessions (duration, completed, xp) VALUES (?, 1, ?)',
    duration,
    15,
  );
}

export async function getTodaySessionCount(): Promise<number> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM pomodoro_sessions WHERE date(created_at) = ?",
    today,
  );
  return result?.count ?? 0;
}

export async function getTotalSessionCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM pomodoro_sessions',
  );
  return result?.count ?? 0;
}
