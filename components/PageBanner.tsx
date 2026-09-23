export default function PageBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-ink-100 px-6 py-5"
      style={{
        backgroundImage:
          "linear-gradient(120deg, var(--color-brand-50), #ffffff 65%), repeating-linear-gradient(115deg, rgba(140,95,34,0.05) 0 1px, transparent 1px 13px)",
      }}
    >
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-800">{title}</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-ink-500">{description}</p>
    </div>
  );
}
