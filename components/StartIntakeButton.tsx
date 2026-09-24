"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartIntakeButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/intake`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        router.push(`/intake/${data.intakeSessionId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-md border border-ink-200 bg-surface px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-60"
    >
      {loading ? "Starting…" : "Start new intake session"}
    </button>
  );
}
