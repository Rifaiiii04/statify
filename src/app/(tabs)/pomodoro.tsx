import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Pause, RotateCcw, CheckCircle, SkipForward } from 'lucide-react-native';
import { Spacing, Typography, Radius, ClayShadow } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { createSession, getTodaySessionCount } from '@/db/repositories/pomodoro-repository';
import { addXp, logActivity } from '@/db/repositories/stats-repository';

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

type Phase = 'work' | 'break';

export default function PomodoroScreen() {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: Math.max(insets.top, 24) + 16 }]}>
      {/* Decorative Header Background */}
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: Math.max(insets.top, 24) + 120,
        backgroundColor: colors.coralSoft,
        borderBottomLeftRadius: Radius.xl,
        borderBottomRightRadius: Radius.xl,
      }} />
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Focus</Text>
          <View style={styles.phaseBadge}>
            <View style={[styles.phaseDot, { backgroundColor: phase === 'work' ? colors.coral : colors.mint }]} />
            <Text style={[styles.phaseLabel, { color: colors.textSecondary }]}>
              {phase === 'work' ? 'Work session' : 'Short break'}
            </Text>
          </View>
        </View>

        <View style={styles.ringContainer}>
          <View style={[styles.ringTrack, ClayShadow.card]}>
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
                ClayShadow.soft, i < sessionCount && { backgroundColor: colors.amber, shadowColor: colors.amber }]}
            />
          ))}
          <Text style={[styles.sessionText, { color: colors.textSecondary }]}>
            {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} today
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.secondaryBtn, ClayShadow.soft]}
            onPress={resetTimer}
            activeOpacity={0.7}
          >
            <RotateCcw color={colors.textSecondary} size={22} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, ClayShadow.button, { backgroundColor: colors.coral }, isActive && styles.primaryBtnActive]}
            onPress={toggleTimer}
            activeOpacity={0.8}
          >
            {isActive
              ? <Pause color={colors.white} size={28} fill={colors.white} />
              : <Play color={colors.white} size={28} fill={colors.white} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, ClayShadow.soft]}
            onPress={skipPhase}
            activeOpacity={0.7}
          >
            <SkipForward color={colors.textSecondary} size={22} />
          </TouchableOpacity>
        </View>

        <View style={[styles.xpReminder, ClayShadow.soft]}>
          <Text style={[styles.xpReminderText, { color: colors.textSecondary }]}>
            Complete a session to earn <Text style={{ color: colors.accent }}>+15 XP</Text> in Discipline
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: Spacing.lg },
  header: { paddingTop: Spacing.md, marginBottom: Spacing.lg },
  title: { ...Typography.displayMedium, marginBottom: 4 },
  phaseBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phaseDot: { width: 6, height: 6, borderRadius: 3 },
  phaseLabel: { ...Typography.bodySmall },
  ringContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  ringTrack: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: { alignItems: 'center' },
  timeText: { fontFamily: 'Poppins_700Bold', fontSize: 44, letterSpacing: -1 },
  timeSub: { ...Typography.bodySmall, marginTop: 2 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  sessionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sessionText: { ...Typography.bodySmall, marginLeft: 4 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  primaryBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnActive: { opacity: 0.9 },
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpReminder: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  xpReminderText: { ...Typography.bodySmall },
});
