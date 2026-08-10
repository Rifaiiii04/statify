import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { Spacing, Typography, ClayShadow, Radius } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { Button } from '@/components/ui/Button';

export default function OnboardingScreen() {
  const { colors } = useThemeContext();
  const router = useRouter();
  
  const handleNext = () => {
    router.push('/onboard-name' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.amber }]}>
      <View style={styles.content}>
        
        {/* Decorative Elements */}
        <View style={[styles.decorBox, { backgroundColor: colors.coral, top: 40, left: -20, transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.decorBox, { backgroundColor: colors.purple, top: 120, right: -30, transform: [{ rotate: '25deg' }] }]} />

        <View style={styles.mainArea}>
          <Text style={[styles.hugeTitle, { color: colors.textPrimary }]}>
            LEVEL{'\n'}UP{'\n'}YOUR{'\n'}LIFE.
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.mint }]}>
              <Sparkles color={colors.textPrimary} size={32} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              Welcome to Statify
            </Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              Track tasks, manage your wallet, stay focused, and earn XP. All in one brutally simple app.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button 
            title="START GRINDING" 
            onPress={handleNext} 
            style={[styles.button, { backgroundColor: colors.accent }]}
            textStyle={styles.buttonText}
            rightIcon={ArrowRight}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  decorBox: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: Radius.md,
    zIndex: -1,
  },
  mainArea: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  hugeTitle: {
    fontFamily: 'Poppins_900Black',
    fontSize: 56,
    lineHeight: 56,
    letterSpacing: -2,
    marginBottom: Spacing.xl,
    textShadowColor: '#000',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
    color: '#FFF', 
  },
  card: {
    ...ClayShadow.card,
    padding: Spacing.xl,
    marginTop: Spacing.md,
    transform: [{ rotate: '-2deg' }],
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.displayMedium,
    marginBottom: Spacing.sm,
  },
  cardDesc: {
    ...Typography.body,
    lineHeight: 22,
  },
  footer: {
    paddingVertical: Spacing.xl,
  },
  button: {
    height: 64,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    transform: [{ rotate: '1deg' }],
  },
  buttonText: {
    fontFamily: 'Poppins_900Black',
    fontSize: 20,
    letterSpacing: 1,
  },
});
