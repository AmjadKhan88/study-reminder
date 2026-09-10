import { useEffect, useRef, useState, memo, useMemo, useId } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';

mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'dark' });

/* ---------------- Copy button ---------------- */

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn('Failed to copy code:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2.5 py-1 rounded border transition-colors"
      style={{
        borderColor: '#3a3a3a',
        backgroundColor: '#2a2a2a',
        color: copied ? '#4ade80' : '#a1a1aa',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

/* ---------------- Code block ---------------- */

function CodeBlock({ language, code }) {
  return (
    <div className="my-3 rounded-lg overflow-hidden border" style={{ borderColor: '#3a3a3a' }}>
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }}
      >
        <span className="text-xs font-semibold uppercase" style={{ color: '#a1a1aa' }}>
          {language || 'text'}
        </span>
        <CopyButton code={code} />
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '14px', fontSize: '13px', background: '#1e1e1e' }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/* ---------------- Mermaid block ---------------- */

function MermaidBlock({ chart }) {
  const ref = useRef(null);
  const id = useId().replace(/:/g, '-');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    mermaid
      .render(`mermaid-${id}`, chart)
      .then(({ svg }) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="my-3 p-3 rounded-lg text-sm" style={{ background: '#2a1515', color: '#f87171' }}>
        Unable to render diagram.
      </div>
    );
  }

  return (
    <div
      className="my-3 p-3 rounded-lg overflow-x-auto border"
      style={{ borderColor: '#3a3a3a', background: '#1e1e1e' }}
      ref={ref}
    />
  );
}

/* ---------------- Language normalization (same map as RN version) ---------------- */

const LANGUAGE_ALIASES = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', h: 'cpp',
  sh: 'bash', shell: 'bash', zsh: 'bash',
  html: 'markup', xml: 'markup',
  yml: 'yaml', md: 'markdown',
  mysql: 'sql', postgres: 'sql', postgresql: 'sql',
};

function normalizeLanguage(lang) {
  if (!lang) return '';
  const n = lang.trim().toLowerCase();
  return LANGUAGE_ALIASES[n] || n;
}

/* ---------------- Main renderer ---------------- */

function AIContentRenderer({ content, className = '' }) {
  const components = useMemo(
    () => ({
      code({ inline, className: langClass, children, ...props }) {
        const match = /language-(\w+)/.exec(langClass || '');
        const rawLang = match?.[1];
        const codeString = String(children).replace(/\n$/, '');
        const lang = normalizeLanguage(rawLang);

        if (inline) {
          return (
            <code
              className="px-1 py-0.5 rounded text-sm"
              style={{ background: '#2a2a2a', color: '#C9922E' }}
              {...props}
            >
              {children}
            </code>
          );
        }

        if (lang === 'mermaid') return <MermaidBlock chart={codeString} />;

        return <CodeBlock language={lang} code={codeString} />;
      },
      h1: ({ children }) => <h1 className="text-2xl font-semibold mt-5 mb-3">{children}</h1>,
      h2: ({ children }) => <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>,
      h3: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>,
      p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
      ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
      blockquote: ({ children }) => (
        <blockquote
          className="pl-4 py-1 my-3 border-l-4"
          style={{ borderColor: '#C9922E', background: 'rgba(201,146,46,0.08)' }}
        >
          {children}
        </blockquote>
      ),
      a: ({ children, href }) => (
        <a href={href} target="_blank" rel="noreferrer" className="underline" style={{ color: '#4A5FE0' }}>
          {children}
        </a>
      ),
      table: ({ children }) => (
        <div className="overflow-x-auto my-3">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border px-3 py-2 text-left font-semibold" style={{ borderColor: '#D8D9CE' }}>
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border px-3 py-2" style={{ borderColor: '#D8D9CE' }}>
          {children}
        </td>
      ),
      hr: () => <hr className="my-4" style={{ borderColor: '#D8D9CE' }} />,
    }),
    []
  );

  if (!content?.trim()) return null;

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(AIContentRenderer);