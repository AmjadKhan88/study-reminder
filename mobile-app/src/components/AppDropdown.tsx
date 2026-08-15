import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/spacing';

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AppDropdown({ label, value, options, onChange, placeholder = 'Select...' }: Props) {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
      >
        <Text style={{ color: selected ? theme.textPrimary : theme.textSecondary, fontSize: 16 }}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[styles.option, { backgroundColor: item.value === value ? theme.surfaceAlt : 'transparent' }]}
                >
                  <Text style={{ color: theme.textPrimary, fontSize: 16 }}>{item.label}</Text>
                  {item.value === value && <Ionicons name="checkmark" size={18} color={theme.primary} />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  trigger: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '60%' },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
});