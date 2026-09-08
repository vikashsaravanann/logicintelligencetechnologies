"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <SyntaxHighlighter
      language={language}
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
