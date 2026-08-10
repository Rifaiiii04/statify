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

const TabIcon = ({ icon: Icon, focused, colors, activeColor, activeIconColor = colors.white, tabColor }: any) => {
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

  const colorToUse = activeColor || colors.accent;
  const iconColorToUse = focused ? activeIconColor : (tabColor || colors.textMuted);

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
          ClayShadow.button,
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: 4,
            backgroundColor: colorToUse,
            borderWidth: 2,
            borderColor: '#000000',
          },
          bgStyle,
        ]}
      />
      <Animated.View style={[{ zIndex: 1 }, iconStyle]}>
        <Icon color={iconColorToUse} size={20} />
      </Animated.View>
    </View>
  );
};

const FloatingTabIcon = ({ icon: Icon, focused, colors, activeColor = colors.coral, activeIconColor = colors.white, tabColor = colors.coral }: any) => {
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(focused ? 1.15 : 1, { damping: 12 }) },
        { translateY: withSpring(focused ? -6 : 0, { damping: 12 }) }
      ],
    };
  }, [focused]);

  const bgColor = focused ? activeColor : colors.surface;
  const iconColorToUse = focused ? activeIconColor : tabColor;

  return (
    <Animated.View
      style={[
        {
          width: 52,
          height: 52,
          borderRadius: 8,
          position: 'relative',
          top: -10,
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: '#000',
          borderBottomWidth: 4,
          borderRightWidth: 4,
        },
        containerStyle
      ]}
    >
      <Icon color={iconColorToUse} size={22} />
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
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingHorizontal: 8,
          backgroundColor: colors.surface,
          borderTopWidth: 3,
          borderTopColor: '#000',
          borderLeftWidth: 0,
          borderRightWidth: 0,
          borderBottomWidth: 0,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              icon={LayoutDashboard} 
              focused={focused} 
              colors={colors} 
              activeColor={colors.accent}
              activeIconColor={colors.white}
              tabColor={colors.accent}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              icon={CalendarDays} 
              focused={focused} 
              colors={colors} 
              activeColor={colors.mint}
              activeIconColor={colors.black}
              tabColor={colors.mint}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: 'Focus',
          tabBarIcon: ({ focused }) => (
            <FloatingTabIcon 
              icon={Timer} 
              focused={focused} 
              colors={colors} 
              activeColor={colors.coral}
              activeIconColor={colors.white}
              tabColor={colors.coral}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="money"
        options={{
          title: 'Money',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              icon={Wallet} 
              focused={focused} 
              colors={colors} 
              activeColor={colors.amber}
              activeIconColor={colors.black}
              tabColor={colors.amber}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              icon={BarChart2} 
              focused={focused} 
              colors={colors} 
              activeColor={colors.purple}
              activeIconColor={colors.white}
              tabColor={colors.purple}
            />
          ),
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
