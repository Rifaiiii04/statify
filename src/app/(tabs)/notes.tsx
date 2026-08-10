import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  FlatList, TouchableOpacity, Alert, Platform,
} from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus, CheckCircle2, Lightbulb, Trash2,
  Dumbbell, Brain, Palette, Shield, Users, Rocket, ChevronLeft
} from 'lucide-react-native';
import { Spacing, Typography, Radius, CATEGORY_COLORS, ClayShadow } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { Note, StatCategory } from '@/db/schema';
import { getAllNotes, getActiveNotes, getExecutedNotes, createNote, executeNote, unexecuteNote, deleteNote } from '@/db/repositories/note-repository';
import { addXp, removeXp, logActivity, removeActivity, getUserStats } from '@/db/repositories/stats-repository';
import { useFocusEffect, useRouter } from 'expo-router';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { CategoryPicker } from '@/components/ui/CategoryPicker';

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  Physical: Dumbbell,
  Intelligence: Brain,
  Creativity: Palette,
  Discipline: Shield,
  Social: Users,
  Productivity: Rocket,
};

type FilterTab = 'all' | 'active' | 'executed';

export default function NotesScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showSheet, setShowSheet] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [username, setUsername] = useState('');

  const loadNotes = useCallback(async () => {
    const result = await getAllNotes();
    setNotes(result);
    try {
      const stats = await getUserStats();
      setUsername(stats.username || 'User');
    } catch(e) {}
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
  };

  const handleCreateNote = async () => {
    if (!newTitle.trim()) return;
    await createNote(newTitle.trim(), newContent.trim(), 'Intelligence,Discipline,Creativity' as StatCategory);
    resetForm();
    setShowSheet(false);
    loadNotes();
  };

  const handleExecute = async (note: Note) => {
    if (note.executed) {
      const result = await unexecuteNote(note.id);
      const categories = result.category.split(',') as StatCategory[];
      for (const cat of categories) {
        await removeXp(result.xp, cat);
        await removeActivity('note', result.xp, cat);
      }
    } else {
      const result = await executeNote(note.id);
      const categories = result.category.split(',') as StatCategory[];
      for (const cat of categories) {
        await addXp(result.xp, cat);
        await logActivity('note', result.xp, cat);
      }
    }
    setSelectedNote(null);
    loadNotes();
  };

  const handleDelete = (note: Note) => {
    const doDelete = async () => {
      if (note.executed) {
        const categories = note.category.split(',') as StatCategory[];
        for (const cat of categories) {
          await removeXp(note.xp, cat);
          await removeActivity('note', note.xp, cat);
        }
      }
      await deleteNote(note.id);
      loadNotes();
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${note.title}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('Delete Note', `Delete "${note.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const activeCount = notes.filter(n => !n.executed).length;
  const executedCount = notes.filter(n => n.executed).length;

  const displayedNotes = filter === 'active' ? notes.filter(n => !n.executed)
                       : filter === 'executed' ? notes.filter(n => n.executed)
                       : notes;

  const FILTER_CONFIGS = [
    { key: 'all' as FilterTab, label: `All (${notes.length})`, color: colors.accent },
    { key: 'active' as FilterTab, label: `Active (${activeCount})`, color: colors.purple },
    { key: 'executed' as FilterTab, label: `Done (${executedCount})`, color: colors.mint }];

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <View>
            {username ? <Text style={{ ...Typography.bodySmall, color: colors.textSecondary, marginBottom: 4 }}>Hi, {username} 👋</Text> : null}
            <Text style={[styles.greeting, { color: colors.textPrimary }]}>Notes</Text>
            <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
              Capture ideas, execute them, earn XP
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTER_CONFIGS.map(({ key, label, color }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterTab,
              ClayShadow.soft, filter === key && { backgroundColor: color + '18', shadowColor: color }]}
            onPress={() => setFilter(key)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              { color: colors.textSecondary },
              filter === key && { color }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {displayedNotes.length === 0 && (
        <View style={[styles.emptyState, ClayShadow.soft]}>
          <Lightbulb color={colors.textMuted} size={36} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No ideas yet. Tap + to capture your first idea.
          </Text>
        </View>
      )}
    </View>
  );

  const renderNote = ({ item }: { item: Note }) => {
    const categories = item.category.split(',') as StatCategory[];
    const isExecuted = !!item.executed;
    
    const mainCat = categories[0] || 'Creativity';
    const MainCatIcon = CATEGORY_ICON_MAP[mainCat] || Lightbulb;
    const mainCatColor = CATEGORY_COLORS[mainCat] || colors.accent;

    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        layout={LinearTransition.springify()}
      >
        <TouchableOpacity
          style={[
            styles.noteCard,
            ClayShadow.card, isExecuted && { opacity: 0.6 }]}
          onPress={() => setSelectedNote(item)}
          onLongPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <View style={styles.noteHeader}>
            <View style={[styles.noteIconWrap, { backgroundColor: mainCatColor + '18' }]}>
              <MainCatIcon color={mainCatColor} size={16} />
            </View>
            <View style={styles.noteInfo}>
              <Text
                style={[
                  styles.noteTitle,
                  { color: colors.textPrimary },
                  isExecuted && { textDecorationLine: 'line-through', color: colors.textSecondary }]}
              >
                {item.title}
              </Text>
              {item.content ? (
                <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.content}
                </Text>
              ) : null}
            </View>
            {isExecuted && <CheckCircle2 color={colors.mint} size={20} />}
          </View>
          <View style={styles.noteMeta}>
            {categories.map((cat) => {
              const catColor = CATEGORY_COLORS[cat] || colors.accent;
              return (
                <View key={cat} style={[styles.categoryBadge, { backgroundColor: catColor + '18' }]}>
                  <Text style={[styles.categoryText, { color: catColor }]}>{cat}</Text>
                </View>
              );
            })}
            <Text style={[styles.xpText, { color: colors.accent }]}>+{item.xp * categories.length} XP</Text>
            {isExecuted && (
              <View style={[styles.executedBadge, { backgroundColor: colors.mintSoft }]}>
                <Text style={[styles.executedText, { color: colors.mint }]}>Executed</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 16) }}>

      <View style={styles.container}>
        <FlatList
        data={displayedNotes}
        keyExtractor={item => item.id.toString()}
        renderItem={renderNote}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet visible={showSheet} onClose={() => setShowSheet(false)} title="New Idea">
        <InputField
          placeholder="What's your idea?"
          value={newTitle}
          onChangeText={setNewTitle}
          autoFocus
        />
        <InputField
          placeholder="Describe your idea (optional)"
          value={newContent}
          onChangeText={setNewContent}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
        <Button title="Save Idea" onPress={handleCreateNote} size="lg" disabled={!newTitle.trim()} />
      </BottomSheet>

      <BottomSheet visible={!!selectedNote} onClose={() => setSelectedNote(null)} title="Idea Detail">
        {selectedNote && (
          <View>
            <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>
              {selectedNote.title}
            </Text>
            {selectedNote.content ? (
              <Text style={[styles.detailContent, { color: colors.textSecondary }]}>
                {selectedNote.content}
              </Text>
            ) : null}
            
            <View style={styles.detailMeta}>
              {selectedNote.category.split(',').map((cat) => {
                const catColor = CATEGORY_COLORS[cat] || colors.accent;
                return (
                  <View key={cat} style={[styles.categoryBadge, { backgroundColor: catColor + '18' }]}>
                    <Text style={[styles.categoryText, { color: catColor }]}>{cat}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.detailActions}>
              <Button 
                title={selectedNote.executed ? "Undo Execution" : "Mark as Executed"} 
                onPress={() => handleExecute(selectedNote)} 
                size="lg" 
              />
              <Button 
                title="Delete Note" 
                onPress={() => { setSelectedNote(null); handleDelete(selectedNote); }} 
                size="lg" 
                variant="ghost"
              />
            </View>
          </View>
        )}
      </BottomSheet>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, ClayShadow.fab, { backgroundColor: colors.accent }]}
        onPress={() => {
          resetForm();
          setShowSheet(true);
        }}
        activeOpacity={0.8}
      >
        <Plus color={colors.white} size={32} />
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  list: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greeting: { ...Typography.displayMedium, marginBottom: 2 },
  subGreeting: { ...Typography.bodySmall },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterText: { ...Typography.bodySmall },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.lg,
  },
  emptyText: { ...Typography.body, textAlign: 'center' },
  noteCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  noteIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInfo: { flex: 1 },
  noteTitle: { ...Typography.body, marginBottom: 2 },
  noteContent: { ...Typography.bodySmall, lineHeight: 16 },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  categoryText: { ...Typography.caption },
  xpText: { ...Typography.caption },
  executedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  executedText: { ...Typography.caption },
  detailTitle: {
    ...Typography.titleLarge,
    marginBottom: Spacing.sm,
  },
  detailContent: {
    ...Typography.body,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  detailMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  detailActions: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 16,
  },
});
