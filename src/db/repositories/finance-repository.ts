import { getDatabase } from '../database';
import { FinancialTransaction, BudgetSettings, Task } from '../schema';
import { addXp, removeXp, logActivity, removeActivity } from './stats-repository';

export async function addTransaction(type: 'income' | 'expense', amount: number, category: string, note: string = '') {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO financial_transactions (type, amount, category, note) VALUES (?, ?, ?, ?)',
    type, amount, category, note
  );
}

export async function getTransactions(): Promise<FinancialTransaction[]> {
  const db = await getDatabase();
  return db.getAllAsync<FinancialTransaction>('SELECT * FROM financial_transactions ORDER BY created_at DESC LIMIT 50');
}

export async function getTodayExpenses(): Promise<number> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await db.getFirstAsync<{ total: number }>(
    "SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'expense' AND date(created_at) = ?",
    today
  );
  return result?.total || 0;
}

export async function getDailyLimit(): Promise<number> {
  const db = await getDatabase();
  const settings = await db.getFirstAsync<BudgetSettings>('SELECT * FROM budget_settings WHERE id = 1');
  return settings?.daily_limit || 50000;
}

export async function setDailyLimit(limit: number) {
  const db = await getDatabase();
  await db.runAsync('UPDATE budget_settings SET daily_limit = ?, updated_at = datetime("now") WHERE id = 1', limit);
  // Also update today's task title
  const today = new Date().toISOString().split('T')[0];
  await db.runAsync(
    "UPDATE tasks SET title = ? WHERE is_system = 1 AND date(created_at) = ?",
    `Keep spending under Rp ${limit.toLocaleString()}`,
    today
  );
}

export async function evaluateDailyBudgetQuest() {
  const db = await getDatabase();
  const limit = await getDailyLimit();
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Evaluate past uncompleted budget quests
  const pastQuests = await db.getAllAsync<Task>(
    "SELECT * FROM tasks WHERE is_system = 1 AND status = 'active' AND date(created_at) < ?",
    today
  );
  
  for (const quest of pastQuests) {
    const questDate = quest.created_at.split('T')[0];
    const expenseResult = await db.getFirstAsync<{ total: number }>(
      "SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'expense' AND date(created_at) = ?",
      questDate
    );
    const expenses = expenseResult?.total || 0;
    
    const isSuccess = expenses <= limit;
    const newStatus = isSuccess ? 'done' : 'failed';
    
    // Complete the task
    await db.runAsync("UPDATE tasks SET completed = 1, status = ?, completed_at = datetime('now') WHERE id = ?", newStatus, quest.id);
    
    if (isSuccess) {
      // Success
      await addXp(quest.xp, 'Discipline');
      await logActivity('task', quest.xp, 'Discipline');
    } else {
      // Failed (Penalty)
      await removeXp(quest.xp, 'Discipline');
      await removeActivity('task', quest.xp, 'Discipline');
    }
  }
  
  // 2. Ensure today's quest exists
  let todayQuest = await db.getFirstAsync<Task>(
    "SELECT * FROM tasks WHERE is_system = 1 AND date(created_at) = ?",
    today
  );
  
  if (!todayQuest) {
    await db.runAsync(
      "INSERT INTO tasks (title, category, recurrence, is_system, xp) VALUES (?, 'Discipline', 'daily', 1, 30)",
      `Keep spending under Rp ${limit.toLocaleString()}`
    );
    todayQuest = await db.getFirstAsync<Task>(
      "SELECT * FROM tasks WHERE is_system = 1 AND date(created_at) = ?",
      today
    );
  }

  // 3. Evaluate TODAY's quest immediately
  if (todayQuest) {
    const todayExpensesResult = await db.getFirstAsync<{ total: number }>(
      "SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'expense' AND date(created_at) = ?",
      today
    );
    const todayExpenses = todayExpensesResult?.total || 0;

    if (todayQuest.status === 'active' && todayExpenses > limit) {
      // Exceeded budget limit -> Mark today's quest as failed immediately & deduct EXP
      await db.runAsync(
        "UPDATE tasks SET completed = 1, status = 'failed', completed_at = datetime('now') WHERE id = ?",
        todayQuest.id
      );
      await removeXp(todayQuest.xp, 'Discipline');
      await removeActivity('task', todayQuest.xp, 'Discipline');
    } else if (todayQuest.status === 'failed' && todayExpenses <= limit) {
      // Restored budget limit -> Restore active status and restore EXP
      await db.runAsync(
        "UPDATE tasks SET completed = 0, status = 'active', completed_at = NULL WHERE id = ?",
        todayQuest.id
      );
      await addXp(todayQuest.xp, 'Discipline');
      await logActivity('task', todayQuest.xp, 'Discipline');
    }
  }
}
