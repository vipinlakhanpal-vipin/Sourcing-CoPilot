export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-ink-800">Sourcing CoPilot</h1>
          <p className="mt-1 text-sm text-ink-400">Coupa Sourcing deployment scoping</p>
        </div>
        {children}
      </div>
    </div>
  );
}
