import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import DownloadPackageButton from "@/components/DownloadPackageButton";
import { ConfigFlag } from "@/lib/anthropic";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const { sessionId } = await params;

  const { data: intakeSession } = await supabaseAdmin
    .from("intake_sessions")
    .select("id, customers!inner(id, name, owner_id)")
    .eq("id", sessionId)
    .eq("customers.owner_id", session.userId)
    .maybeSingle();

  if (!intakeSession) notFound();
  const customer = Array.isArray(intakeSession.customers)
    ? intakeSession.customers[0]
    : intakeSession.customers;

  const { data: configPackage } = await supabaseAdmin
    .from("config_packages")
    .select("id, summary_markdown, structured_data, flags, generated_at")
    .eq("intake_session_id", sessionId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!configPackage) {
    return (
      <div className="space-y-4">
        <Link href={`/intake/${sessionId}`} className="text-sm text-slate-500 hover:text-slate-900">
          ← Back to intake
        </Link>
        <p className="text-sm text-slate-600">
          No configuration package has been generated for this intake yet.
        </p>
      </div>
    );
  }

  const flags = (configPackage.flags as ConfigFlag[]) ?? [];

  const { data: uploads } = await supabaseAdmin
    .from("intake_uploads")
    .select("id, file_name, storage_path, size_bytes, uploaded_at")
    .eq("intake_session_id", sessionId)
    .order("uploaded_at", { ascending: false });

  const uploadsWithUrls = await Promise.all(
    (uploads ?? []).map(async (u) => {
      const { data: signed } = await supabaseAdmin.storage
        .from("intake-uploads")
        .createSignedUrl(u.storage_path, 60 * 10);
      return { ...u, url: signed?.signedUrl ?? null };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/customers/${customer.id}`} className="text-sm text-slate-500 hover:text-slate-900">
            ← {customer.name}
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">Configuration package</h1>
          <p className="text-sm text-slate-400">
            Generated {new Date(configPackage.generated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <DownloadPackageButton
            customerName={customer.name}
            structuredData={configPackage.structured_data}
          />
          <Link
            href={`/intake/${sessionId}`}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit answers
          </Link>
        </div>
      </div>

      {flags.length > 0 && (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">Flagged for review</h2>
          <ul className="space-y-1.5">
            {flags.map((flag, i) => (
              <li key={i} className="text-sm text-amber-800">
                <span className="font-medium">{flag.area}:</span> {flag.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploadsWithUrls.length > 0 && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Master data files</h2>
          <ul className="divide-y divide-slate-100">
            {uploadsWithUrls.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {u.file_name}{" "}
                  <span className="text-xs text-slate-400">
                    ({(u.size_bytes / 1024).toFixed(0)} KB)
                  </span>
                </span>
                {u.url ? (
                  <a href={u.url} className="font-medium text-slate-900 underline">
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Link unavailable</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <article className="prose prose-sm prose-slate max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{configPackage.summary_markdown}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
