import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }} className="bg-[#FCFAF4] text-[#132A3A]">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
      <span style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-semibold">
        StudyPilot
      </span>
      <nav className="hidden md:flex items-center gap-8 text-sm text-[#5A7A8C]">
        <a href="#features" className="hover:text-[#132A3A]">Features</a>
        <a href="#how" className="hover:text-[#132A3A]">How it works</a>
        <Link to="/login" className="hover:text-[#132A3A]">Log in</Link>
      </nav>
      <Link
        to="/register"
        className="text-sm font-medium bg-[#132A3A] text-[#FCFAF4] px-4 py-2 rounded-sm hover:bg-[#0d1f2c] transition-colors"
      >
        Get started
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-12 pb-24 grid md:grid-cols-2 gap-16 items-center">
      <div>
        <h1
          style={{ fontFamily: 'var(--font-display)' }}
          className="text-5xl md:text-[3.4rem] leading-[1.08] font-medium tracking-tight"
        >
          Tell it what you're
          <br />
          learning.
          <br />
          <span className="relative inline-block">
            It builds the plan.
            <svg
              className="absolute left-0 -bottom-2 w-full"
              height="10"
              viewBox="0 0 300 10"
              preserveAspectRatio="none"
            >
              <path d="M2 7 Q150 2 298 7" stroke="#F4B740" strokeWidth="5" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="mt-7 text-lg text-[#3F5B6B] max-w-md leading-relaxed">
          Give StudyPilot a topic and a deadline. It lays out a day-by-day
          plan, writes the lessons, and quizzes you as you go — so you spend
          your time learning, not planning.
        </p>

        <div className="mt-9 flex items-center gap-4">
          <Link
            to="/register"
            className="bg-[#132A3A] text-[#FCFAF4] px-6 py-3 rounded-sm text-sm font-medium hover:bg-[#0d1f2c] transition-colors"
          >
            Start your first plan
          </Link>
          <a href="#how" className="text-sm font-medium text-[#132A3A] underline decoration-[#5A7A8C] underline-offset-4">
            See how it works
          </a>
        </div>
      </div>

      <DayCardMockup />
    </section>
  );
}

function DayCardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-3 border border-[#5A7A8C]/25 rounded-sm -rotate-1" aria-hidden="true" />
      <div className="relative bg-[#132A3A] text-[#FCFAF4] rounded-sm p-7 shadow-[0_20px_50px_-15px_rgba(19,42,58,0.4)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8FA9B8]">Day 12 of 30</p>
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-xl mt-1">
              Neural Network Basics
            </p>
          </div>
          <ProgressRing percent={68} />
        </div>

        <ul className="mt-6 space-y-3 text-sm">
          <CheckItem label="Read: Forward propagation" done />
          <CheckItem label="Key concepts: 4 flashcards" done />
          <CheckItem label="Quiz: 8 questions" />
          <CheckItem label="Log today's session" />
        </ul>

        <div className="mt-6 pt-5 border-t border-[#2D4456] flex items-center justify-between text-xs text-[#8FA9B8]">
          <span>~45 min today</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4B740]" />
            9-day streak
          </span>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, done }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center ${
          done ? 'bg-[#F4B740] border-[#F4B740]' : 'border-[#5A7A8C]'
        }`}
      >
        {done && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.2 5.5L8 1" stroke="#132A3A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={done ? 'text-[#C8D6DD] line-through decoration-[#5A7A8C]' : ''}>{label}</span>
    </li>
  );
}

function ProgressRing({ percent }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#2D4456" strokeWidth="4" />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="#F4B740"
        strokeWidth="4"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text x="26" y="30" textAnchor="middle" fontSize="12" fill="#FCFAF4">
        {percent}%
      </text>
    </svg>
  );
}

function Stats() {
  const items = [
    { value: 'Any topic', label: 'you type an outline, it structures the plan' },
    { value: 'Day by day', label: 'lessons, flashcards and quizzes generated as you go' },
    { value: 'Your notes', label: 'upload lecture PDFs and ask questions against them' },
  ];
  return (
    <section className="border-y border-[#5A7A8C]/20 bg-[#EDEAE0]">
      <div className="max-w-6xl mx-auto px-6 py-10 grid sm:grid-cols-3 gap-8">
        {items.map((item) => (
          <div key={item.value}>
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl">
              {item.value}
            </p>
            <p className="text-sm text-[#5A7A8C] mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: 'A plan built around your outline',
      body: 'Describe what you want to learn and pick a timeframe. StudyPilot breaks it into daily topics sized to fit the time you actually have.',
      align: 'left',
    },
    {
      title: 'Lessons, flashcards and quizzes per day',
      body: 'Each day unlocks its own lesson content, key concepts, a flashcard set to review, and a quiz to check what stuck.',
      align: 'right',
    },
    {
      title: 'Ask your own lecture notes',
      body: 'Upload PDFs, DOCX, or text files. StudyPilot reads them and answers questions using what you uploaded — not a generic answer.',
      align: 'left',
    },
    {
      title: 'Streaks that track real study time',
      body: 'Every session you log builds your streak and rolls up into a weekly goal, so you can see the habit forming.',
      align: 'right',
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24 space-y-16">
      {features.map((f) => (
        <div
          key={f.title}
          className={`grid md:grid-cols-2 gap-10 items-center ${f.align === 'right' ? 'md:[&>*:first-child]:order-2' : ''}`}
        >
          <div className="border border-[#5A7A8C]/25 rounded-sm p-8 bg-[#FCFAF4]">
            <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl mb-3">
              {f.title}
            </h3>
            <p className="text-[#3F5B6B] leading-relaxed">{f.body}</p>
          </div>
          <div className="h-full min-h-[180px] rounded-sm bg-[#132A3A]/[0.03] border border-dashed border-[#5A7A8C]/30" />
        </div>
      ))}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '1', title: 'Add a course', body: 'Give it a title, an outline of what to cover, and a duration.' },
    { n: '2', title: 'Get your plan', body: 'AI lays out each day — topic, subtopics and estimated time.' },
    { n: '3', title: 'Study & track', body: 'Work through lessons, flashcards and quizzes, day by day.' },
  ];
  return (
    <section id="how" className="bg-[#132A3A] text-[#FCFAF4]">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl mb-14 max-w-md">
          Three steps from topic to habit
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s) => (
            <div key={s.n}>
              <span
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-[#F4B740] text-4xl"
              >
                {s.n}
              </span>
              <h3 className="text-lg font-medium mt-4 mb-2">{s.title}</h3>
              <p className="text-[#B7C7CF] text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 text-center">
      <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl md:text-4xl max-w-xl mx-auto">
        Pick a topic. Start day one today.
      </h2>
      <Link
        to="/register"
        className="inline-block mt-8 bg-[#132A3A] text-[#FCFAF4] px-7 py-3.5 rounded-sm text-sm font-medium hover:bg-[#0d1f2c] transition-colors"
      >
        Create your free plan
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#5A7A8C]/20">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#5A7A8C]">
        <span style={{ fontFamily: 'var(--font-display)' }}>StudyPilot</span>
        <div className="flex gap-6">
          <Link to="/login" className="hover:text-[#132A3A]">Log in</Link>
          <Link to="/register" className="hover:text-[#132A3A]">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}