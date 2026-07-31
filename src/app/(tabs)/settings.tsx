import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Sun, Moon, Trash2, Info, ChevronRight } from 'lucide-react-native';
import { Spacing, Typography, Radius } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { resetDatabase } from '@/db/database';

export default function SettingsScreen() {
  const { colors, mode, toggleTheme } = useThemeContext();

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all tasks, notes, pomodoro sessions, and stats. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetDatabase();
            Alert.alert('Done', 'All data has been reset.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          <TouchableOpacity
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {mode === 'dark' ? (
              <Moon color={colors.yellow} size={20} />
            ) : (
              <Sun color={colors.yellow} size={20} />
            )}
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Theme</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <ChevronRight color={colors.textMuted} size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data</Text>
          <TouchableOpacity
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Trash2 color={colors.danger} size={20} />
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.danger }]}>Reset All Data</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Delete all tasks, notes, and stats
              </Text>
            </View>
            <ChevronRight color={colors.textMuted} size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
          <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Info color={colors.textSecondary} size={20} />
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Task Tracker</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Version 1.0.0 (SQLite Prototype)
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          Offline-first task management{'\n'}Built with Expo + SQLite
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingBottom: 60 },
  pageTitle: { ...Typography.displayMedium, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  rowContent: { flex: 1 },
  rowTitle: { ...Typography.body, fontWeight: '500' },
  rowSub: { ...Typography.bodySmall, marginTop: 2 },
  footer: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.xl,
    lineHeight: 20,
  },
});
