import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Radius, Typography } from '@/constants/design';
import { useThemeContext } from '@/context/theme-context';

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Button({
  title,
  onPress,
  icon: Icon,
  loading,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
}: ButtonProps) {
  const { colors } = useThemeContext();
  const isDisabled = disabled || loading;

  const containerVariants: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.yellow },
    secondary: { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.border },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.yellow },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.danger },
  };

  const textColors: Record<string, string> = {
    primary: colors.black,
    secondary: colors.textPrimary,
    outline: colors.yellow,
    ghost: colors.yellow,
    danger: colors.white,
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.sm, minHeight: 36 },
    md: { paddingVertical: 13, paddingHorizontal: 20, borderRadius: Radius.md, minHeight: 48 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: Radius.md, minHeight: 56 },
  };

  const iconColor = textColors[variant];

  return (
    <TouchableOpacity
      style={[styles.base, sizeStyles[size], containerVariants[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {Icon && <Icon color={iconColor} size={size === 'sm' ? 16 : 18} style={styles.icon} />}
          {title ? <Text style={[styles.text, { color: textColors[variant] }]}>{title}</Text> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { marginRight: 8 },
  text: { ...Typography.label, fontWeight: '600' as const },
  disabled: { opacity: 0.45 },
});
