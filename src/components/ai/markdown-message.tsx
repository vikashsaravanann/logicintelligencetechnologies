"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";

const CodeBlock = dynamic(() => import("./code-block"), { ssr: false });

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
          return <CodeBlock language={match[1]} code={code} />;
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
