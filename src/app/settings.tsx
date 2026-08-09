import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Info, ChevronRight, Palette, ChevronLeft } from 'lucide-react-native';
import { Spacing, Typography, Radius, ClayShadow } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { resetDatabase } from '@/db/database';
import { useRouter } from 'expo-router';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

export default function SettingsScreen() {
  const { colors } = useThemeContext();
  const router = useRouter();

  const [showResetSheet, setShowResetSheet] = useState(false);

  const handleReset = () => {
    setShowResetSheet(true);
  };

  const confirmReset = async () => {
    try {
      await resetDatabase();
      setShowResetSheet(false);
      Alert.alert('Done', 'All data has been reset.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceHigh, marginRight: 12 }, ClayShadow.soft]}
          >
            <ChevronLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Settings</Text>
        </View>

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

      <BottomSheet
        visible={showResetSheet}
        onClose={() => setShowResetSheet(false)}
        title="Reset All Data"
      >
        <View style={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
          <Text style={[Typography.body, { color: colors.textSecondary, marginBottom: Spacing.xl, lineHeight: 22 }]}>
            Are you sure you want to delete all your tasks, notes, pomodoro sessions, and stats?{'\n\n'}
            <Text style={{ color: colors.coral, fontWeight: 'bold' }}>This action cannot be undone.</Text>
          </Text>
          <View style={{ gap: Spacing.md }}>
            <Button
              title="Yes, Reset Everything"
              variant="primary"
              onPress={confirmReset}
              style={{ backgroundColor: colors.coral }}
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowResetSheet(false)}
            />
          </View>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  scroll: { paddingBottom: 100 },
  pageTitle: { ...Typography.displayMedium, marginBottom: Spacing.md },
  section: { marginBottom: Spacing.md },
  sectionTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    marginTop: Spacing.lg,
    lineHeight: 18,
  },
});
