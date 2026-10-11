"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const CodeBlock = dynamic(() => import("./code-block"), { ssr: false });

export interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const components = useMemo(
    () => ({
      pre({ children }: { children?: React.ReactNode }) {
        return <>{children}</>;
      },
      p({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <p className="my-1.5 leading-relaxed text-white" {...props}>
            {children}
          </p>
        );
      },
      h1({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <h1 className="mt-3 mb-1.5 text-lg font-bold tracking-tight text-white" {...props}>
            {children}
          </h1>
        );
      },
      h2({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <h2 className="mt-2.5 mb-1 text-base font-bold tracking-tight text-white" {...props}>
            {children}
          </h2>
        );
      },
      h3({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <h3 className="mt-2 mb-1 text-sm font-semibold tracking-tight text-white" {...props}>
            {children}
          </h3>
        );
      },
      h4({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <h4 className="mt-1.5 mb-0.5 text-xs font-semibold tracking-tight text-white" {...props}>
            {children}
          </h4>
        );
      },
      strong({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <strong className="font-semibold text-white" {...props}>
            {children}
          </strong>
        );
      },
      em({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <em className="italic text-white" {...props}>
            {children}
          </em>
        );
      },
      ul({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <ul className="my-1.5 list-disc space-y-1 pl-4 text-white" {...props}>
            {children}
          </ul>
        );
      },
      ol({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <ol className="my-1.5 list-decimal space-y-1 pl-4 text-white" {...props}>
            {children}
          </ol>
        );
      },
      li({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <li className="leading-relaxed text-white" {...props}>
            {children}
          </li>
        );
      },
      blockquote({
        children,
        node: _node,
        ...props
      }: {
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <blockquote
            className="my-2 border-l-2 border-cyan-400/50 pl-3 italic text-white"
            {...props}
          >
            {children}
          </blockquote>
        );
      },
      a({
        href,
        children,
        node: _node,
        ...props
      }: {
        href?: string;
        children?: React.ReactNode;
        node?: unknown;
      }) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cyan-300 underline underline-offset-2 transition-colors hover:text-cyan-200"
            {...props}
          >
            {children}
          </a>
        );
      },
      hr({
        node: _node,
        ...props
      }: {
        node?: unknown;
      }) {
        return <hr className="my-3 border-white/15" {...props} />;
      },
      code({
        className: codeClassName,
        children,
        node: _node,
        ...props
      }: {
        className?: string;
        children?: React.ReactNode;
        node?: unknown;
      }) {
        const match = /language-(\w+)/.exec(codeClassName || "");
        const code = String(children ?? "").replace(/\n$/, "");
        if (match) {
          return <CodeBlock language={match[1]} code={code} />;
        }
        if (code.includes("\n")) {
          return <CodeBlock language="text" code={code} />;
        }
        return (
          <code
            className="rounded border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-white"
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
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none text-white",
        "prose-p:my-1.5 prose-p:text-white",
        "prose-headings:text-white",
        "prose-strong:text-white",
        "prose-ul:text-white prose-ol:text-white prose-li:text-white",
        "prose-blockquote:text-white prose-blockquote:border-cyan-500/40",
        "prose-a:text-cyan-300 hover:prose-a:text-cyan-200",
        "prose-code:text-white prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:p-0 prose-pre:bg-transparent",
        className
      )}
    >
      <ReactMarkdown components={components as never}>{content}</ReactMarkdown>
    </div>
  );
}
