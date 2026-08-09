import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, TextInputProps, Platform } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Radius, Typography, ClayShadow } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';

interface InputFieldProps extends TextInputProps {
  label?: string;
  icon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconPress?: () => void;
  error?: string;
  hint?: string;
}

export function InputField({
  label,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconPress,
  error,
  hint,
  style,
  onFocus,
  onBlur,
  ...props
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const { colors } = useThemeContext();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        ClayShadow.soft, focused && { shadowColor: colors.accent },
        error ? { shadowColor: colors.coral } : null]}>
        {Icon && <Icon color={focused ? colors.accent : colors.textSecondary} size={18} style={styles.leftIcon} />}
        <TextInput
          style={[
            styles.input, 
            { color: colors.textPrimary }, 
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
            style
          ]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...props}
        />
        {RightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <RightIcon color={colors.textSecondary} size={18} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: colors.coral }]}>{error}</Text>}
      {hint && !error && <Text style={[styles.hintText, { color: colors.textSecondary }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    ...Typography.label,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  leftIcon: { marginRight: 10 },
  rightIcon: { padding: 4 },
  input: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    paddingVertical: 12,
  },
  errorText: { ...Typography.bodySmall, marginTop: 6 },
  hintText: { ...Typography.bodySmall, marginTop: 6 },
});
