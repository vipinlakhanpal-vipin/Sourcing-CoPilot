const TONE_CLASSES: Record<string, string> = {
  brand: "bg-brand-50 text-brand-700",
  warn: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  good: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  bad: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  neutral: "bg-ink-50 text-ink-700",
};

export default function KpiTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  tone?: "brand" | "warn" | "good" | "bad" | "neutral";
}) {
  return (
    <div className={`rounded-lg border border-ink-100 p-3.5 ${TONE_CLASSES[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold">{value}</p>
    </div>
  );
}
