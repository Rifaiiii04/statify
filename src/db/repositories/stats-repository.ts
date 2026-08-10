import { getDatabase } from '../database';
import { UserStats, ActivityLog, StatCategory } from '../schema';

const CATEGORY_COLUMN_MAP: Record<StatCategory, string> = {
  Physical: 'physical_xp',
  Intelligence: 'intelligence_xp',
  Creativity: 'creativity_xp',
  Discipline: 'discipline_xp',
  Social: 'social_xp',
  Productivity: 'productivity_xp',
};

export async function getUserStats(): Promise<UserStats> {
  const db = await getDatabase();
  const stats = await db.getFirstAsync<UserStats>('SELECT * FROM user_stats WHERE id = 1');
  if (!stats) {
    throw new Error('User stats not found');
  }
  return stats;
}

export async function completeOnboarding(username: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE user_stats SET username = ?, has_onboarded = 1 WHERE id = 1', username);
}

function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpNeeded = 100;
  let accumulated = 0;
  while (accumulated + xpNeeded <= totalXp) {
    accumulated += xpNeeded;
    level++;
    xpNeeded = level * 100;
  }
  return level;
}

export function getXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += i * 100;
  }
  return total;
}

export function getXpToNextLevel(level: number): number {
  return level * 100;
}

export async function addXp(amount: number, category: StatCategory): Promise<UserStats> {
  const db = await getDatabase();
  const column = CATEGORY_COLUMN_MAP[category];

  await db.runAsync(
    `UPDATE user_stats SET total_xp = total_xp + ?, ${column} = ${column} + ? WHERE id = 1`,
    amount,
    amount,
  );

  const stats = await getUserStats();
  const newLevel = calculateLevel(stats.total_xp);

  if (newLevel !== stats.level) {
    await db.runAsync('UPDATE user_stats SET level = ? WHERE id = 1', newLevel);
    stats.level = newLevel;
  }

  return stats;
}

export async function removeXp(amount: number, category: StatCategory): Promise<UserStats> {
  const db = await getDatabase();
  const column = CATEGORY_COLUMN_MAP[category];

  await db.runAsync(
    `UPDATE user_stats SET total_xp = MAX(0, total_xp - ?), ${column} = MAX(0, ${column} - ?) WHERE id = 1`,
    amount,
    amount,
  );

  const stats = await getUserStats();
  const newLevel = calculateLevel(stats.total_xp);

  if (newLevel !== stats.level) {
    await db.runAsync('UPDATE user_stats SET level = ? WHERE id = 1', newLevel);
    stats.level = newLevel;
  }

  return stats;
}

export async function logActivity(
  type: 'task' | 'note' | 'pomodoro',
  xpEarned: number,
  category: StatCategory,
): Promise<void> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  await db.runAsync(
    'INSERT INTO activity_log (type, date, xp_earned, category) VALUES (?, ?, ?, ?)',
    type,
    today,
    xpEarned,
    category,
  );
}

export async function removeActivity(
  type: 'task' | 'note' | 'pomodoro',
  xpEarned: number,
  category: StatCategory,
): Promise<void> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  await db.runAsync(
    'DELETE FROM activity_log WHERE id IN (SELECT id FROM activity_log WHERE type = ? AND date = ? AND xp_earned = ? AND category = ? LIMIT 1)',
    type,
    today,
    xpEarned,
    category,
  );
}

export async function getActivityHeatmap(days: number = 365): Promise<Record<string, number>> {
  const db = await getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  const rows = await db.getAllAsync<{ date: string; total_xp: number }>(
    'SELECT date, SUM(xp_earned) as total_xp FROM activity_log WHERE date >= ? GROUP BY date ORDER BY date',
    startStr,
  );

  const heatmap: Record<string, number> = {};
  for (const row of rows) {
    heatmap[row.date] = row.total_xp;
  }
  return heatmap;
}

export async function getStreak(): Promise<number> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM activity_log ORDER BY date DESC',
  );

  if (rows.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < rows.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = expectedDate.toISOString().split('T')[0];

    if (rows[i].date === expectedStr) {
      streak++;
    } else if (i === 0) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (rows[i].date === yesterday.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
}

export async function getTotalCompletedTasks(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM tasks WHERE completed = 1',
  );
  return result?.count ?? 0;
}

export async function getTotalExecutedNotes(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM notes WHERE executed = 1',
  );
  return result?.count ?? 0;
}
