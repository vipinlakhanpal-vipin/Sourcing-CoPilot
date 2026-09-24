import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import NewCustomerForm from "@/components/NewCustomerForm";
import PageBanner from "@/components/PageBanner";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: customers } = await supabaseAdmin
    .from("customers")
    .select("id, name, status, created_at, updated_at")
    .eq("owner_id", session.userId)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageBanner
        title="Projects"
        description="Every customer or opportunity you're scoping a Coupa Sourcing deployment for."
      />

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-ink-800">All projects</h2>
        <NewCustomerForm />
      </div>

      {(!customers || customers.length === 0) && (
        <div className="rounded-lg border border-dashed border-ink-200 bg-surface p-8 text-center text-sm text-ink-400">
          No projects yet. Create one to start an intake.
        </div>
      )}

      <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100 bg-surface shadow-sm">
        {customers?.map((customer) => (
          <li key={customer.id}>
            <Link
              href={`/customers/${customer.id}`}
              className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-ink-50"
            >
              <div>
                <p className="text-sm font-medium text-ink-800">{customer.name}</p>
                <p className="text-xs text-ink-400">
                  Updated {new Date(customer.updated_at).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium capitalize text-brand-700">
                {customer.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
