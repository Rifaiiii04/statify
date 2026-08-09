import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, CalendarDays, Timer, BarChart2, Wallet } from 'lucide-react-native';
import { useThemeContext } from '@/context/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { evaluateDailyBudgetQuest } from '@/db/repositories/finance-repository';
import { cleanUpArchivedTasks } from '@/db/repositories/task-repository';
import { ClayShadow } from '@/constants/design';

import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';

const TabIcon = ({ icon: Icon, focused, colors }: any) => {
  const bgStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
      transform: [{ scale: withSpring(focused ? 1 : 0.5, { damping: 15 }) }],
    };
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(focused ? 1.1 : 1, { damping: 15 }) }],
    };
  }, [focused]);

  return (
    <View
      style={{
        width: 40,
        height: 40,
        position: 'relative',
        top: 8,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: 20,
            backgroundColor: colors.accent,
          },
          bgStyle,
          ClayShadow.button,
        ]}
      />
      <Animated.View style={[{ zIndex: 1 }, iconStyle]}>
        <Icon color={focused ? colors.white : colors.textMuted} size={20} />
      </Animated.View>
    </View>
  );
};

const FloatingTabIcon = ({ icon: Icon, focused, colors }: any) => {
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(focused ? 1.15 : 1, { damping: 12 }) },
        { translateY: withSpring(focused ? -6 : 0, { damping: 12 }) }
      ],
    };
  }, [focused]);

  return (
    <Animated.View
      style={[
        {
          width: 52,
          height: 52,
          borderRadius: 26,
          position: 'relative',
          top: -10,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          ...ClayShadow.button,
        },
        containerStyle
      ]}
    >
      <Icon color={colors.white} size={22} />
    </Animated.View>
  );
};

export default function TabsLayout() {
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    evaluateDailyBudgetQuest().catch(console.error);
    cleanUpArchivedTasks().catch(console.error);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64 + insets.bottom,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingHorizontal: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          ...ClayShadow.navBar,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => <TabIcon icon={LayoutDashboard} focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => <TabIcon icon={CalendarDays} focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: 'Focus',
          tabBarIcon: ({ focused }) => <FloatingTabIcon icon={Timer} focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="money"
        options={{
          title: 'Money',
          tabBarIcon: ({ focused }) => <TabIcon icon={Wallet} focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => <TabIcon icon={BarChart2} focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          href: null, // Hide from bottom nav
        }}
      />
    </Tabs>
  );
}
