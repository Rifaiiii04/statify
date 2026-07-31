import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, Lightbulb, Timer, BarChart2, Settings, Wallet } from 'lucide-react-native';
import { useThemeContext } from '@/context/theme-context';
import { evaluateDailyBudgetQuest } from '@/db/repositories/finance-repository';
import { cleanUpArchivedTasks } from '@/db/repositories/task-repository';

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
        focused && { backgroundColor: colors.yellow },
      ]}
    >
      <Icon color={focused ? colors.black : colors.textSecondary} size={22} />
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
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.surfaceHigh,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
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
