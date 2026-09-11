import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#EDEEE6', color: '#1C2333' }}>
      <style>{`
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Nav */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between font-body">
        <span className="font-display text-xl font-semibold tracking-tight">StudyPilot</span>
        <nav className="flex items-center gap-6">
          <Link to="/login" className="text-sm hover:opacity-70 transition-opacity">
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm px-4 py-2 rounded-sm text-white"
            style={{ background: '#1C2333' }}
          >
            Start planning
          </Link>
        </nav>
      </header>

      {/* Hero — the one orchestrated motion sequence on the page */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="font-body text-sm mb-4"
            style={{ color: '#C9922E' }}
          >
            Tell it what you want to learn
          </motion.p>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-display text-5xl md:text-6xl leading-[1.05] font-semibold tracking-tight"
          >
            A study plan, written for the day you're actually having.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="font-body text-lg mt-6 max-w-md"
            style={{ color: '#4A5163' }}
          >
            Give StudyPilot an outline and a deadline. It breaks it into daily
            lessons, flashcards, and quizzes — then keeps you honest with a
            streak you won't want to break.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex items-center gap-4 mt-8 font-body"
          >
            <Link
              to="/register"
              className="px-6 py-3 rounded-sm text-white text-sm font-medium inline-block transition-transform hover:-translate-y-0.5"
              style={{ background: '#1C2333' }}
            >
              Create your first plan
            </Link>
            <Link to="/login" className="text-sm underline underline-offset-4">
              I already have an account
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="flex gap-8 mt-12 font-body"
          >
            <Stat value="3" label="AI providers to choose from" />
            <Stat value="1" label="plan, broken into daily steps" />
            <Stat value="0" label="spreadsheets required" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: 4 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <DayCardScene />
        </motion.div>
      </section>

      {/* How it works */}
      <section className="border-t" style={{ borderColor: '#D8D9CE' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold mb-12 max-w-md">
              From outline to habit, in three steps.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-10 font-body">
            <Reveal delay={0}>
              <Step n="01" title="Describe what you're learning" body="Paste your syllabus, a course outline, or just write out the topics. Set a deadline — a few weeks or a few months." />
            </Reveal>
            <Reveal delay={0.1}>
              <Step n="02" title="Get a day-by-day plan" body="Your chosen AI provider breaks it into daily topics with explanations, key concepts, and study time estimates." />
            </Reveal>
            <Reveal delay={0.2}>
              <Step n="03" title="Study, review, repeat" body="Work through each day, test yourself with generated flashcards and quizzes, and watch your streak build." />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t" style={{ borderColor: '#D8D9CE' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 font-body">
          <div className="grid md:grid-cols-5 gap-8">
            <Reveal className="md:col-span-3">
              <FeatureCard
                title="Ask questions about your own notes"
                body="Upload lecture PDFs, DOCX, or text files. StudyPilot reads them, summarizes the key concepts, and answers questions pulled straight from what you uploaded — not a generic web answer."
              />
            </Reveal>
            <Reveal className="md:col-span-2" delay={0.1}>
              <FeatureCard
                dark
                title="Streaks that mean it"
                body="Set a weekly goal in days and minutes. StudyPilot tracks what you actually finish, not what you planned to."
              />
            </Reveal>
            <Reveal className="md:col-span-2">
              <FeatureCard
                title="Test yourself, same day"
                body="Every day's lesson comes with flashcards and a short quiz generated from that day's content — no separate prep."
              />
            </Reveal>
            <Reveal className="md:col-span-3" delay={0.1}>
              <FeatureCard
                title="Pick the AI that works for you"
                body="Switch between Gemini, OpenAI, and Groq per course, so you can compare explanations or just use what you already pay for."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-24" style={{ background: '#1C2333' }}>
        <Reveal className="max-w-2xl mx-auto text-center font-body">
          <h2 className="font-display text-4xl font-semibold text-white mb-4">
            Stop staring at a syllabus.
          </h2>
          <p style={{ color: '#B9BCC9' }} className="mb-8">
            Turn it into a plan you can actually follow, one day at a time.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 rounded-sm text-sm font-medium transition-transform hover:-translate-y-0.5"
            style={{ background: '#C9922E', color: '#1C2333' }}
          >
            Create your first plan
          </Link>
        </Reveal>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 font-body text-xs" style={{ color: '#7A8095' }}>
        StudyPilot — AI-generated study plans, flashcards, and quizzes for self-directed learners.
      </footer>
    </div>
  );
}

/* ---------------- Scroll-reveal wrapper (one style, used consistently) ---------------- */

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="text-xs mt-1 max-w-[9rem]" style={{ color: '#7A8095' }}>{label}</p>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <div>
      <p className="font-display text-sm mb-3" style={{ color: '#C9922E' }}>{n}</p>
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm" style={{ color: '#4A5163' }}>{body}</p>
    </div>
  );
}

function FeatureCard({ title, body, dark }) {
  return (
    <div
      className="rounded-sm p-8 h-full"
      style={
        dark
          ? { background: '#1C2333', color: '#EDEEE6' }
          : { background: '#FAFAF6', border: '1px solid #D8D9CE' }
      }
    >
      <h3 className="font-display text-2xl font-semibold mb-3">{title}</h3>
      <p style={{ color: dark ? '#B9BCC9' : '#4A5163' }}>{body}</p>
    </div>
  );
}

/* ---------------- Hero illustration: animated planner scene (no stock imagery) ---------------- */

function DayCardScene() {
  return (
    <div className="relative" style={{ transform: 'rotate(-2deg)' }}>
      {/* Back page peeking out */}
      <div
        className="absolute inset-0 -z-10 rounded-sm"
        style={{
          background: '#FAFAF6',
          border: '1px solid #D8D9CE',
          transform: 'rotate(3deg) translate(10px, 14px)',
        }}
      />

      <div
        className="rounded-sm p-7 font-body relative overflow-hidden"
        style={{ background: '#FAFAF6', border: '1px solid #D8D9CE', boxShadow: '10px 14px 0px #D8D9CE' }}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-lg font-semibold">Day 14 of 30</p>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            className="text-xs px-2 py-1 rounded-sm"
            style={{ background: '#F0E4CD', color: '#946A15' }}
          >
            🔥 6-day streak
          </motion.span>
        </div>

        <p className="text-sm mb-1" style={{ color: '#7A8095' }}>Organic Chemistry</p>
        <p className="font-display text-2xl font-semibold mb-4">Reaction mechanisms: SN1 vs SN2</p>

        <div className="space-y-2.5">
          <ChecklistRow done label="Read core concepts" delay={0.4} />
          <ChecklistRow done label="Review 12 flashcards" delay={0.55} />
          <ChecklistRow label="Take the day's quiz" delay={0.7} />
        </div>

        <div className="mt-6 pt-5 flex items-center justify-between" style={{ borderTop: '1px solid #D8D9CE' }}>
          <span className="text-xs" style={{ color: '#7A8095' }}>Est. 45 min</span>
          <span className="text-xs font-medium" style={{ color: '#2F6B4F' }}>2 of 3 done</span>
        </div>
      </div>

      {/* Floating flashcard, drifts gently — the single "alive" accent element */}
      <motion.div
        className="absolute -right-8 -top-6 rounded-sm p-3 hidden md:block"
        style={{ background: '#1C2333', width: 108, boxShadow: '4px 6px 0px rgba(0,0,0,0.15)' }}
        initial={{ y: 0, rotate: 8 }}
        animate={{ y: [0, -8, 0], rotate: [8, 10, 8] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <p className="text-[10px]" style={{ color: '#B9BCC9' }}>Flashcard</p>
        <p className="text-xs mt-1" style={{ color: '#EDEEE6' }}>SN2 = one step</p>
      </motion.div>
    </div>
  );
}

function ChecklistRow({ label, done, delay = 0 }) {
  return (
    <motion.div
      className="flex items-center gap-3 text-sm"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <span
        className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0"
        style={{ background: done ? '#2F6B4F' : 'transparent', border: done ? 'none' : '1px solid #B9BCC9' }}
      >
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <motion.path
              d="M1.5 5L4 7.5L8.5 2"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.3 }}
            />
          </svg>
        )}
      </span>
      <span style={{ color: done ? '#4A5163' : '#1C2333', textDecoration: done ? 'line-through' : 'none' }}>
        {label}
      </span>
    </motion.div>
  );
}