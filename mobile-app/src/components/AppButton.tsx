import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, PressableProps } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';

interface Props extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export default function AppButton({ title, variant = 'primary', loading, disabled, style, ...rest }: Props) {
  const { theme } = useAppTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? theme.primary : 'transparent',
          borderWidth: isPrimary ? 0 : 1.5,
          borderColor: theme.primary,
          opacity: pressed ? 0.85 : disabled || loading ? 0.6 : 1,
        },
        style as any,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.primaryText : theme.primary} />
      ) : (
        <Text style={[styles.text, { color: isPrimary ? theme.primaryText : theme.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 16, fontWeight: '600' },
});