import { getDatabase } from '../database';
import { Note, StatCategory } from '../schema';

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDatabase();
  return db.getAllAsync<Note>('SELECT * FROM notes ORDER BY executed ASC, created_at DESC');
}

export async function getActiveNotes(): Promise<Note[]> {
  const db = await getDatabase();
  return db.getAllAsync<Note>('SELECT * FROM notes WHERE executed = 0 ORDER BY created_at DESC');
}

export async function getExecutedNotes(): Promise<Note[]> {
  const db = await getDatabase();
  return db.getAllAsync<Note>('SELECT * FROM notes WHERE executed = 1 ORDER BY executed_at DESC');
}

export async function createNote(
  title: string,
  content: string,
  category: StatCategory,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO notes (title, content, category, xp) VALUES (?, ?, ?, ?)',
    title,
    content,
    category,
    20,
  );
}

export async function executeNote(id: number): Promise<{ xp: number; category: StatCategory }> {
  const db = await getDatabase();
  const note = await db.getFirstAsync<Note>('SELECT * FROM notes WHERE id = ?', id);
  if (!note) throw new Error('Note not found');

  await db.runAsync(
    'UPDATE notes SET executed = 1, executed_at = ? WHERE id = ?',
    new Date().toISOString(),
    id,
  );

  return { xp: note.xp, category: note.category as StatCategory };
}

export async function unexecuteNote(id: number): Promise<{ xp: number; category: StatCategory }> {
  const db = await getDatabase();
  const note = await db.getFirstAsync<Note>('SELECT * FROM notes WHERE id = ?', id);
  if (!note) throw new Error('Note not found');

  await db.runAsync(
    'UPDATE notes SET executed = 0, executed_at = NULL WHERE id = ?',
    id,
  );

  return { xp: note.xp, category: note.category as StatCategory };
}

export async function deleteNote(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notes WHERE id = ?', id);
}
