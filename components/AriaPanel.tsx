"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi, I'm Aria. Open a project and I can answer questions about its intake answers, help draft wording for a question, or explain the generated configuration package. Ask me anything.",
};

export default function AriaPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const res = await fetch("/api/aria/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(0, -1).slice(-10),
          pathname,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Aria could not respond");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aria could not respond");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed right-5 top-[4.75rem] z-40 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-ink-100 bg-surface shadow-2xl">
      <div className="flex items-center justify-between bg-violet-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <svg viewBox="0 0 24 24" className="aria-orbit h-3.5 w-3.5 text-white" fill="currentColor">
              <rect x="7" y="8" width="10" height="9" rx="3" />
              <rect x="10" y="3" width="4" height="4" rx="2" />
              <circle cx="9.5" cy="12.5" r="1.2" fill="#7c3aed" />
              <circle cx="14.5" cy="12.5" r="1.2" fill="#7c3aed" />
            </svg>
          </span>
          <span className="text-sm font-bold text-white">Aria</span>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Close Aria">
          ✕
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-sm bg-ink-800 text-white"
                  : "rounded-bl-sm bg-violet-50 text-ink-700"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-violet-50 px-3 py-2 text-xs text-ink-400">Thinking…</div>
          </div>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-ink-100 p-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Aria..."
          disabled={sending}
          className="field-fill flex-1 rounded-full px-3 py-2 text-xs"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-full bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
