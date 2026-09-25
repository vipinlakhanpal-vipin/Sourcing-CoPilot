export default function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className="shrink-0">
      <circle cx="50" cy="50" r="44" stroke="var(--color-brand-500)" strokeWidth="5" />
      <path
        d="M50 16 L55 34 L73 39 L55 44 L50 62 L45 44 L27 39 L45 34 Z"
        fill="var(--color-brand-500)"
      />
      <line x1="50" y1="62" x2="50" y2="68" stroke="var(--color-brand-500)" strokeWidth="5" strokeLinecap="round" />
      <rect x="28" y="70" width="44" height="7" rx="3.5" fill="#ffffff" />
      <rect x="34" y="81" width="32" height="7" rx="3.5" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}
