import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Lightbulb, Timer, BarChart2, Settings, Wallet } from 'lucide-react-native';
import { useThemeContext } from '@/context/theme-context';
import { evaluateDailyBudgetQuest } from '@/db/repositories/finance-repository';
import { cleanUpArchivedTasks } from '@/db/repositories/task-repository';
import { ClayShadow } from '@/constants/design';

import { View } from 'react-native';

const TabIcon = ({ icon: Icon, focused, colors }: any) => {
  return (
    <View
      style={[
        {
          width: 48,
          height: 48,
          borderRadius: 24,
          position: 'relative',
          top: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        focused && {
          backgroundColor: colors.accent,
          ...ClayShadow.button,
        }]}
    >
      <Icon color={focused ? colors.white : colors.textMuted} size={22} />
    </View>
  );
};

export default function TabsLayout() {
  const { colors } = useThemeContext();

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
          bottom: 24,
          left: 24,
          right: 24,
          height: 68,
          borderRadius: 34,
          paddingHorizontal: 12,
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          ...ClayShadow.navBar,
          paddingBottom: 0,
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
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ focused }) => <TabIcon icon={Lightbulb} focused={focused} colors={colors} />,
        }}
      />
      <Tabs.Screen
        name="pomodoro"
        options={{
          title: 'Focus',
          tabBarIcon: ({ focused }) => <TabIcon icon={Timer} focused={focused} colors={colors} />,
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
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon icon={Settings} focused={focused} colors={colors} />,
        }}
      />
    </Tabs>
  );
}
