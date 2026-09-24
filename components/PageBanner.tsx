export default function PageBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="hero-carbon rounded-xl px-6 py-5">
      <h1 className="font-display text-2xl text-white">{title}</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-white/70">{description}</p>
    </div>
  );
}
