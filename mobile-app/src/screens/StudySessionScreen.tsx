import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Vibration, AppState } from 'react-native';
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
  const targetSeconds = targetMinutes * 60;

  const [secondsLeft, setSecondsLeft] = useState(targetSeconds);
  const [state, setState] = useState<TimerState>('idle');
  const [saving, setSaving] = useState(false);

  const startedAtRef = useRef<Date | null>(null);
  const endAtRef = useRef<number | null>(null); // epoch ms when timer should hit zero — only set while running
  const remainingSecRef = useRef<number>(targetSeconds); // authoritative remaining time whenever not running
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: `Focus: ${topic}` });
  }, []);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Recomputes remaining time from real elapsed wall-clock time rather than
  // counting ticks — this is what makes the timer immune to drift/freezing
  // when the screen locks, the app backgrounds, or the JS thread stalls.
  const recompute = () => {
    if (endAtRef.current == null) return;
    const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    remainingSecRef.current = remaining;
    setSecondsLeft(remaining);
    if (remaining <= 0) {
      clearTimer();
      endAtRef.current = null;
      setState('finished');
      Vibration.vibrate([0, 300, 150, 300]);
    }
  };

  // Force an immediate resync the moment the app returns to the foreground,
  // instead of waiting up to 1s for the next interval tick.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active' && state === 'running') recompute();
    });
    return () => sub.remove();
  }, [state]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const handleStart = () => {
    if (state === 'idle') startedAtRef.current = new Date();
    endAtRef.current = Date.now() + remainingSecRef.current * 1000;
    setState('running');
    clearTimer();
    intervalRef.current = setInterval(recompute, 1000);
  };

  const handlePause = () => {
    clearTimer();
    if (endAtRef.current != null) {
      remainingSecRef.current = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setSecondsLeft(remainingSecRef.current);
    }
    endAtRef.current = null;
    setState('paused');
  };

  const handleReset = () => {
    clearTimer();
    endAtRef.current = null;
    remainingSecRef.current = targetSeconds;
    setSecondsLeft(targetSeconds);
    setState('idle');
    startedAtRef.current = null;
  };

  const saveSession = async (completedFully: boolean) => {
    if (!startedAtRef.current) {
      navigation.goBack();
      return;
    }
    setSaving(true);
    const elapsedSeconds = targetSeconds - remainingSecRef.current;
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
    clearTimer();
    if (endAtRef.current != null) {
      remainingSecRef.current = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    }
    endAtRef.current = null;
    saveSession(false);
  };

  const progress = 1 - secondsLeft / targetSeconds;

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