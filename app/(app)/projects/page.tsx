import { getSession } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import NewCustomerForm from "@/components/NewCustomerForm";
import PageBanner from "@/components/PageBanner";
import ProjectsList, { ProjectRow } from "@/components/ProjectsList";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) return null;

  const { data: customers } = await supabaseAdmin
    .from("customers")
    .select("id, name, notes, status, updated_at")
    .eq("owner_id", session.userId)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageBanner
        title="Projects"
        description="Every customer or opportunity you're scoping a Coupa Sourcing deployment for."
      />

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-brand-700">All projects</h2>
        <NewCustomerForm />
      </div>

      <ProjectsList initialProjects={(customers ?? []) as ProjectRow[]} />
    </div>
  );
}
