import React, { memo, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Markdown, {
  RenderRules,
} from 'react-native-markdown-display';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';
import Prism from 'prismjs';

// Prism language support
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';

import { Theme } from '../theme/colors';

type AIContentRendererProps = {
  content: string;
  theme: Theme;
  fontSize?: number;
  lineHeight?: number;
};

type CodeBlockProps = {
  code: string;
  language?: string;
  theme: Theme;
};

type WebViewBlockProps = {
  html: string;
  height?: number;
  theme: Theme;
};

/* -------------------------------------------------------------------------- */
/*                              LANGUAGE HELPERS                              */
/* -------------------------------------------------------------------------- */

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',

  ts: 'typescript',
  tsx: 'typescript',

  py: 'python',

  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  h: 'cpp',

  c: 'c',

  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',

  html: 'markup',
  xml: 'markup',

  yml: 'yaml',
  md: 'markdown',

  mysql: 'sql',
  postgres: 'sql',
  postgresql: 'sql',
};

function normalizeLanguage(language?: string): string {
  if (!language) return 'javascript';

  const normalized = language
    .trim()
    .toLowerCase()
    .replace(/^language-/, '');

  return LANGUAGE_ALIASES[normalized] || normalized;
}

/* -------------------------------------------------------------------------- */
/*                              ESCAPE HELPERS                                */
/* -------------------------------------------------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* -------------------------------------------------------------------------- */
/*                              COPY BUTTON                                   */
/* -------------------------------------------------------------------------- */

const CopyButton = memo(
  ({
    code,
    theme,
  }: {
    code: string;
    theme: Theme;
  }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await Clipboard.setStringAsync(code);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1500);
      } catch (error) {
        console.warn('Failed to copy code:', error);
      }
    };

    return (
      <Pressable
        onPress={handleCopy}
        style={({ pressed }) => [
          styles.copyButton,
          {
            backgroundColor: theme.surfaceAlt,
            borderColor: theme.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.copyButtonText,
            {
              color: copied ? theme.success : theme.textSecondary,
            },
          ]}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </Text>
      </Pressable>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*                           PRISM TOKEN RENDERER                             */
/* -------------------------------------------------------------------------- */

const TOKEN_COLORS: Record<string, string> = {
  comment: '#6A9955',
  prolog: '#6A9955',
  doctype: '#6A9955',
  cdata: '#6A9955',

  punctuation: '#D4D4D4',

  property: '#9CDCFE',
  tag: '#569CD6',
  boolean: '#569CD6',
  number: '#B5CEA8',
  constant: '#4FC1FF',
  symbol: '#4FC1FF',

  selector: '#D7BA7D',
  'attr-name': '#9CDCFE',

  string: '#CE9178',
  char: '#CE9178',
  builtin: '#4EC9B0',

  operator: '#D4D4D4',
  entity: '#D4D4D4',
  url: '#4EC9B0',

  variable: '#9CDCFE',

  function: '#DCDCAA',

  keyword: '#C586C0',

  regex: '#D16969',
  important: '#569CD6',
  atrule: '#C586C0',

  className: '#4EC9B0',
};

function getTokenColor(type: string, theme: Theme): string {
  return TOKEN_COLORS[type] || theme.textPrimary;
}

function renderPrismTokens(
  tokens: Prism.TokenStream,
  theme: Theme,
  keyPrefix = '',
): React.ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (typeof token === 'string') {
      return (
        <Text key={key} style={{ color: theme.textPrimary }}>
          {token}
        </Text>
      );
    }

    const tokenContent = token.content;

    let children: React.ReactNode;

    if (Array.isArray(tokenContent)) {
      children = renderPrismTokens(tokenContent, theme, key);
    } else if (typeof tokenContent === 'string') {
      children = tokenContent;
    } else {
      children = String(tokenContent);
    }

    return (
      <Text
        key={key}
        style={{
          color: getTokenColor(token.type, theme),
        }}
      >
        {children}
      </Text>
    );
  });
}

/* -------------------------------------------------------------------------- */
/*                              CODE BLOCK                                    */
/* -------------------------------------------------------------------------- */

const CodeBlock = memo(
  ({ code, language, theme }: CodeBlockProps) => {
    const normalizedLanguage = normalizeLanguage(language);

    const highlightedCode = useMemo(() => {
      try {
        const grammar = Prism.languages[normalizedLanguage];

        if (!grammar) {
          return (
            <Text style={{ color: theme.textPrimary }}>
              {code}
            </Text>
          );
        }

        const tokens = Prism.tokenize(code, grammar);

        return renderPrismTokens(tokens, theme);
      } catch (error) {
        console.warn(
          `Prism failed for language "${normalizedLanguage}":`,
          error,
        );

        return (
          <Text style={{ color: theme.textPrimary }}>
            {code}
          </Text>
        );
      }
    }, [code, normalizedLanguage, theme]);

    return (
      <View
        style={[
          styles.codeContainer,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Code header */}
        <View
          style={[
            styles.codeHeader,
            {
              backgroundColor: theme.surfaceAlt,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.languageText,
              {
                color: theme.textSecondary,
              },
            ]}
          >
            {normalizedLanguage}
          </Text>

          <CopyButton code={code} theme={theme} />
        </View>

        {/* Code */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.codeScrollContent}
        >
          <Text
            selectable
            style={[
              styles.codeText,
              {
                color: theme.textPrimary,
              },
            ]}
          >
            {highlightedCode}
          </Text>
        </ScrollView>
      </View>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*                              MERMAID BLOCK                                  */
/* -------------------------------------------------------------------------- */

function createMermaidHtml(
  diagram: string,
  theme: Theme,
): string {
  const escapedDiagram = escapeHtml(diagram);

  const isDark = true;

  return `
<!DOCTYPE html>
<html>
<head>
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
/>

<style>
  html, body {
    margin: 0;
    padding: 0;
    background: ${theme.background};
    overflow: hidden;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  #diagram {
    width: 100%;
    overflow: auto;
    padding: 8px;
    box-sizing: border-box;
  }

  .error {
    color: ${theme.danger};
    font-size: 14px;
    padding: 12px;
  }

  svg {
    max-width: 100%;
    height: auto;
  }
</style>
</head>

<body>

<div id="diagram" class="mermaid">
${escapedDiagram}
</div>

<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>

<script>
  async function renderDiagram() {
    try {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: '${isDark ? 'dark' : 'default'}',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: false
        }
      });

      const element = document.querySelector('#diagram');

      const source = element.textContent;

      const { svg } = await mermaid.render(
        'mermaid-diagram',
        source
      );

      element.innerHTML = svg;

      setTimeout(() => {
        const height = document.body.scrollHeight;

        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'height',
            height
          })
        );
      }, 100);
    } catch (error) {
      document.querySelector('#diagram').innerHTML =
        '<div class="error">Unable to render Mermaid diagram.</div>';

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'error',
          message: String(error)
        })
      );
    }
  }

  window.addEventListener('load', renderDiagram);
</script>

</body>
</html>
`;
}

/* -------------------------------------------------------------------------- */
/*                              LATEX BLOCK                                   */
/* -------------------------------------------------------------------------- */

function createLatexHtml(
  latex: string,
  theme: Theme,
): string {
  const escapedLatex = escapeHtml(latex);

  return `
<!DOCTYPE html>
<html>
<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css"
/>

<style>

html,
body {
  margin: 0;
  padding: 0;
  background: ${theme.background};
  color: ${theme.textPrimary};
}

body {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
}

#math {
  font-size: 20px;
  text-align: center;
  max-width: 100%;
  overflow-x: auto;
}

.katex {
  color: ${theme.textPrimary};
}

</style>

</head>

<body>

<div id="math"></div>

<script src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js"></script>

<script>

window.addEventListener('load', function() {

  try {

    const latex = ${JSON.stringify(latex)};

    katex.render(
      latex,
      document.getElementById('math'),
      {
        throwOnError: false,
        displayMode: true
      }
    );

    setTimeout(() => {

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'height',
          height: document.body.scrollHeight
        })
      );

    }, 100);

  } catch (error) {

    document.getElementById('math').innerText =
      'Unable to render equation.';

  }

});

</script>

</body>
</html>
`;
}

/* -------------------------------------------------------------------------- */
/*                              WEBVIEW BLOCK                                 */
/* -------------------------------------------------------------------------- */

const WebViewBlock = memo(
  ({
    html,
    height = 120,
    theme,
  }: WebViewBlockProps) => {
    const [webHeight, setWebHeight] = useState(height);

    return (
      <View
        style={[
          styles.webViewContainer,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
          },
        ]}
      >
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{
            height: webHeight,
            backgroundColor: 'transparent',
          }}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);

              if (
                data.type === 'height' &&
                typeof data.height === 'number'
              ) {
                setWebHeight(
                  Math.max(60, Math.min(data.height + 16, 1000)),
                );
              }
            } catch {
              // Ignore malformed WebView messages
            }
          }}
        />
      </View>
    );
  },
);

/* -------------------------------------------------------------------------- */
/*                            MARKDOWN PREPROCESSOR                            */
/* -------------------------------------------------------------------------- */

/**
 * Extracts special fenced blocks:
 *
 * ```mermaid
 * graph TD
 * A --> B
 * ```
 *
 * ```latex
 * E = mc^2
 * ```
 *
 * and replaces them with placeholders.
 */
function preprocessSpecialBlocks(content: string): {
  markdown: string;
  blocks: Map<
    string,
    {
      type: 'mermaid' | 'latex';
      content: string;
    }
  >;
} {
  const blocks = new Map<
    string,
    {
      type: 'mermaid' | 'latex';
      content: string;
    }
  >();

  let counter = 0;

  const markdown = content.replace(
    /```(mermaid|latex|math)\s*\n([\s\S]*?)```/gi,
    (_, type: string, code: string) => {
      const id = `AI_SPECIAL_BLOCK_${counter++}`;

      blocks.set(id, {
        type:
          type.toLowerCase() === 'mermaid'
            ? 'mermaid'
            : 'latex',
        content: code.trim(),
      });

      return `\n\n${id}\n\n`;
    },
  );

  return {
    markdown,
    blocks,
  };
}

/* -------------------------------------------------------------------------- */
/*                              CODE EXTRACTION                               */
/* -------------------------------------------------------------------------- */

function extractCodeInfo(
  node: any,
): {
  code: string;
  language?: string;
} {
  const code =
    typeof node?.content === 'string'
      ? node.content
      : typeof node?.children?.[0]?.content === 'string'
        ? node.children[0].content
        : '';

  let language: string | undefined;

  if (node?.attributes?.className) {
    const className = String(node.attributes.className);

    const match = className.match(
      /language-([a-zA-Z0-9_-]+)/,
    );

    if (match) {
      language = match[1];
    }
  }

  if (!language && node?.attributes?.class) {
    const className = String(node.attributes.class);

    const match = className.match(
      /language-([a-zA-Z0-9_-]+)/,
    );

    if (match) {
      language = match[1];
    }
  }

  return {
    code: code.replace(/\n$/, ''),
    language,
  };
}

/* -------------------------------------------------------------------------- */
/*                           MAIN COMPONENT                                   */
/* -------------------------------------------------------------------------- */

function AIContentRenderer({
  content,
  theme,
  fontSize = 16,
  lineHeight = 25,
}: AIContentRendererProps) {
  const { width } = useWindowDimensions();

  const {
    markdown,
    blocks,
  } = useMemo(
    () => preprocessSpecialBlocks(content || ''),
    [content],
  );

  const markdownStyles = useMemo(
    () =>
      StyleSheet.create({
        body: {
          color: theme.textPrimary,
          fontSize,
          lineHeight,
        },

        heading1: {
          color: theme.textPrimary,
          fontSize: fontSize + 9,
          lineHeight: fontSize + 15,
          fontWeight: '700',
          marginTop: 18,
          marginBottom: 10,
        },

        heading2: {
          color: theme.textPrimary,
          fontSize: fontSize + 6,
          lineHeight: fontSize + 12,
          fontWeight: '700',
          marginTop: 16,
          marginBottom: 8,
        },

        heading3: {
          color: theme.textPrimary,
          fontSize: fontSize + 3,
          lineHeight: fontSize + 9,
          fontWeight: '700',
          marginTop: 14,
          marginBottom: 7,
        },

        heading4: {
          color: theme.textPrimary,
          fontSize: fontSize + 1,
          fontWeight: '700',
          marginTop: 12,
          marginBottom: 6,
        },

        paragraph: {
          color: theme.textPrimary,
          fontSize,
          lineHeight,
          marginTop: 4,
          marginBottom: 10,
        },

        strong: {
          color: theme.textPrimary,
          fontWeight: '700',
        },

        em: {
          color: theme.textPrimary,
          fontStyle: 'italic',
        },

        bullet_list: {
          marginBottom: 8,
        },

        ordered_list: {
          marginBottom: 8,
        },

        list_item: {
          marginBottom: 5,
        },

        bullet_list_icon: {
          color: theme.primary,
          fontSize: fontSize,
        },

        ordered_list_icon: {
          color: theme.primary,
          fontWeight: '700',
        },

        blockquote: {
          backgroundColor: theme.surfaceAlt,
          borderLeftWidth: 4,
          borderLeftColor: theme.primary,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginVertical: 8,
        },

        code_inline: {
          color: theme.primary,
          backgroundColor: theme.surfaceAlt,
          borderColor: theme.border,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: 4,
          paddingHorizontal: 4,
          fontFamily: 'monospace',
        },

        link: {
          color: theme.primary,
          textDecorationLine: 'underline',
        },

        hr: {
          backgroundColor: theme.border,
          height: StyleSheet.hairlineWidth,
          marginVertical: 14,
        },

        table: {
          borderWidth: 1,
          borderColor: theme.border,
          marginVertical: 10,
        },

        thead: {
          backgroundColor: theme.surfaceAlt,
        },

        th: {
          color: theme.textPrimary,
          fontWeight: '700',
          padding: 8,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme.border,
        },

        td: {
          color: theme.textPrimary,
          padding: 8,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme.border,
        },

        tr: {
          borderColor: theme.border,
        },

        image: {
          marginVertical: 10,
          maxWidth: width - 32,
        },
      }),
    [theme, fontSize, lineHeight, width],
  );

  const rules: RenderRules = useMemo(
    () => ({
      /* ------------------------------ code blocks ----------------------- */

      fence: (
        node: any,
      ) => {
        const { code, language } =
          extractCodeInfo(node);

        const normalizedLanguage =
          normalizeLanguage(language);

        // Mermaid
        if (normalizedLanguage === 'mermaid') {
          const html = createMermaidHtml(
            code,
            theme,
          );

          return (
            <WebViewBlock
              key={node.key}
              html={html}
              height={180}
              theme={theme}
            />
          );
        }

        // LaTeX / Math
        if (
          normalizedLanguage === 'latex' ||
          normalizedLanguage === 'math'
        ) {
          const html = createLatexHtml(
            code,
            theme,
          );

          return (
            <WebViewBlock
              key={node.key}
              html={html}
              height={100}
              theme={theme}
            />
          );
        }

        return (
          <CodeBlock
            key={node.key}
            code={code}
            language={language}
            theme={theme}
          />
        );
      },

      /* ------------------------------ inline code ----------------------- */

      code_inline: (
        node: any,
        _children: any,
        _parent: any,
        styles: any,
      ) => {
        return (
          <Text
            key={node.key}
            style={styles.code_inline}
          >
            {node.content}
          </Text>
        );
      },

      /* ------------------------------ special blocks -------------------- */

      paragraph: (
        node: any,
        children: any,
        _parent: any,
        styles: any,
      ) => {
        const firstChild =
          node.children?.[0];

        if (
          firstChild &&
          typeof firstChild.content === 'string'
        ) {
          const special =
            blocks.get(firstChild.content.trim());

          if (special) {
            if (special.type === 'mermaid') {
              return (
                <WebViewBlock
                  key={node.key}
                  html={createMermaidHtml(
                    special.content,
                    theme,
                  )}
                  height={180}
                  theme={theme}
                />
              );
            }

            if (special.type === 'latex') {
              return (
                <WebViewBlock
                  key={node.key}
                  html={createLatexHtml(
                    special.content,
                    theme,
                  )}
                  height={100}
                  theme={theme}
                />
              );
            }
          }
        }

        return (
          <Text
            key={node.key}
            style={styles.paragraph}
          >
            {children}
          </Text>
        );
      },
    }),
    [theme, blocks],
  );

  if (!content?.trim()) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Markdown
        style={markdownStyles}
        rules={rules}
      >
        {markdown}
      </Markdown>
    </View>
  );
}

export default memo(AIContentRenderer);

/* -------------------------------------------------------------------------- */
/*                                  STYLES                                    */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  codeContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },

  codeHeader: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },

  languageText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  copyButton: {
    minWidth: 60,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  codeScrollContent: {
    padding: 14,
  },

  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },

  webViewContainer: {
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
});