import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  FlatList, TouchableOpacity, Alert, Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Plus, CheckCircle2, Circle, Trash2, XCircle, Archive,
  Dumbbell, Brain, Palette, Shield, Users, Rocket,
  Repeat, CalendarDays, RotateCcw, Settings, Lightbulb, CornerDownRight, ChevronDown, ChevronRight
} from 'lucide-react-native';
import { Spacing, Typography, Radius, CATEGORY_COLORS, ClayShadow } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { Task, StatCategory, RecurrenceType } from '@/db/schema';
import { getAllTasks, createTask, toggleTask, deleteTask, archiveTask } from '@/db/repositories/task-repository';
import { addXp, removeXp, logActivity, removeActivity } from '@/db/repositories/stats-repository';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { CategoryPicker } from '@/components/ui/CategoryPicker';
import { RecurrencePicker } from '@/components/ui/RecurrencePicker';
import { DatePicker } from '@/components/ui/DatePicker';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  Physical: Dumbbell,
  Intelligence: Brain,
  Creativity: Palette,
  Discipline: Shield,
  Social: Users,
  Productivity: Rocket,
};

const RECURRENCE_ICON_MAP: Record<string, React.ComponentType<any>> = {
  once: RotateCcw,
  daily: Repeat,
  specific_days: CalendarDays,
};

type FilterTab = 'active' | 'done' | 'failed' | 'archived';

export default function TasksScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterTab>('active');
  const [showSheet, setShowSheet] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategories, setNewCategories] = useState<StatCategory[]>(['Productivity']);
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceType>('once');
  const [newDays, setNewDays] = useState<number[]>([]);
  const [parentTaskId, setParentTaskId] = useState<number | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
  const [newStartDate, setNewStartDate] = useState<string | null>(null);
  const [newDeadline, setNewDeadline] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    const result = await getAllTasks();
    setTasks(result);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleCreateTask = async () => {
    if (!newTitle.trim() || newCategories.length === 0) return;
    await createTask(newTitle.trim(), newCategories.join(',') as StatCategory, newRecurrence, newDays, parentTaskId, newStartDate, newDeadline);
    setNewTitle('');
    setNewCategories(['Productivity']);
    setNewRecurrence('once');
    setNewDays([]);
    setParentTaskId(null);
    setNewStartDate(null);
    setNewDeadline(null);
    setShowSheet(false);
    loadTasks();
  };

  const handleAddSubtask = (parentTask: Task) => {
    setParentTaskId(parentTask.id);
    
    // Reset defaults first
    setNewRecurrence('once');
    setNewDays([]);
    setNewStartDate(null);
    setNewDeadline(null);

    if (parentTask.start_date || parentTask.deadline) {
      setNewStartDate(parentTask.start_date);
      setNewDeadline(parentTask.deadline);
    } else if (parentTask.recurrence === 'once') {
      setNewRecurrence('once');
    } else if (parentTask.recurrence === 'specific_days') {
      setNewRecurrence('specific_days');
      setNewDays(JSON.parse(parentTask.recurrence_days || '[]'));
    }
    
    setShowSheet(true);
  };

  const handleToggle = async (task: Task) => {
    if (task.is_system) {
      Alert.alert('System Quest', 'This is an automatic daily quest. Edit your budget in the Money tab.');
      return;
    }
    
    try {
      const result = await toggleTask(task.id, task.completed);
      const categories = result.category.split(',') as StatCategory[];
      
      if (result.completed) {
        for (const cat of categories) {
          await addXp(result.xp, cat);
          await logActivity('task', result.xp, cat);
        }
      } else {
        for (const cat of categories) {
          await removeXp(result.xp, cat);
          await removeActivity('task', result.xp, cat);
        }
      }
      loadTasks();
    } catch (e: any) {
      if (e.message === 'SUBTASKS_NOT_DONE') {
        Alert.alert('Subtasks Active', 'Complete all subtasks before marking this task as done.');
      } else {
        Alert.alert('Error', 'Failed to update task.');
      }
    }
  };

  const handleLongPress = (task: Task) => {
    if (task.is_system) {
      Alert.alert('System Quest', 'This system quest cannot be modified manually.');
      return;
    }
    
    Alert.alert('Task Options', `Manage "${task.title}"`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: async () => {
          await archiveTask(task.id);
          loadTasks();
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (task.status === 'done') {
            const categories = task.category.split(',') as StatCategory[];
            for (const cat of categories) {
              await removeXp(task.xp, cat);
              await removeActivity('task', task.xp, cat);
            }
          }
          await deleteTask(task.id);
          loadTasks();
        },
      }]);
  };

  const activeCount = tasks.filter(t => t.status === 'active' && !t.parent_id).length;
  const doneCount = tasks.filter(t => t.status === 'done' && !t.parent_id).length;
  const failedCount = tasks.filter(t => t.status === 'failed' && !t.parent_id).length;
  const archivedCount = tasks.filter(t => t.status === 'archived' && !t.parent_id).length;
  const totalCount = activeCount + doneCount;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  
  const displayedTasks: Task[] = [];
  const matchingParents = tasks.filter(t => !t.parent_id && t.status === filter);
  
  matchingParents.forEach(parent => {
    displayedTasks.push(parent);
    if (expandedTasks.includes(parent.id)) {
      const children = tasks.filter(t => t.parent_id === parent.id && t.status === filter);
      displayedTasks.push(...children);
    }
  });
  
  const orphanChildren = tasks.filter(t => t.parent_id && t.status === filter && !matchingParents.some(p => p.id === t.parent_id));
  displayedTasks.push(...orphanChildren);

  const toggleExpand = (id: number) => {
    setExpandedTasks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const FILTER_CONFIGS = [
    { key: 'active' as FilterTab, label: 'Active', count: activeCount, color: colors.accent },
    { key: 'done' as FilterTab, label: 'Done', count: doneCount, color: colors.mint },
    { key: 'failed' as FilterTab, label: 'Fail', count: failedCount, color: colors.coral },
    { key: 'archived' as FilterTab, label: 'Archive', count: archivedCount, color: colors.purple }];

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>Tasks</Text>
          <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
            {doneCount}/{totalCount} completed
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={[styles.addBtn, ClayShadow.soft, { backgroundColor: colors.surfaceHigh }]}
            onPress={() => router.push('/notes' as any)}
            activeOpacity={0.75}
          >
            <Lightbulb color={colors.textSecondary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, ClayShadow.soft, { backgroundColor: colors.surfaceHigh }]}
            onPress={() => router.push('/settings')}
            activeOpacity={0.75}
          >
            <Settings color={colors.textSecondary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, ClayShadow.button, { backgroundColor: colors.accent }]}
            onPress={() => setShowSheet(true)}
            activeOpacity={0.75}
          >
            <Plus color={colors.white} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.progressBarContainer, ClayShadow.soft]}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: colors.accent }]} />
      </View>
      
      <View style={styles.filterRow}>
        {FILTER_CONFIGS.map(({ key, label, count, color }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterTab,
              ClayShadow.soft, filter === key && { backgroundColor: color + '18', shadowColor: color }]}
            onPress={() => setFilter(key)}
          >
            <Text style={[styles.filterText, { color: filter === key ? color : colors.textSecondary }]}>
              {label} ({count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {displayedTasks.length === 0 && (
        <View style={[styles.emptyState, ClayShadow.soft]}>
          <LayoutDashboardIcon color={colors.textMuted} size={36} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {filter === 'active' ? 'No active tasks. Tap + to add one.' : 
             filter === 'done' ? 'No completed tasks yet.' :
             filter === 'failed' ? 'No failed tasks.' : 'No archived tasks.'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderTask = ({ item }: { item: Task }) => {
    const categories = item.category.split(',') as StatCategory[];
    const isCompleted = item.completed === 1;
    const isFailed = item.status === 'failed';
    const isArchived = item.status === 'archived';
    
    let overdueDays = 0;
    if (item.recurrence === 'once' && !item.start_date && !item.deadline && item.status === 'active') {
      const todayStr = new Date().toISOString().split('T')[0];
      const createdStr = item.created_at.split('T')[0];
      if (todayStr > createdStr) {
        const t = new Date(todayStr);
        const c = new Date(createdStr);
        overdueDays = Math.floor(Math.abs(t.getTime() - c.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    const effectiveXp = Math.max(1, item.xp - overdueDays);

    const isSubtask = !!item.parent_id;
    let isLastChild = false;
    if (isSubtask) {
      const siblings = displayedTasks.filter(t => t.parent_id === item.parent_id);
      const myIndex = siblings.findIndex(t => t.id === item.id);
      isLastChild = myIndex === siblings.length - 1;
    }

    const handleSwipeArchive = () => {
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Archive Task\n\nAre you sure you want to archive this task? Subtasks will also be archived.');
        if (confirmed) {
          archiveTask(item.id).then(() => loadTasks());
        }
        return;
      }

      Alert.alert(
        'Archive Task',
        'Are you sure you want to archive this task? Subtasks will also be archived.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Archive', 
            style: 'destructive',
            onPress: async () => {
              await archiveTask(item.id);
              loadTasks();
            }
          }
        ]
      );
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      if (item.status === 'archived' || item.status === 'done' || isCompleted) return null;

      const trans = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [0, 80],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View style={{ transform: [{ translateX: trans }], paddingBottom: 24, paddingRight: 24, paddingLeft: 8 }}>
          <TouchableOpacity
            style={[styles.archiveAction, ClayShadow.soft, { backgroundColor: colors.purple }]}
            onPress={handleSwipeArchive}
            activeOpacity={0.7}
          >
            <Archive color={colors.white} size={24} />
            <Text style={[styles.archiveActionText, { color: colors.white }]}>Archive</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    };

    return (
      <View style={{ marginHorizontal: -24, marginBottom: -24 + Spacing.md }}>
        <Swipeable 
          renderRightActions={renderRightActions} 
          overshootRight={false}
          enabled={!isCompleted && item.status !== 'done' && item.status !== 'archived'}
        >
          <View style={{ paddingHorizontal: 24, paddingBottom: 24, position: 'relative' }}>
            {isSubtask && (
              <>
                <View style={{
                  position: 'absolute',
                  left: 40,
                  top: -24, // overlap with parent/previous sibling
                  bottom: isLastChild ? '50%' : -24,
                  width: 2,
                  backgroundColor: colors.border,
                  zIndex: -1,
                }} />
                <View style={{
                  position: 'absolute',
                  left: 36,
                  top: '50%',
                  marginTop: -12, // adjust for paddingBottom 24
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.accent,
                  borderWidth: 2,
                  borderColor: colors.border,
                  zIndex: 1,
                }} />
              </>
            )}
            <GHTouchableOpacity
              style={[
                styles.taskCard,
                item.parent_id ? { marginLeft: 32, padding: 12, borderRadius: Radius.lg } : {},
                ClayShadow.card,
                (isCompleted || isFailed || isArchived) && { opacity: 0.6 },
                overdueDays > 0 && !isCompleted && { backgroundColor: colors.coralSoft }
              ]}
              onLongPress={() => handleLongPress(item)}
              activeOpacity={0.7}
            >
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <TouchableOpacity
                    style={[
                      styles.checkCol,
                      isCompleted && { backgroundColor: colors.mint, borderColor: colors.mint },
                      isFailed && { backgroundColor: colors.coral, borderColor: colors.coral },
                      isArchived && { backgroundColor: colors.surfaceHigh, borderColor: colors.border },
                    ]}
                    onPress={() => !isCompleted && item.status !== 'done' && handleToggle(item)}
                    disabled={isCompleted || item.status === 'done'}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 color={colors.mint} size={22} />
                    ) : isFailed ? (
                      <XCircle color={colors.coral} size={22} />
                    ) : isArchived ? (
                      <Archive color={colors.textMuted} size={22} />
                    ) : (
                      <Circle color={overdueDays > 0 ? colors.coral : colors.textMuted} size={22} />
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.taskBody}>
                    <Text
                      style={[
                        styles.taskTitle,
                        { color: colors.textPrimary },
                        (isCompleted || isFailed || isArchived) && { textDecorationLine: 'line-through', color: colors.textSecondary },
                        overdueDays > 0 && !isCompleted && { color: colors.coral }
                      ]}
                    >
                      {item.title}
                    </Text>
                    
                    <View style={styles.taskMeta}>
                      {categories.map((cat) => {
                        const CatIcon = CATEGORY_ICON_MAP[cat] || Rocket;
                        const catColor = CATEGORY_COLORS[cat] || colors.accent;
                        return (
                          <View key={cat} style={[styles.categoryBadge, { backgroundColor: catColor + '18' }]}>
                            <CatIcon color={catColor} size={10} />
                            <Text style={[styles.categoryText, { color: catColor }]}>{cat}</Text>
                          </View>
                        );
                      })}
                      
                      <View style={[styles.recurrenceBadge, { backgroundColor: colors.surfaceHigh }]}>
                        <RotateCcw color={colors.textSecondary} size={10} />
                        <Text style={[styles.recurrenceText, { color: colors.textSecondary }]}>
                          {item.recurrence === 'once' ? 'Once' : item.recurrence === 'daily' ? 'Daily' : 'Weekly'}
                        </Text>
                      </View>
                      
                      <Text style={[styles.xpText, { color: colors.accent }]}>+{effectiveXp * categories.length} XP</Text>
                      
                      {(item.start_date || item.deadline) && (
                        <View style={[styles.recurrenceBadge, { backgroundColor: colors.coralSoft }]}>
                          <CalendarDays color={colors.coral} size={10} />
                          <Text style={[styles.recurrenceText, { color: colors.coral }]}>
                            {(() => {
                              const formatDt = (dStr: string) => {
                                const d = new Date(dStr + 'T00:00:00');
                                return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`;
                              };
                              if (item.start_date && item.deadline) return `${formatDt(item.start_date)} - ${formatDt(item.deadline)}`;
                              if (item.deadline) return `Due ${formatDt(item.deadline)}`;
                              if (item.start_date) return formatDt(item.start_date);
                              return '';
                            })()}
                          </Text>
                        </View>
                      )}
                      
                      {overdueDays > 0 && !isCompleted && (
                        <View style={[styles.recurrenceBadge, { backgroundColor: colors.coral + '22' }]}>
                          <Text style={[styles.recurrenceText, { color: colors.coral }]}>{overdueDays} days overdue</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                
                {/* Subtask Controls for Parent Tasks */}
                {!item.parent_id && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
                    {tasks.some(t => t.parent_id === item.id) ? (
                      <TouchableOpacity onPress={() => toggleExpand(item.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {expandedTasks.includes(item.id) ? <ChevronDown color={colors.textSecondary} size={16} /> : <ChevronRight color={colors.textSecondary} size={16} />}
                        <Text style={{ color: colors.textSecondary, marginLeft: 4, fontSize: 12 }}>Subtasks</Text>
                      </TouchableOpacity>
                    ) : <View />}
                    
                    <TouchableOpacity 
                      onPress={() => handleAddSubtask(item)}
                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceHigh, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full }}
                    >
                      <Plus color={colors.accent} size={14} />
                      <Text style={{ color: colors.accent, marginLeft: 4, fontSize: 12, fontWeight: '600' }}>Subtask</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </GHTouchableOpacity>
          </View>
        </Swipeable>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        data={displayedTasks}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTask}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet visible={showSheet} onClose={() => setShowSheet(false)} title="New Task">
        <InputField
          placeholder="What do you want to do?"
          value={newTitle}
          onChangeText={setNewTitle}
          autoFocus
        />
        <CategoryPicker 
          multiple 
          max={3} 
          selected={newCategories} 
          onSelect={setNewCategories} 
        />
        
        {(() => {
          const parentTask = parentTaskId ? tasks.find(t => t.id === parentTaskId) : null;
          
          if (parentTask) {
            if (parentTask.start_date || parentTask.deadline) {
              return (
                <View>
                  <Text style={{ ...Typography.caption, color: colors.textSecondary, marginBottom: 8 }}>
                    Subtask deadline is synced with its parent task.
                  </Text>
                  <DatePicker
                    startDate={newStartDate}
                    endDate={newDeadline}
                    onSelect={() => {}} // Disabled
                  />
                </View>
              );
            }
            if (parentTask.recurrence === 'specific_days') {
              return (
                <View>
                  <Text style={{ ...Typography.caption, color: colors.textSecondary, marginBottom: 8 }}>
                    Subtask inherits parent's specific days schedule.
                  </Text>
                </View>
              );
            }
            if (parentTask.recurrence === 'once') {
              return (
                <View>
                  <Text style={{ ...Typography.caption, color: colors.textSecondary, marginBottom: 8 }}>
                    Subtask of a 'Once' task must also be 'Once'.
                  </Text>
                </View>
              );
            }
          }

          // Normal task creation (or daily parent which has no constraints)
          return (
            <>
              {!newStartDate && (
                <RecurrencePicker
                  recurrence={newRecurrence}
                  onRecurrenceChange={(r) => { setNewRecurrence(r); setNewStartDate(null); setNewDeadline(null); }}
                  selectedDays={newDays}
                  onSelectedDaysChange={setNewDays}
                />
              )}
              <DatePicker
                startDate={newStartDate}
                endDate={newDeadline}
                onSelect={(start, end) => {
                  setNewStartDate(start);
                  setNewDeadline(end);
                  if (start) {
                    setNewRecurrence('once');
                    setNewDays([]);
                  }
                }}
              />
            </>
          );
        })()}

        <Button title="Create Task" onPress={handleCreateTask} size="lg" disabled={!newTitle.trim()} />
      </BottomSheet>
    </SafeAreaView>
  );
}

function LayoutDashboardIcon(props: any) {
  const { LayoutDashboard } = require('lucide-react-native');
  return <LayoutDashboard {...props} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  list: { paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greeting: { ...Typography.displayMedium, marginBottom: 2 },
  subGreeting: { ...Typography.bodySmall },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: Radius.full,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  filterText: { ...Typography.bodySmall, fontWeight: '500' },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: Radius.lg,
  },
  emptyText: { ...Typography.body, textAlign: 'center' },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  checkCol: { marginRight: 14, paddingTop: 2 },
  taskBody: { flex: 1 },
  taskTitle: { ...Typography.body, marginBottom: 8 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  categoryText: { ...Typography.caption },
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  recurrenceText: { ...Typography.caption },
  xpText: { ...Typography.caption, fontWeight: '600' },
  archiveAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: Radius.lg,
  },
  archiveActionText: {
    ...Typography.caption,
    marginTop: 4,
  },
});
