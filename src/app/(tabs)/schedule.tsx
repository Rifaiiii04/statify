import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  CalendarDays, CheckCircle2, Circle, Clock,
  Dumbbell, Brain, Palette, Shield, Users, Rocket, ChevronRight,
} from 'lucide-react-native';
import { Spacing, Typography, Radius, CATEGORY_COLORS, ClayShadow, GanttColors } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { Task, StatCategory } from '@/db/schema';
import { getScheduledTasks, getActiveTasks, toggleTask } from '@/db/repositories/task-repository';
import { addXp, removeXp, logActivity, removeActivity } from '@/db/repositories/stats-repository';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  Physical: Dumbbell,
  Intelligence: Brain,
  Creativity: Palette,
  Discipline: Shield,
  Social: Users,
  Productivity: Rocket,
};

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekDates(): { label: string; date: string; dayOfWeek: number }[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push({
      label: DAY_LABELS[i],
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayOfWeek: i,
    });
  }
  return dates;
}

function formatDateHeader(dateStr: string): { day: number; weekday: string; monthYear: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    day: d.getDate(),
    weekday: weekdays[d.getDay()].slice(0, 3),
    monthYear: `${months[d.getMonth()]} ${d.getFullYear()}`,
  };
}

function getTaskColor(task: Task): string {
  return GanttColors[task.id % GanttColors.length];
}

function getOverdueDays(task: Task, todayStr: string): number {
  if (task.recurrence !== 'once') return 0;
  if (task.start_date || task.deadline) return 0;
  if (task.status !== 'active') return 0;
  
  const createdDate = task.created_at.split('T')[0];
  if (createdDate >= todayStr) return 0;
  
  const t = new Date(todayStr);
  const c = new Date(createdDate);
  const diffTime = Math.abs(t.getTime() - c.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export default function ScheduleScreen() {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const today = getTodayString();
  const headerInfo = formatDateHeader(today);
  const weekDates = getWeekDates();

  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [allActiveTasks, setAllActiveTasks] = useState<Task[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);

  const loadData = useCallback(async () => {
    // Gantt chart tasks
    const allDeadlineTasks = await getScheduledTasks();
    setWeekTasks(allDeadlineTasks);
    
    // Today Plans logic
    const activeTasks = await getActiveTasks();
    const todayDateObj = new Date(today);
    const todayDayOfWeek = todayDateObj.getDay();

    const tTasks = activeTasks.filter(t => {
      // Ignore subtasks here if needed, or include them? Usually we don't show subtasks at root level
      if (t.parent_id) return false;

      // 1. Calendar tasks
      if (t.start_date || t.deadline) {
        const startStr = (t.start_date || t.created_at).split('T')[0];
        const endStr = (t.deadline || startStr).split('T')[0];
        return today >= startStr && today <= endStr;
      }
      
      // 2. No calendar tasks, use recurrence
      if (t.recurrence === 'daily') return true;
      if (t.recurrence === 'once') return true; // Always show until done, calculate overdue
      if (t.recurrence === 'specific_days') {
        try {
          const days = JSON.parse(t.recurrence_days || '[]');
          return days.includes(todayDayOfWeek);
        } catch { return false; }
      }
      return false;
    });
    
    setAllActiveTasks(activeTasks);
    setTodayTasks(tTasks);
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Map tasks to gantt rows (only tasks that fall within this week)
  const weekStart = weekDates[0].date;
  const weekEnd = weekDates[6].date;

  const ganttTasks = weekTasks.filter(t => {
    if (!t.deadline && !t.start_date) return false;
    const startStr = (t.start_date || t.created_at).split('T')[0];
    const endStr = (t.deadline || startStr).split('T')[0];
    return endStr >= weekStart && startStr <= weekEnd;
  });

  const renderGanttRow = (task: Task) => {
    const taskColor = getTaskColor(task);
    const startStr = (task.start_date || task.created_at).split('T')[0];
    const endStr = (task.deadline || startStr).split('T')[0];
    
    // Find column indexes
    let startIndex = weekDates.findIndex(wd => wd.date === startStr);
    let endIndex = weekDates.findIndex(wd => wd.date === endStr);

    // If starts before this week, clamp to start of week
    if (startIndex === -1 && startStr < weekStart) startIndex = 0;
    // If ends after this week, clamp to end of week
    if (endIndex === -1 && endStr > weekEnd) endIndex = 6;
    
    if (startIndex === -1 || endIndex === -1) return null;

    const barStart = startIndex;
    const barEnd = endIndex;
    const barWidth = ((barEnd - barStart + 1) / 7) * 100;
    const barLeft = (barStart / 7) * 100;

    const cat = task.category.split(',')[0];
    const label = task.title.length > 12 ? task.title.slice(0, 12) + '…' : task.title;

    return (
      <View key={task.id} style={styles.ganttRow}>
        <View
          style={[
            styles.ganttBar,
            {
              backgroundColor: taskColor,
              left: `${barLeft}%`,
              width: `${Math.max(barWidth, 14.28)}%`,
              borderWidth: 1,
              borderColor: '#000',
            },
          ]}
        >
          <Text style={styles.ganttBarText} numberOfLines={1}>{label}</Text>
        </View>
      </View>
    );
  };

  const renderTodayTask = ({ item }: { item: Task }) => {
    const categories = item.category.split(',') as StatCategory[];
    const mainCat = categories[0] || 'Productivity';
    const CatIcon = CATEGORY_ICON_MAP[mainCat] || Rocket;
    const catColor = CATEGORY_COLORS[mainCat] || colors.accent;
    const isCompleted = item.completed === 1;
    const overdueDays = getOverdueDays(item, today);
    const effectiveXp = Math.max(1, item.xp - overdueDays);

    const scheduleTime = (() => {
      if (!item.start_date && !item.deadline) return '';
      const formatDt = (dStr: string) => {
        const d = new Date(dStr);
        return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`;
      };
      if (item.start_date && item.deadline) return `${formatDt(item.start_date)} - ${formatDt(item.deadline)}`;
      if (item.deadline) return `Due ${formatDt(item.deadline)}`;
      if (item.start_date) return formatDt(item.start_date);
      return '';
    })();

    const toggleExpand = (id: number) => {
      setExpandedTasks(prev => 
        prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
      );
    };

    const handleToggle = async () => {
      if (item.is_system) {
        Alert.alert('System Quest', 'This is an automatic daily quest. Edit your budget in the Money tab.');
        return;
      }
      try {
        const result = await toggleTask(item.id, item.completed);
        const cats = result.category.split(',') as StatCategory[];
        if (result.completed) {
          for (const cat of cats) {
            await addXp(result.xp, cat);
            await logActivity('task', result.xp, cat);
          }
        } else {
          for (const cat of cats) {
            await removeXp(result.xp, cat);
            await removeActivity('task', result.xp, cat);
          }
        }
        loadData();
      } catch (e: any) {
        Alert.alert('Error', 'Failed to toggle task.');
      }
    };

    return (
      <Animated.View 
        entering={FadeIn} 
        exiting={FadeOut} 
        layout={LinearTransition.springify()}
      >
        <View style={[
          styles.todayCard, 
          ClayShadow.card, 
          item.parent_id ? { marginLeft: 32, padding: 12 } : {},
          isCompleted && { opacity: 0.5 }, 
          overdueDays > 0 && !isCompleted && { backgroundColor: colors.coralSoft }
        ]}>
          <TouchableOpacity 
            style={styles.checkCol}
            onPress={handleToggle}
            disabled={isCompleted || item.status === 'done'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isCompleted ? (
              <CheckCircle2 color={colors.mint} size={22} />
            ) : (
              <Circle color={overdueDays > 0 ? colors.coral : colors.textMuted} size={22} />
            )}
          </TouchableOpacity>
          <View style={styles.todayInfo}>
            <Text
              style={[
                styles.todayTitle,
                { color: colors.textPrimary },
                isCompleted && { textDecorationLine: 'line-through', color: colors.textSecondary },
                overdueDays > 0 && !isCompleted && { color: colors.coral }
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <View style={styles.todayMeta}>
              {scheduleTime ? (
                <View style={styles.todayMetaItem}>
                  <CalendarDays color={colors.textMuted} size={11} />
                  <Text style={[styles.todayMetaText, { color: colors.textMuted }]}>{scheduleTime}</Text>
                </View>
              ) : null}
              {overdueDays > 0 && !isCompleted && (
                <View style={[styles.todayBadge, { backgroundColor: colors.coral + '22' }]}>
                  <Text style={[styles.todayBadgeText, { color: colors.coral }]}>{overdueDays} days overdue</Text>
                </View>
              )}
              <Text style={[styles.xpText, { color: colors.accent }]}>+{effectiveXp * categories.length} XP</Text>
              {categories.map(cat => (
                <View key={cat} style={[styles.todayBadge, { backgroundColor: (CATEGORY_COLORS[cat] || colors.accent) + '18' }]}>
                  <Text style={[styles.todayBadgeText, { color: CATEGORY_COLORS[cat] || colors.accent }]}>{cat}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {!item.parent_id && allActiveTasks.some(t => t.parent_id === item.id) && (
          <TouchableOpacity 
            onPress={() => toggleExpand(item.id)} 
            style={{ flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.md, marginBottom: Spacing.sm }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginRight: 4 }}>
              {expandedTasks.includes(item.id) ? 'Hide subtasks' : 'Show subtasks'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const displayedTodayTasks = todayTasks.reduce((acc: Task[], parent) => {
    acc.push(parent);
    if (expandedTasks.includes(parent.id)) {
      const subtasks = allActiveTasks.filter(t => t.parent_id === parent.id);
      acc.push(...subtasks);
    }
    return acc;
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 24) + 16 }}>

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <View>
            <Text style={[styles.dateDay, { color: colors.textPrimary }]}>{headerInfo.day}</Text>
            <Text style={[styles.dateWeekday, { color: colors.accent }]}>{headerInfo.weekday}</Text>
          </View>
          <Text style={[styles.dateMonthYear, { color: colors.textSecondary }]}>
            {headerInfo.monthYear}
          </Text>
        </View>

        {/* Your Plans - Gantt Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Your plans</Text>
            <View style={[styles.weekBadge, ClayShadow.soft, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.weekBadgeText, { color: colors.accent }]}>This week</Text>
            </View>
          </View>

          <View style={[styles.ganttContainer, ClayShadow.card]}>
            {/* Gantt Rows */}
            {ganttTasks.length > 0 ? (
              <View style={styles.ganttBody}>
                {ganttTasks.map(renderGanttRow)}
              </View>
            ) : (
              <View style={styles.ganttEmpty}>
                <Text style={[styles.ganttEmptyText, { color: colors.textMuted }]}>
                  No tasks with deadlines this week
                </Text>
              </View>
            )}

            {/* Week Day Labels */}
            <View style={styles.ganttDayRow}>
              {weekDates.map(wd => {
                const isToday = wd.date === today;
                return (
                  <View
                    key={wd.date}
                    style={[
                      styles.ganttDayCell,
                      isToday && { backgroundColor: colors.accent, borderRadius: 4, borderWidth: 1, borderColor: '#000' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ganttDayText,
                        { color: colors.textMuted },
                        isToday && { color: colors.white },
                      ]}
                    >
                      {wd.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Motivational Banner */}
        {todayTasks.length > 0 && todayTasks.every(t => t.completed) && (
          <View style={[styles.banner, ClayShadow.card, { backgroundColor: colors.mintSoft }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>
                You are doing great!
              </Text>
              <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
                You have completed all daily plans
              </Text>
            </View>
            <View style={[styles.bannerArrow, { backgroundColor: colors.amber }]}>
              <ChevronRight color={colors.white} size={20} />
            </View>
          </View>
        )}

        {/* Today Plans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Today plans</Text>
            <Text style={[styles.seeAll, { color: colors.accent }]}>
              {todayTasks.length} tasks
            </Text>
          </View>

          {displayedTodayTasks.length > 0 ? (
            displayedTodayTasks.map(task => (
              <View key={task.id}>{renderTodayTask({ item: task })}</View>
            ))
          ) : (
            <View style={[styles.emptyState, ClayShadow.soft]}>
              <CalendarDays color={colors.textMuted} size={36} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No tasks scheduled for today.{'\n'}Add a deadline to your tasks!
              </Text>
            </View>
          )}
        </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  scroll: { paddingBottom: 100 },

  // Date Header
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  dateDay: { ...Typography.displayLarge, fontSize: 40, lineHeight: 44 },
  dateWeekday: { ...Typography.titleMedium },
  dateMonthYear: { ...Typography.body, marginTop: 4 },

  // Section
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.titleLarge },
  weekBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.md,
  },
  weekBadgeText: { ...Typography.caption },
  seeAll: { ...Typography.bodySmall },

  // Gantt
  ganttContainer: {
    padding: Spacing.md,
    overflow: 'hidden',
  },
  xpText: {
    ...Typography.caption,
  },
  ganttBody: {
    minHeight: 48,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  ganttRow: {
    height: 28,
    position: 'relative',
  },
  ganttBar: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderRadius: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  ganttBarText: {
    ...Typography.caption,
    color: '#FFFFFF',
  },
  ganttEmpty: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  ganttEmptyText: { ...Typography.body, textAlign: 'center' },
  ganttDayRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: Spacing.xs,
  },
  ganttDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 3,
  },
  ganttDayText: {
    ...Typography.caption,
  },

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bannerTitle: { ...Typography.titleMedium, marginBottom: 2 },
  bannerSub: { ...Typography.bodySmall },
  bannerArrow: {
    width: 34,
    height: 34,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkCol: {
    marginRight: 10,
    paddingTop: 2,
  },
  todayInfo: { flex: 1 },
  todayTitle: { ...Typography.body, marginBottom: 3 },
  todayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  todayMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  todayMetaText: { ...Typography.caption },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  todayBadgeText: { ...Typography.caption },

  // Empty
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.lg,
  },
  emptyText: { ...Typography.body, textAlign: 'center' },
});
