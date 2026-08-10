import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Check } from 'lucide-react-native';
import { Spacing, Typography, ClayShadow, Radius } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { completeOnboarding } from '@/db/repositories/stats-repository';

export default function OnboardNameScreen() {
  const { colors } = useThemeContext();
  const router = useRouter();
  
  const [username, setUsername] = useState('');

  const handleComplete = async () => {
    if (!username.trim()) {
      Alert.alert('Hold up!', 'Please enter your name to continue.');
      return;
    }
    try {
      await completeOnboarding(username.trim());
      router.replace('/(tabs)' as any);
    } catch (e) {
      Alert.alert('Error', 'Failed to save user data.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.purple }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Decorative background blocks */}
          <View style={[styles.bgBlock, { backgroundColor: colors.mint, top: -50, right: -20, transform: [{ rotate: '12deg' }] }]} />
          
          <Text style={[styles.title, { color: '#FFF' }]}>
            WHO{'\n'}ARE{'\n'}YOU?
          </Text>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.amber }]}>
              <User color={colors.black} size={40} />
            </View>
            
            <Text style={[styles.promptText, { color: colors.textSecondary }]}>
              ENTER YOUR ALIAS
            </Text>
            
            <View style={styles.inputWrapper}>
              <InputField 
                placeholder="e.g. John Doe" 
                value={username}
                onChangeText={setUsername}
                autoFocus
                style={styles.customInput}
              />
            </View>
            
            <Button 
              title="LET'S GO" 
              onPress={handleComplete} 
              style={[styles.button, { backgroundColor: colors.coral }]}
              textStyle={styles.buttonText}
              rightIcon={Check}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgBlock: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderWidth: 4,
    borderColor: '#000',
    borderRadius: Radius.md,
    zIndex: -1,
  },
  title: {
    fontFamily: 'Poppins_900Black',
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -2,
    marginBottom: Spacing.xl,
    textShadowColor: '#000',
    textShadowOffset: { width: 5, height: 5 },
    textShadowRadius: 0,
    transform: [{ rotate: '-4deg' }],
  },
  card: {
    ...ClayShadow.card,
    padding: Spacing.xl,
    alignItems: 'stretch',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    borderWidth: 4,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    alignSelf: 'center',
    transform: [{ translateY: -60 }],
    position: 'absolute',
  },
  promptText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: 30, // Make room for the absolute icon
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: Spacing.xl,
  },
  customInput: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    height: 64,
    borderBottomWidth: 8,
    borderRightWidth: 8,
  },
  buttonText: {
    fontFamily: 'Poppins_900Black',
    fontSize: 22,
    letterSpacing: 1,
  },
});
