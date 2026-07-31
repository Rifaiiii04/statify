import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Radius, Typography } from '@/constants/design';
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
        { backgroundColor: colors.surfaceHigh, borderColor: colors.border },
        focused && { borderColor: colors.yellow },
        error ? { borderColor: colors.danger } : null,
      ]}>
        {Icon && <Icon color={focused ? colors.yellow : colors.textSecondary} size={18} style={styles.leftIcon} />}
        <TextInput
          style={[styles.input, { color: colors.textPrimary }, style]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.yellow}
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
      {error && <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>}
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
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  leftIcon: { marginRight: 10 },
  rightIcon: { padding: 4 },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    // @ts-ignore: outlineStyle is a web-only property
    outlineStyle: 'none',
  },
  errorText: { ...Typography.bodySmall, marginTop: 6 },
  hintText: { ...Typography.bodySmall, marginTop: 6 },
});
