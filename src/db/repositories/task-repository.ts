import { getDatabase } from '../database';
import { Task, StatCategory, RecurrenceType } from '../schema';

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDatabase();
  return db.getAllAsync<Task>("SELECT * FROM tasks ORDER BY CASE WHEN status = 'active' THEN 0 WHEN status = 'failed' THEN 1 WHEN status = 'done' THEN 2 ELSE 3 END, created_at DESC");
}

export async function getActiveTasks(): Promise<Task[]> {
  const db = await getDatabase();
  return db.getAllAsync<Task>("SELECT * FROM tasks WHERE status = 'active' ORDER BY created_at DESC");
}

export async function getCompletedTasks(): Promise<Task[]> {
  const db = await getDatabase();
  return db.getAllAsync<Task>("SELECT * FROM tasks WHERE status = 'done' ORDER BY completed_at DESC");
}

export async function createTask(
  title: string,
  category: StatCategory,
  recurrence: RecurrenceType,
  recurrenceDays: number[] = [],
  parentId: number | null = null,
  startDate: string | null = null,
  deadline: string | null = null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO tasks (title, category, recurrence, recurrence_days, parent_id, start_date, deadline, xp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    title,
    category,
    recurrence,
    JSON.stringify(recurrenceDays),
    parentId,
    startDate,
    deadline,
    10,
  );
}

export async function toggleTask(id: number, currentCompleted: number): Promise<{ completed: boolean; xp: number; category: StatCategory }> {
  const db = await getDatabase();
  const task = await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', id);
  if (!task) throw new Error('Task not found');

  const newCompleted = currentCompleted ? 0 : 1;
  const completedAt = newCompleted ? new Date().toISOString() : null;
  let newStatus = newCompleted ? 'done' : 'active';

  if (task.parent_id) {
    newStatus = 'active'; // Subtasks stay active until parent is completed
  } else {
    if (newCompleted) {
      const uncompleted = await db.getFirstAsync<{count: number}>("SELECT count(*) as count FROM tasks WHERE parent_id = ? AND completed = 0 AND status != 'archived'", id);
      if (uncompleted && uncompleted.count > 0) {
        throw new Error('SUBTASKS_NOT_DONE');
      }
      // Set all active children to done
      await db.runAsync("UPDATE tasks SET status = 'done', completed_at = ? WHERE parent_id = ? AND status = 'active'", completedAt, id);
    }
  }

  await db.runAsync(
    'UPDATE tasks SET completed = ?, status = ?, completed_at = ? WHERE id = ?',
    newCompleted,
    newStatus,
    completedAt,
    id,
  );

  return { completed: !!newCompleted, xp: task.xp, category: task.category as StatCategory };
}

export async function archiveTask(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE tasks SET status = 'archived', completed_at = datetime('now') WHERE id = ? OR parent_id = ?", id, id);
}

export async function cleanUpArchivedTasks(): Promise<void> {
  const db = await getDatabase();
  // Delete archived tasks that were archived more than 7 days ago
  await db.runAsync("DELETE FROM tasks WHERE status = 'archived' AND date(completed_at) <= date('now', '-7 days')");
}

export async function deleteTask(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

export async function getTodayTaskCount(): Promise<{ total: number; completed: number }> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const total = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM tasks WHERE date(created_at) = ?",
    today,
  );
  const completed = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM tasks WHERE status = 'done' AND date(completed_at) = ?",
    today,
  );
  return {
    total: total?.count ?? 0,
    completed: completed?.count ?? 0,
  };
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  const db = await getDatabase();
  return db.getAllAsync<Task>(
    "SELECT * FROM tasks WHERE (date(deadline) = ? OR date(start_date) = ?) AND parent_id IS NULL ORDER BY status ASC, created_at DESC",
    date, date
  );
}

export async function getScheduledTasks(): Promise<Task[]> {
  const db = await getDatabase();
  return db.getAllAsync<Task>(
    "SELECT * FROM tasks WHERE (deadline IS NOT NULL OR start_date IS NOT NULL) AND parent_id IS NULL AND status = 'active' ORDER BY COALESCE(start_date, deadline) ASC",
  );
}
