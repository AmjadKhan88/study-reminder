import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { logSessionRequest } from '../api/session.api';
import { spacing, radius } from '../theme/spacing';

type TimerState = 'idle' | 'running' | 'paused' | 'finished';

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StudySessionScreen({ route, navigation }: any) {
  const { courseId, dayNumber, topic, estimatedMinutes } = route.params;
  const { theme } = useAppTheme();

  const [targetMinutes] = useState<number>(estimatedMinutes || 25);
  const [secondsLeft, setSecondsLeft] = useState(targetMinutes * 60);
  const [state, setState] = useState<TimerState>('idle');
  const [saving, setSaving] = useState(false);
  const startedAtRef = useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: `Focus: ${topic}` });
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const tick = () => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState('finished');
        Vibration.vibrate([0, 300, 150, 300]);
        return 0;
      }
      return prev - 1;
    });
  };

  const handleStart = () => {
    if (state === 'idle') startedAtRef.current = new Date();
    setState('running');
    intervalRef.current = setInterval(tick, 1000);
  };

  const handlePause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState('paused');
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(targetMinutes * 60);
    setState('idle');
    startedAtRef.current = null;
  };

  const saveSession = async (completedFully: boolean) => {
    if (!startedAtRef.current) {
      navigation.goBack();
      return;
    }
    setSaving(true);
    const elapsedSeconds = targetMinutes * 60 - secondsLeft;
    const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    try {
      await logSessionRequest(courseId, dayNumber, {
        targetMinutes,
        actualMinutes,
        completedFully,
        startedAt: startedAtRef.current.toISOString(),
        endedAt: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
      navigation.goBack();
    }
  };

  const handleStopEarly = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    saveSession(false);
  };

  const progress = 1 - secondsLeft / (targetMinutes * 60);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.center}>
        <View style={[styles.ring, { borderColor: theme.surfaceAlt }]}>
          <View
            style={[
              styles.ringFill,
              {
                borderColor: state === 'finished' ? theme.success : theme.primary,
                transform: [{ rotate: `${progress * 360}deg` }],
              },
            ]}
          />
          <Text style={[styles.time, { color: theme.textPrimary }]}>{formatTime(secondsLeft)}</Text>
          <Text style={[styles.stateLabel, { color: theme.textSecondary }]}>
            {state === 'finished' ? "Time's up! 🎉" : `Target: ${targetMinutes} min`}
          </Text>
        </View>
      </View>

      {state === 'finished' ? (
        <Pressable
          onPress={() => saveSession(true)}
          style={[styles.primaryButton, { backgroundColor: theme.success }]}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Done'}</Text>
        </Pressable>
      ) : (
        <View>
          <View style={styles.controlsRow}>
            {state === 'running' ? (
              <ControlButton icon="pause" label="Pause" onPress={handlePause} theme={theme} />
            ) : (
              <ControlButton icon="play" label={state === 'paused' ? 'Resume' : 'Start'} onPress={handleStart} primary theme={theme} />
            )}
            <ControlButton icon="refresh" label="Reset" onPress={handleReset} theme={theme} />
          </View>
          {state !== 'idle' && (
            <Pressable onPress={handleStopEarly} disabled={saving} style={styles.stopLink}>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                {saving ? 'Saving...' : 'End session early'}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function ControlButton({ icon, label, onPress, primary, theme }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.controlButton,
        { backgroundColor: primary ? theme.primary : theme.surfaceAlt },
      ]}
    >
      <Ionicons name={icon} size={26} color={primary ? theme.primaryText : theme.textPrimary} />
      <Text style={{ color: primary ? theme.primaryText : theme.textPrimary, fontSize: 12, marginTop: 4, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: spacing.xl, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringFill: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  time: { fontSize: 48, fontWeight: '800', fontVariant: ['tabular-nums'] },
  stateLabel: { fontSize: 14, marginTop: 6 },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg },
  controlButton: { width: 84, height: 84, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  stopLink: { alignItems: 'center', marginTop: spacing.lg },
  primaryButton: { paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});