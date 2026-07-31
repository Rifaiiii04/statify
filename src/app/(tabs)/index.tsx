import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  FlatList, TouchableOpacity, Alert,
} from 'react-native';
import {
  Plus, CheckCircle2, Circle, Trash2, XCircle, Archive,
  Dumbbell, Brain, Palette, Shield, Users, Rocket,
  Repeat, CalendarDays, RotateCcw,
} from 'lucide-react-native';
import { Spacing, Typography, Radius, CATEGORY_COLORS } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { Task, StatCategory, RecurrenceType } from '@/db/schema';
import { getAllTasks, createTask, toggleTask, deleteTask, archiveTask } from '@/db/repositories/task-repository';
import { addXp, removeXp, logActivity, removeActivity } from '@/db/repositories/stats-repository';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { CategoryPicker } from '@/components/ui/CategoryPicker';
import { RecurrencePicker } from '@/components/ui/RecurrencePicker';

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
  const { colors } = useThemeContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterTab>('active');
  const [showSheet, setShowSheet] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategories, setNewCategories] = useState<StatCategory[]>(['Productivity']);
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceType>('once');
  const [newDays, setNewDays] = useState<number[]>([]);

  const loadTasks = useCallback(async () => {
    const result = await getAllTasks();
    setTasks(result);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async () => {
    if (!newTitle.trim() || newCategories.length === 0) return;
    await createTask(newTitle.trim(), newCategories.join(',') as StatCategory, newRecurrence, newDays);
    setNewTitle('');
    setNewCategories(['Productivity']);
    setNewRecurrence('once');
    setNewDays([]);
    setShowSheet(false);
    loadTasks();
  };

  const handleToggle = async (task: Task) => {
    if (task.is_system) {
      Alert.alert('System Quest', 'This is an automatic daily quest. Edit your budget in the Money tab.');
      return;
    }
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
      },
    ]);
  };

  const activeCount = tasks.filter(t => t.status === 'active').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;
  const archivedCount = tasks.filter(t => t.status === 'archived').length;
  const totalCount = activeCount + doneCount;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  
  const displayedTasks = tasks.filter(t => t.status === filter);

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>Tasks</Text>
          <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
            {doneCount}/{totalCount} completed
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.yellow }]}
          onPress={() => setShowSheet(true)}
          activeOpacity={0.75}
        >
          <Plus color={colors.black} size={20} />
        </TouchableOpacity>
      </View>

      <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: colors.yellow }]} />
      </View>
      
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { borderColor: colors.border, backgroundColor: colors.surfaceHigh },
            filter === 'active' && { borderColor: colors.yellow, backgroundColor: colors.yellowSoft },
          ]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, { color: filter === 'active' ? colors.yellow : colors.textSecondary }]}>
            Active ({activeCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            { borderColor: colors.border, backgroundColor: colors.surfaceHigh },
            filter === 'done' && { borderColor: colors.success, backgroundColor: colors.success + '22' },
          ]}
          onPress={() => setFilter('done')}
        >
          <Text style={[styles.filterText, { color: filter === 'done' ? colors.success : colors.textSecondary }]}>
            Done ({doneCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            { borderColor: colors.border, backgroundColor: colors.surfaceHigh },
            filter === 'failed' && { borderColor: colors.danger, backgroundColor: colors.danger + '22' },
          ]}
          onPress={() => setFilter('failed')}
        >
          <Text style={[styles.filterText, { color: filter === 'failed' ? colors.danger : colors.textSecondary }]}>
            Fail ({failedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            { borderColor: colors.border, backgroundColor: colors.surfaceHigh },
            filter === 'archived' && { borderColor: colors.textMuted, backgroundColor: colors.surface },
          ]}
          onPress={() => setFilter('archived')}
        >
          <Text style={[styles.filterText, { color: filter === 'archived' ? colors.textPrimary : colors.textSecondary }]}>
            Archive ({archivedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {displayedTasks.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
    const isCompleted = item.status === 'done';
    const isFailed = item.status === 'failed';
    const isArchived = item.status === 'archived';

    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          (isCompleted || isFailed || isArchived) && { opacity: 0.6 },
        ]}
        onPress={() => handleToggle(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.checkCol}>
          {isCompleted && <CheckCircle2 color={colors.success} size={22} />}
          {isFailed && <XCircle color={colors.danger} size={22} />}
          {isArchived && <Archive color={colors.textMuted} size={22} />}
          {item.status === 'active' && <Circle color={colors.textMuted} size={22} />}
        </View>
        <View style={styles.taskBody}>
          <Text
            style={[
              styles.taskTitle,
              { color: colors.textPrimary },
              (isCompleted || isFailed || isArchived) && { textDecorationLine: 'line-through', color: colors.textSecondary },
            ]}
          >
            {item.title}
          </Text>
          <View style={styles.taskMeta}>
            {categories.map((cat) => {
              const CatIcon = CATEGORY_ICON_MAP[cat] || Rocket;
              const catColor = CATEGORY_COLORS[cat] || colors.yellow;
              return (
                <View key={cat} style={[styles.categoryBadge, { borderColor: catColor, backgroundColor: catColor + '18' }]}>
                  <CatIcon color={catColor} size={10} />
                  <Text style={[styles.categoryText, { color: catColor }]}>{cat}</Text>
                </View>
              );
            })}
            <View style={[styles.recurrenceBadge, { borderColor: colors.border, backgroundColor: colors.surfaceHigh }]}>
              <RotateCcw color={colors.textSecondary} size={10} />
              <Text style={[styles.recurrenceText, { color: colors.textSecondary }]}>
                {item.recurrence === 'once' ? 'Once' : item.recurrence === 'daily' ? 'Daily' : 'Weekly'}
              </Text>
            </View>
            <Text style={[styles.xpText, { color: colors.textMuted }]}>+{item.xp * categories.length} XP</Text>
          </View>
        </View>
      </TouchableOpacity>
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
        <RecurrencePicker
          recurrence={newRecurrence}
          onRecurrenceChange={setNewRecurrence}
          selectedDays={newDays}
          onSelectedDaysChange={setNewDays}
        />
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
  container: { flex: 1 },
  list: { padding: Spacing.lg, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greeting: { ...Typography.displayMedium, marginBottom: 2 },
  subGreeting: { ...Typography.bodySmall },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    height: 3,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterText: { ...Typography.bodySmall, fontWeight: '500' },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  emptyText: { ...Typography.body, textAlign: 'center' },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkCol: { marginRight: 14, paddingTop: 2 },
  taskBody: { flex: 1 },
  taskTitle: { ...Typography.body, marginBottom: 8 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  categoryText: { ...Typography.caption },
  recurrenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  recurrenceText: { ...Typography.caption },
  xpText: { ...Typography.caption },
});
