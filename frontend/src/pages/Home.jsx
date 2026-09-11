import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, Upload, Clock, Check, Lock, Sparkles, BrainCircuit, FileText, Flame, Plus,} from 'lucide-react';



const COURSES = {
  mern: {
    label: 'MERN Bootcamp',
    header: 'Full-Stack MERN — Job Ready',
    topics: '18 Modules',
    provider: 'Gemini',
    hours: '2h 00m / day',
    items: [
      { day: 'DAY 09', title: 'JWT auth & refresh token flow', desc: 'Access/refresh tokens, httpOnly cookies, protected routes', status: 'completed' },
      { day: 'DAY 10', title: 'File uploads & multer', desc: 'Multipart handling for lecture notes and course assets', status: 'completed' },
      { day: 'DAY 11', title: 'React Query & data fetching', desc: 'Caching, retries, and optimistic UI updates', status: 'current' },
      { day: 'DAY 12', title: 'Deploying to Render & Vercel', desc: 'Environment variables, CORS, and cross-domain cookies', status: 'locked' },
    ],
  },
  dsa: {
    label: 'DSA Interview Prep',
    header: 'Data Structures & Algorithms',
    topics: '24 Topics',
    provider: 'OpenAI',
    hours: '1h 30m / day',
    items: [
      { day: 'DAY 14', title: 'Sliding window technique', desc: 'Fixed and variable window patterns with examples', status: 'completed' },
      { day: 'DAY 15', title: 'Binary search on answer', desc: 'Recognizing monotonic search spaces', status: 'completed' },
      { day: 'DAY 16', title: 'Graph traversal: BFS vs DFS', desc: 'Shortest path, connected components, cycle detection', status: 'current' },
      { day: 'DAY 17', title: 'Dynamic programming basics', desc: 'Memoization vs tabulation, classic problems', status: 'locked' },
    ],
  },
  ielts: {
    label: 'IELTS Preparation',
    header: 'IELTS Academic — Band 7+',
    topics: '12 Modules',
    provider: 'Groq',
    hours: '1h 15m / day',
    items: [
      { day: 'DAY 04', title: 'Writing Task 2: argument essays', desc: 'Structuring a balanced opinion essay', status: 'completed' },
      { day: 'DAY 05', title: 'Listening: note completion', desc: 'Predicting answers before audio plays', status: 'completed' },
      { day: 'DAY 06', title: 'Speaking Part 2: cue cards', desc: 'Building a 2-minute response framework', status: 'current' },
      { day: 'DAY 07', title: 'Reading: True/False/Not Given', desc: 'Spotting distractors in academic passages', status: 'locked' },
    ],
  },
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeCourse, setActiveCourse] = useState('mern');
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const course = COURSES[activeCourse];

  return (
    <div className="sp-root" style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav className={`sp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-extrabold text-lg" style={{ letterSpacing: '-0.02em' }}>
            <span className="sp-logo-icon"><BookOpenCheck size={16} /></span>
            StudyPilot
          </a>
          <div className="hidden md:flex items-center gap-1">
            <a href="#how-it-works" className="sp-nav-link">How it works</a>
            <a href="#features" className="sp-nav-link">Features</a>
            <a href="#faq" className="sp-nav-link">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="sp-nav-link">Log in</Link>
            <Link to="/register" className="sp-btn sp-btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingTop: 150, paddingBottom: 40, textAlign: 'center' }}>
        <div className="flex flex-col items-center gap-4">
          <span className="sp-badge">
            <Sparkles size={14} /> AI-generated, day by day
          </span>
          <h1 className="sp-h1">
            Turn any outline into a<br />
            <span className="sp-serif-accent">study plan you'll actually follow.</span>
          </h1>
          <p className="sp-lead" style={{ maxWidth: 620, margin: '0 auto' }}>
            Give StudyPilot your topics and a deadline. It sequences daily lessons,
            flashcards, and quizzes — then keeps you honest with a streak you won't
            want to break.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
            <Link to="/register" className="sp-btn sp-btn-primary sp-btn-lg">
              <Upload size={17} /> Create your first plan
            </Link>
            <Link to="/login" className="sp-btn sp-btn-white sp-btn-lg">I have an account</Link>
          </div>
          <p className="text-sm mt-3" style={{ color: 'var(--text-tertiary)' }}>
            Free to use · Gemini, OpenAI, or Groq · No spreadsheets required
          </p>
        </div>

        {/* INTERACTIVE APP MOCKUP */}
        <div className="sp-app-viewport">
          <div className="sp-viewport-header">
            <div className="flex gap-1.5">
              <span className="sp-b-dot" /><span className="sp-b-dot" /><span className="sp-b-dot" />
            </div>
            <div className="sp-subject-switcher">
              {Object.entries(COURSES).map(([key, c]) => (
                <button
                  key={key}
                  className={`sp-subject-btn ${activeCourse === key ? 'active' : ''}`}
                  onClick={() => setActiveCourse(key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sp-app-grid">
            <div className="sp-app-sidebar">
              <div>
                <div className="sp-uploader-box">
                  <div className="sp-uploader-icon"><Upload size={18} /></div>
                  <p className="text-xs font-semibold">Upload your outline</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>PDF, DOCX or plain text</p>
                </div>
                <div className="flex flex-col gap-3 mt-5">
                  <div className="sp-meta-item">
                    <span className="sp-meta-label">Topics</span>
                    <span className="sp-meta-value">{course.topics}</span>
                  </div>
                  <div className="sp-meta-item">
                    <span className="sp-meta-label">AI provider</span>
                    <span className="sp-meta-value">{course.provider}</span>
                  </div>
                  <div className="sp-meta-item">
                    <span className="sp-meta-label">Daily target</span>
                    <span className="sp-meta-value">{course.hours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sp-main-view">
              <div className="sp-countdown-bar">
                <div className="flex items-center gap-3">
                  <span className="sp-pulse-ring" />
                  <span className="text-sm font-semibold">{course.header}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Updated just now</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {course.items.map((item) => (
                  <div key={item.day} className={`sp-day-card ${item.status === 'current' ? 'current' : ''}`}>
                    <span className="sp-day-badge">{item.day}</span>
                    <div className="sp-topic">
                      <h5>{item.title}</h5>
                      <p>{item.desc}</p>
                    </div>
                    <span className={`sp-chip ${item.status}`}>
                      {item.status === 'completed' ? 'Completed' : item.status === 'current' ? "Today's target" : 'Scheduled'}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      {item.status === 'completed' ? <Check size={15} /> : item.status === 'current' ? <Clock size={15} /> : <Lock size={15} />}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6" style={{ padding: '100px 24px' }}>
        <div className="text-center mb-14">
          <span className="sp-badge">Process</span>
          <h2 className="sp-h2 mt-4">From outline to habit, <span className="sp-serif-accent">in three steps.</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Describe what you\'re learning', body: 'Paste a syllabus or write your topics and set a deadline — weeks or months.' },
            { n: '02', title: 'Get a day-by-day plan', body: 'Your chosen AI breaks it into daily topics with explanations and time estimates.' },
            { n: '03', title: 'Study, review, repeat', body: 'Work through each day, test yourself with flashcards and quizzes, build a streak.' },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-mono text-sm font-semibold mb-3" style={{ color: 'var(--green-primary)' }}>{s.n}</p>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENTO FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6" style={{ paddingBottom: 100 }}>
        <div className="text-center mb-14">
          <span className="sp-badge">Features</span>
          <h2 className="sp-h2 mt-4">Everything a study session <span className="sp-serif-accent">actually needs.</span></h2>
        </div>
        <div className="sp-bento">
          <div className="sp-bento-cell" style={{ gridColumn: 'span 12 / span 12' }} data-full>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="sp-bento-icon"><FileText size={20} /></div>
                <h3>Ask questions about your own notes</h3>
                <p>Upload lecture PDFs, DOCX, or text files. StudyPilot reads them,
                  summarizes key concepts, and answers questions pulled straight
                  from what you uploaded — not a generic web answer.</p>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-tertiary)' }}>Ask AI about your notes</p>
                <div className="rounded p-3 text-sm mb-2" style={{ background: '#fff', border: '1px solid var(--border)' }}>
                  "What's the difference between SN1 and SN2 again?"
                </div>
                <div className="rounded p-3 text-sm" style={{ background: 'var(--green-tint)', border: '1px solid var(--green-border)', color: 'var(--green-dark)' }}>
                  Based on your Chapter 4 notes: SN1 is a two-step process via a
                  carbocation intermediate, while SN2 is a single concerted step...
                </div>
              </div>
            </div>
          </div>

          <div className="sp-bento-cell" style={{ gridColumn: 'span 12 / span 12' }}>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="sp-bento-icon" style={{ background: 'var(--green-dark)', borderColor: 'var(--green-dark)', color: '#fff' }}>
                  <Flame size={20} />
                </div>
                <h3>Streaks that mean it</h3>
                <p>Set a weekly goal in days and minutes. It tracks what you finish, not what you planned.</p>
              </div>
              <div>
                <div className="sp-bento-icon"><BrainCircuit size={20} /></div>
                <h3>Test yourself, same day</h3>
                <p>Every lesson ships with flashcards and a short quiz generated from that day's content.</p>
              </div>
              <div>
                <div className="sp-bento-icon"><Sparkles size={20} /></div>
                <h3>Pick your AI</h3>
                <p>Switch between Gemini, OpenAI, and Groq per course — compare or use what you already pay for.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6" style={{ paddingBottom: 100 }}>
        <div className="text-center mb-10">
          <span className="sp-badge">FAQ</span>
          <h2 className="sp-h2 mt-4">Questions, answered.</h2>
        </div>
        <div>
          {[
            { q: 'What formats can I upload for lecture notes?', a: 'PDF, DOCX, and plain text files up to 20MB. StudyPilot extracts the text and makes it searchable for the AI Q&A feature.' },
            { q: 'Can I use my own AI provider?', a: 'Yes — pick Gemini, OpenAI, or Groq per course, and set a default in Settings for new courses.' },
            { q: 'What happens if I miss a day?', a: 'Your streak resets, but your plan doesn\'t — every day stays available, so you can pick up right where you left off.' },
            { q: 'Is my data private?', a: 'Your notes and course content are tied to your account and are not shared with other users.' },
          ].map((item, i) => (
            <div key={i} className={`sp-faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="sp-faq-trigger" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                {item.q}
                <Plus size={18} />
              </button>
              <div className="sp-faq-body">
                <div className="sp-faq-body-inner">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingBottom: 100 }}>
        <div className="sp-cta-banner">
          <h2 className="sp-h2" style={{ fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', marginBottom: 14 }}>
            Stop staring at your outline.<br />
            <span className="sp-serif-accent">Start today's first 30 minutes.</span>
          </h2>
          <p className="sp-lead" style={{ margin: '0 auto 30px', maxWidth: 480 }}>
            Create your plan today and have an organized day-by-day roadmap before your next study session.
          </p>
          <Link to="/register" className="sp-btn sp-btn-primary sp-btn-lg">
            <Upload size={17} /> Create your plan — free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <a href="#" className="flex items-center gap-2 font-extrabold text-lg mb-3">
                <span className="sp-logo-icon"><BookOpenCheck size={16} /></span>
                StudyPilot
              </a>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Day-by-day AI study plans, flashcards, and quizzes for self-directed learners.
              </p>
            </div>
            <FooterCol title="Product" links={['How it works', 'Features', 'FAQ']} />
            <FooterCol title="Account" links={['Log in', 'Create account']} />
            <FooterCol title="Legal" links={['Privacy Policy', 'Terms of Service']} />
          </div>
          <div className="flex justify-between items-center flex-wrap gap-3 pt-8 mt-8 border-t text-xs" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}>
            <span>© {new Date().getFullYear()} StudyPilot. All rights reserved.</span>
            <span>Built for genuine focus.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h5 className="text-sm font-semibold mb-3">{title}</h5>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm" style={{ color: 'var(--text-muted)' }}>{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}