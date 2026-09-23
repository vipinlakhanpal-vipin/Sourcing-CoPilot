export default function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" className="shrink-0">
      <circle cx="17" cy="17" r="15.5" stroke="var(--color-brand-500)" strokeWidth="1.4" />
      <circle cx="17" cy="17" r="11" stroke="var(--color-brand-500)" strokeWidth="1" opacity="0.55" />
      <path
        d="M17 10.5L18.6 15.4L23.5 17L18.6 18.6L17 23.5L15.4 18.6L10.5 17L15.4 15.4L17 10.5Z"
        fill="var(--color-brand-500)"
      />
    </svg>
  );
}
