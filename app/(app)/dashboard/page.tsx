import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import NewCustomerForm from "@/components/NewCustomerForm";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: customers } = await supabaseAdmin
    .from("customers")
    .select("id, name, status, created_at, updated_at")
    .eq("owner_id", session.userId)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Scope a Coupa Sourcing deployment for each customer or opportunity.</p>
        </div>
        <NewCustomerForm />
      </div>

      {(!customers || customers.length === 0) && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No customers yet. Create one to start an intake.
        </div>
      )}

      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {customers?.map((customer) => (
          <li key={customer.id}>
            <Link
              href={`/customers/${customer.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                <p className="text-xs text-slate-400">
                  Updated {new Date(customer.updated_at).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-600">
                {customer.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
