import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated,
} from 'react-native';
import { Play, Pause, RotateCcw, CheckCircle, SkipForward } from 'lucide-react-native';
import { Spacing, Typography, Radius } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { createSession, getTodaySessionCount } from '@/db/repositories/pomodoro-repository';
import { addXp, logActivity } from '@/db/repositories/stats-repository';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

type Phase = 'work' | 'break';

export default function PomodoroScreen() {
  const { colors } = useThemeContext();
  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<any>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const totalTime = phase === 'work' ? WORK_DURATION : BREAK_DURATION;

  useEffect(() => {
    getTodaySessionCount().then(setSessionCount);
  }, []);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (totalTime - timeLeft) / totalTime,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            handlePhaseComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const handlePhaseComplete = async () => {
    if (phase === 'work') {
      await createSession(WORK_DURATION);
      await addXp(15, 'Discipline');
      await logActivity('pomodoro', 15, 'Discipline');
      const count = await getTodaySessionCount();
      setSessionCount(count);
      setPhase('break');
      setTimeLeft(BREAK_DURATION);
    } else {
      setPhase('work');
      setTimeLeft(WORK_DURATION);
    }
  };

  const toggleTimer = () => setIsActive(v => !v);

  const resetTimer = () => {
    setIsActive(false);
    setPhase('work');
    setTimeLeft(WORK_DURATION);
    Animated.timing(progress, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  };

  const skipPhase = () => {
    setIsActive(false);
    if (phase === 'work') {
      setPhase('break');
      setTimeLeft(BREAK_DURATION);
    } else {
      setPhase('work');
      setTimeLeft(WORK_DURATION);
    }
    Animated.timing(progress, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Focus</Text>
          <View style={styles.phaseBadge}>
            <View style={[styles.phaseDot, { backgroundColor: phase === 'work' ? colors.yellow : colors.success }]} />
            <Text style={[styles.phaseLabel, { color: colors.textSecondary }]}>
              {phase === 'work' ? 'Work session' : 'Short break'}
            </Text>
          </View>
        </View>

        <View style={styles.ringContainer}>
          <View style={[styles.ringTrack, { borderColor: colors.surfaceHigh }]}>
            <View style={styles.ringInner}>
              <Text style={[styles.timeText, { color: colors.textPrimary }]}>{formatTime(timeLeft)}</Text>
              <Text style={[styles.timeSub, { color: colors.textSecondary }]}>
                {phase === 'work' ? '25 min session' : '5 min break'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sessionRow}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.sessionDot,
                { backgroundColor: colors.surfaceHigh, borderColor: colors.border },
                i < sessionCount && { backgroundColor: colors.yellow, borderColor: colors.yellow },
              ]}
            />
          ))}
          <Text style={[styles.sessionText, { color: colors.textSecondary }]}>
            {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} today
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}
            onPress={resetTimer}
            activeOpacity={0.7}
          >
            <RotateCcw color={colors.textSecondary} size={22} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.yellow }, isActive && styles.primaryBtnActive]}
            onPress={toggleTimer}
            activeOpacity={0.8}
          >
            {isActive
              ? <Pause color={colors.black} size={28} fill={colors.black} />
              : <Play color={colors.black} size={28} fill={colors.black} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}
            onPress={skipPhase}
            activeOpacity={0.7}
          >
            <SkipForward color={colors.textSecondary} size={22} />
          </TouchableOpacity>
        </View>

        <View style={[styles.xpReminder, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}>
          <Text style={[styles.xpReminderText, { color: colors.textSecondary }]}>
            Complete a session to earn <Text style={{ color: colors.yellow }}>+15 XP</Text> in Discipline
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: Spacing.lg },
  header: { paddingTop: Spacing.lg, marginBottom: Spacing.xl },
  title: { ...Typography.displayMedium, marginBottom: 6 },
  phaseBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phaseDot: { width: 8, height: 8, borderRadius: 4 },
  phaseLabel: { ...Typography.bodySmall },
  ringContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  ringTrack: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: { alignItems: 'center' },
  timeText: { fontSize: 56, fontWeight: '700', letterSpacing: -1 },
  timeSub: { ...Typography.bodySmall, marginTop: 4 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.xl,
  },
  sessionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  sessionText: { ...Typography.bodySmall, marginLeft: 4 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  primaryBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnActive: { opacity: 0.9 },
  secondaryBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpReminder: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  xpReminderText: { ...Typography.bodySmall },
});
