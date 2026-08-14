# StudyPilot — AI Study Planner (Project Instructions)

## What this is
A multi-tenant SaaS mobile app that turns a course outline + duration into a
day-by-day AI-generated study plan, with reminders, flashcards, quizzes, and
progress tracking. Target: students worldwide. Budget-conscious ($500 build),
must NOT look/feel "AI-generated" — needs real UI/UX design thinking, dark +
light themes, professional visual identity.

## Core user flow
1. User signs up / logs in.
2. User creates a "Course" — adds a title, uploads/pastes course outline or
   syllabus (and optionally lecture notes/content).
3. User sets course duration (e.g. 6 months) and target end date.
4. User picks an AI provider from a dropdown: Gemini / OpenAI / Groq
   (user supplies their own API key OR platform uses shared keys — decide
   per user's billing plan).
5. AI generates a day-wise study plan: topics per day, learning objectives,
   study material summaries, and daily tips, until course completion.
6. AI also summarizes uploaded lecture notes into key concepts automatically.
7. Each day, user can:
   - View today's content/topics
   - Generate a quiz on today's/past topics
   - Generate flashcards for retention
   - Mark progress complete
8. Push notifications remind the user of daily study tasks / streaks.
9. Progress charts show completion %, streaks, quiz scores over time.
10. Every user has isolated data: their own courses, plans, progress, records.

## Non-negotiable technical requirements
- **Frontend**: React Native (Expo), published to Google Play Store.
- **Backend**: Node.js, deployed on Render, in a SEPARATE top-level folder
  from the frontend (monorepo with two independent folders, not nested).
- **Multi-tenant SaaS architecture**: strict per-user data isolation at the
  DB query layer, not just UI-level filtering.
- **Scalable cloud infra**: stateless backend (horizontally scalable),
  externalized sessions/queues, DB indexed for scale from day one.
- **Security**: encrypted secrets, hashed passwords (bcrypt/argon2), JWT auth
  with refresh tokens, HTTPS only, input validation/sanitization on every
  endpoint, rate limiting, GDPR-style data export/delete support.
- **Multi-AI support**: pluggable AI provider layer — Gemini, OpenAI, Groq —
  selectable per-user via dropdown, swappable without touching business logic
  (adapter/strategy pattern).
- **Push notifications**: Expo push notifications for study reminders.
- **Design**: custom design system, NOT default AI-generated look. Real
  color palette, typography scale, spacing system. Full dark mode + light
  mode. Clean, professional, student-friendly UI.

## Working agreement with Claude
- Claude acts as senior full-stack dev + product planner + UI designer.
- We build **day by day**, one deliverable chunk per session — never dump
  the whole app in one response.
- Claude gives code/commands in chat. The user copies/creates files
  themselves in their local folder (connected via Filesystem). Claude does
  NOT write directly into the project folder.
- Claude only reads the local folder to re-sync context if a session has
  lost track of progress — not by default every turn.
- Before each new "day," Claude briefly recaps what's done and what today
  covers.
- Keep a running PROGRESS.md (maintained by the user, Claude provides
  updates to paste in) tracking completed days/features.

## Out of scope for v1 (revisit later)
- Web app version (mobile-first only for now)
- iOS App Store release (Play Store first)
- Payment/subscription billing (build data model to support it, but no
  Stripe integration in v1)
- Social/community features
