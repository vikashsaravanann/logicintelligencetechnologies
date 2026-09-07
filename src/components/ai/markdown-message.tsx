"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function MarkdownMessage({ content }: { content: string }) {
  const components = useMemo(
    () => ({
      pre({ children }: { children?: React.ReactNode }) {
        return <>{children}</>;
      },
      code({
        className,
        children,
        ...props
      }: {
        className?: string;
        children?: React.ReactNode;
      }) {
        const match = /language-(\w+)/.exec(className || "");
        const code = String(children ?? "").replace(/\n$/, "");
        if (match) {
          return (
            <SyntaxHighlighter
              language={match[1]}
              style={oneDark}
              PreTag="div"
              customStyle={{
                margin: "0.6rem 0",
                borderRadius: 12,
                fontSize: 13,
                background: "#0b1220",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {code}
            </SyntaxHighlighter>
          );
        }
        return (
          <code
            className="rounded bg-white/10 px-1 py-0.5 text-[13px] text-primary"
            {...props}
          >
            {children}
          </code>
        );
      },
    }),
    []
  );

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-pre:p-0 prose-pre:bg-transparent prose-headings:text-inherit prose-p:text-inherit">
      <ReactMarkdown components={components as never}>{content}</ReactMarkdown>
    </div>
  );
}
