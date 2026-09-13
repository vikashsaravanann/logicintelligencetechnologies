"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative my-2.5 rounded-xl overflow-hidden border border-white/10 bg-[#0b1220]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.07] bg-black/30">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300/80 select-none">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers
        lineNumberStyle={{
          minWidth: "2.4em",
          paddingRight: "1em",
          color: "rgba(255,255,255,0.2)",
          userSelect: "none",
          fontSize: 11,
        }}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: 13,
          background: "transparent",
          padding: "0.85rem 0.85rem 0.85rem 0",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
