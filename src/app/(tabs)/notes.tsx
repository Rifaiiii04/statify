import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  FlatList, TouchableOpacity, Alert,
} from 'react-native';
import {
  Plus, CheckCircle2, Lightbulb, Trash2,
  Dumbbell, Brain, Palette, Shield, Users, Rocket,
} from 'lucide-react-native';
import { Spacing, Typography, Radius, CATEGORY_COLORS } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { Note, StatCategory } from '@/db/schema';
import { getAllNotes, getActiveNotes, getExecutedNotes, createNote, executeNote, unexecuteNote, deleteNote } from '@/db/repositories/note-repository';
import { addXp, removeXp, logActivity, removeActivity } from '@/db/repositories/stats-repository';
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
  const { colors } = useThemeContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showSheet, setShowSheet] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const loadNotes = useCallback(async () => {
    let result: Note[];
    if (filter === 'active') result = await getActiveNotes();
    else if (filter === 'executed') result = await getExecutedNotes();
    else result = await getAllNotes();
    setNotes(result);
  }, [filter]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateNote = async () => {
    if (!newTitle.trim()) return;
    await createNote(newTitle.trim(), newContent.trim(), 'Intelligence,Discipline,Creativity' as StatCategory);
    setNewTitle('');
    setNewContent('');
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
    Alert.alert('Delete Note', `Delete "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (note.executed) {
            const categories = note.category.split(',') as StatCategory[];
            for (const cat of categories) {
              await removeXp(note.xp, cat);
              await removeActivity('note', note.xp, cat);
            }
          }
          await deleteNote(note.id);
          loadNotes();
        },
      },
    ]);
  };

  const activeCount = notes.filter(n => !n.executed).length;
  const executedCount = notes.filter(n => n.executed).length;

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${notes.length})` },
    { key: 'active', label: `Active (${activeCount})` },
    { key: 'executed', label: `Done (${executedCount})` },
  ];

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>Notes</Text>
          <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
            Capture ideas, execute them, earn XP
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

      <View style={styles.filterRow}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              { borderColor: colors.border, backgroundColor: colors.surfaceHigh },
              filter === tab.key && { borderColor: colors.yellow, backgroundColor: colors.yellowSoft },
            ]}
            onPress={() => setFilter(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterText,
              { color: colors.textSecondary },
              filter === tab.key && { color: colors.yellow },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {notes.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
    
    // Use the first category's icon/color for the main note icon
    const mainCat = categories[0] || 'Creativity';
    const MainCatIcon = CATEGORY_ICON_MAP[mainCat] || Lightbulb;
    const mainCatColor = CATEGORY_COLORS[mainCat] || colors.yellow;

    return (
      <TouchableOpacity
        style={[
          styles.noteCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isExecuted && { opacity: 0.6 },
        ]}
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
                isExecuted && { textDecorationLine: 'line-through', color: colors.textSecondary },
              ]}
            >
              {item.title}
            </Text>
            {item.content ? (
              <Text style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.content}
              </Text>
            ) : null}
          </View>
          {isExecuted && <CheckCircle2 color={colors.yellow} size={20} />}
        </View>
        <View style={styles.noteMeta}>
          {categories.map((cat) => {
            const catColor = CATEGORY_COLORS[cat] || colors.yellow;
            return (
              <View key={cat} style={[styles.categoryBadge, { borderColor: catColor, backgroundColor: catColor + '18' }]}>
                <Text style={[styles.categoryText, { color: catColor }]}>{cat}</Text>
              </View>
            );
          })}
          <Text style={[styles.xpText, { color: colors.textMuted }]}>+{item.xp * categories.length} XP</Text>
          {isExecuted && (
            <View style={[styles.executedBadge, { backgroundColor: colors.yellowSoft }]}>
              <Text style={[styles.executedText, { color: colors.yellow }]}>Executed</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <FlatList
        data={notes}
        keyExtractor={item => item.id.toString()}
        renderItem={renderNote}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
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
                const catColor = CATEGORY_COLORS[cat] || colors.yellow;
                return (
                  <View key={cat} style={[styles.categoryBadge, { borderColor: catColor, backgroundColor: catColor + '18' }]}>
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
                title="Delete Idea" 
                onPress={() => { setSelectedNote(null); handleDelete(selectedNote); }} 
                size="lg" 
                variant="ghost"
              />
            </View>
          </View>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
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
  filterRow: {
    flexDirection: 'row',
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
  noteCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  noteIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInfo: { flex: 1 },
  noteTitle: { ...Typography.body, fontWeight: '500', marginBottom: 2 },
  noteContent: { ...Typography.bodySmall, lineHeight: 18 },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  categoryText: { ...Typography.caption },
  xpText: { ...Typography.caption },
  executedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  executedText: { ...Typography.caption, fontWeight: '600' },
  detailTitle: {
    ...Typography.titleLarge,
    marginBottom: Spacing.sm,
  },
  detailContent: {
    ...Typography.body,
    lineHeight: 24,
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
});
