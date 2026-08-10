import { Task } from '@/db/schema';

export interface TaskActiveStatus {
  isActive: boolean;
  reason?: string;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getTaskActiveStatus(task: Task, targetDateStr?: string): TaskActiveStatus {
  const now = targetDateStr ? new Date(targetDateStr) : new Date();
  
  // Format today / target date as YYYY-MM-DD using local time
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // 1. Check Start Date (Schedule)
  if (task.start_date) {
    const startDateOnly = task.start_date.split('T')[0];
    if (dateStr < startDateOnly) {
      const parts = startDateOnly.split('-');
      const formattedDate = `${parseInt(parts[2], 10)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(parts[1], 10) - 1]}`;
      return {
        isActive: false,
        reason: `Starts ${formattedDate}`,
      };
    }
  }

  // 2. Check Deadline (Schedule)
  if (task.deadline) {
    const deadlineOnly = task.deadline.split('T')[0];
    if (dateStr > deadlineOnly && task.completed === 0) {
      return {
        isActive: false,
        reason: 'Expired (Past deadline)',
      };
    }
  }

  // 3. Check Recurrence Specific Days
  if (task.recurrence === 'specific_days' && task.recurrence_days) {
    try {
      const selectedDays: number[] = JSON.parse(task.recurrence_days || '[]');
      if (selectedDays.length > 0) {
        // JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        // Our RecurrencePicker index: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
        const dayOfWeek = (now.getDay() + 6) % 7;
        if (!selectedDays.includes(dayOfWeek)) {
          const activeDayNames = selectedDays.map(d => DAY_NAMES[d]).join(', ');
          return {
            isActive: false,
            reason: `Active on ${activeDayNames}`,
          };
        }
      }
    } catch {
      // Fallback if JSON parse fails
    }
  }

  return { isActive: true };
}
