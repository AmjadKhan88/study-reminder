import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';

interface Props extends TextInputProps {
  label: string;
  errorText?: string;
}

export default function AppTextInput({ label, errorText, style, ...rest }: Props) {
  const { theme } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            backgroundColor: theme.surfaceAlt,
            color: theme.textPrimary,
            borderColor: errorText ? theme.danger : focused ? theme.primary : theme.border,
          },
          style as any,
        ]}
        {...rest}
      />
      {!!errorText && <Text style={[styles.error, { color: theme.danger }]}>{errorText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { fontSize: 12, marginTop: 4 },
});