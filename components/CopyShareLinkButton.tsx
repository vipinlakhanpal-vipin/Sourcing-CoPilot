"use client";

import { useState } from "react";

export default function CopyShareLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/share/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-sm text-slate-500 hover:text-slate-900"
    >
      {copied ? "Link copied" : "Copy customer link"}
    </button>
  );
}
