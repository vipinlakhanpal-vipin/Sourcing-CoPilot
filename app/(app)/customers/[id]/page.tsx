import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import StartIntakeButton from "@/components/StartIntakeButton";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("id, name, notes, status, created_at")
    .eq("id", id)
    .eq("owner_id", session.userId)
    .maybeSingle();

  if (!customer) notFound();

  const { data: intakeSessions } = await supabaseAdmin
    .from("intake_sessions")
    .select("id, status, current_step, created_at, completed_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
          ← All customers
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">{customer.name}</h1>
        {customer.notes && <p className="mt-1 text-sm text-slate-500">{customer.notes}</p>}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700">Intake sessions</h2>
        <StartIntakeButton customerId={customer.id} />
      </div>

      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {intakeSessions?.map((s) => (
          <li key={s.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Started {new Date(s.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-400 capitalize">{s.status.replace("_", " ")}</p>
            </div>
            <div className="flex gap-3">
              {s.status === "completed" ? (
                <>
                  <Link href={`/intake/${s.id}/results`} className="text-sm font-medium text-slate-900 underline">
                    View config package
                  </Link>
                  <Link href={`/intake/${s.id}`} className="text-sm text-slate-500 hover:text-slate-900">
                    Edit answers
                  </Link>
                </>
              ) : (
                <Link href={`/intake/${s.id}`} className="text-sm font-medium text-slate-900 underline">
                  Continue intake
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
