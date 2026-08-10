import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserStats } from '@/db/repositories/stats-repository';
import { useThemeContext } from '@/context/theme-context';

export default function IndexScreen() {
  const router = useRouter();
  const { colors } = useThemeContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const stats = await getUserStats();
        if (stats.has_onboarded === 1) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      } catch (e) {
        // If DB isn't ready or stats aren't found, default to onboarding
        router.replace('/onboarding');
      } finally {
        setLoading(false);
      }
    }
    
    // Give a tiny delay for DB initialization to complete if it's the first run
    setTimeout(checkOnboarding, 500);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return null;
}
