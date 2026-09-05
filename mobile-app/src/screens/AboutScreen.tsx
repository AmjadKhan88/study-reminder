import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { spacing, radius } from '../theme/spacing';

// ⚠️ Replace these with your real links before building
const LINKS = {
  linkedin: 'https://www.linkedin.com/in/amjad-ullah-baa484246',
  github: 'https://github.com/AmjadKhan88',
  portfolio: 'https://amjadullah.vercel.app',
  email: 'mailto:amjadfast87@gmail.com',
  appDownloadUrl: 'https://studypilot-api-7ka1.onrender.com/download.html',
};

const APP_VERSION = '1.0.0';

export default function AboutScreen() {
  const { theme } = useAppTheme();

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `I've been using StudyPilot to plan my studies with AI — day-wise plans, flashcards, quizzes, all in one app. Check it out: ${LINKS.appDownloadUrl}`,
      });
    } catch {
      // user cancelled the share sheet — nothing to handle
    }
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>👋</Text>
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Hi, I'm Amjad</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          I built StudyPilot to help students turn any course outline into a real, day-by-day study plan — powered by AI.
          If it's helping you, I'd love to connect.
        </Text>
      </View>

      <View style={styles.linksGroup}>
        <LinkRow icon="logo-linkedin" label="Connect on LinkedIn" onPress={() => Linking.openURL(LINKS.linkedin)} theme={theme} />
        <LinkRow icon="logo-github" label="View on GitHub" onPress={() => Linking.openURL(LINKS.github)} theme={theme} />
        <LinkRow icon="globe-outline" label="My Portfolio" onPress={() => Linking.openURL(LINKS.portfolio)} theme={theme} />
        <LinkRow icon="mail-outline" label="Send Feedback" onPress={() => Linking.openURL(LINKS.email)} theme={theme} />
      </View>

      <Pressable onPress={handleShareApp} style={[styles.shareButton, { backgroundColor: theme.primary }]}>
        <Ionicons name="share-social-outline" size={18} color="#fff" />
        <Text style={styles.shareButtonText}>Share StudyPilot with a Friend</Text>
      </Pressable>

      <Text style={[styles.version, { color: theme.textSecondary }]}>StudyPilot v{APP_VERSION}</Text>
    </ScrollView>
  );
}

function LinkRow({ icon, label, onPress, theme }: any) {
  return (
    <Pressable onPress={onPress} style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Ionicons name={icon} size={20} color={theme.primary} />
      <Text style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '500', marginLeft: spacing.md, flex: 1 }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.md },
  avatar: { width: 64, height: 64, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 28 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.sm },
  linksGroup: { gap: spacing.sm, marginBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.lg, padding: spacing.md },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  shareButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  version: { textAlign: 'center', fontSize: 12 },
});