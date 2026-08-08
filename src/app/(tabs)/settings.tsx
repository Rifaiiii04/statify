import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Info, ChevronRight, Palette } from 'lucide-react-native';
import { Spacing, Typography, Radius, ClayShadow } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { resetDatabase } from '@/db/database';

export default function SettingsScreen() {
  const { colors } = useThemeContext();

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
        }],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Settings</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          <View style={[styles.row, ClayShadow.soft]}>
            <Palette color={colors.accent} size={20} />
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Theme</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Claymorphism Light
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data</Text>
          <TouchableOpacity
            style={[styles.row, ClayShadow.soft]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Trash2 color={colors.coral} size={20} />
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.coral }]}>Reset All Data</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Delete all tasks, notes, and stats
              </Text>
            </View>
            <ChevronRight color={colors.textMuted} size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
          <View style={[styles.row, ClayShadow.soft]}>
            <Info color={colors.purple} size={20} />
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
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  scroll: { paddingBottom: 120 },
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
    borderRadius: Radius.lg,
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
