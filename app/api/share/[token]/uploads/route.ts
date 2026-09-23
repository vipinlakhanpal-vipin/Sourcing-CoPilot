import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { data: session } = await supabaseAdmin
    .from("intake_sessions")
    .select("id")
    .eq("share_token", token)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "This link is invalid or has expired" }, { status: 404 });
  }

  const areaId = request.nextUrl.searchParams.get("areaId");
  const fieldId = request.nextUrl.searchParams.get("fieldId");
  if (!areaId || !fieldId) {
    return NextResponse.json({ error: "Missing areaId or fieldId" }, { status: 400 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File is larger than 25MB" }, { status: 400 });
  }
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: "Only CSV or XLSX files are accepted" }, { status: 400 });
  }

  const storagePath = `${session.id}/${areaId}/${fieldId}-${Date.now()}${ext}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from("intake-uploads")
    .upload(storagePath, file, { contentType: file.type || undefined });

  if (uploadError) {
    return NextResponse.json({ error: "Could not upload the file" }, { status: 500 });
  }

  const { error: insertError } = await supabaseAdmin.from("intake_uploads").insert({
    intake_session_id: session.id,
    area_id: areaId,
    field_id: fieldId,
    file_name: file.name,
    storage_path: storagePath,
    size_bytes: file.size,
  });

  if (insertError) {
    return NextResponse.json({ error: "Uploaded, but could not save the file record" }, { status: 500 });
  }

  return NextResponse.json({ fileName: file.name });
}
