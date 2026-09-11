import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Creates a new auth user + profile for a teacher or parent. This uses the
 * Supabase service role key, which must stay server-side only — it is read
 * from process.env here inside an API route and is never sent to the
 * browser. The caller must themselves be a logged-in admin of the target
 * kindergarten; we re-check that with the normal (RLS-bound) server client
 * before doing anything with the service-role client.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { role, fullName, email, classId } = body as {
    role: "teacher" | "parent";
    fullName: string;
    email: string;
    classId?: string;
  };

  if (!role || !fullName || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1. Verify the caller is actually an admin (RLS-bound client, not service role).
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: kinder } = await supabase
    .from("kindergartens")
    .select("id")
    .eq("admin_id", user.id)
    .single();
  if (!kinder) return NextResponse.json({ error: "No kindergarten" }, { status: 400 });

  // 2. Use the service-role client only for the privileged create-user step.
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: crypto.randomUUID(), // temp password; real deploy should email an invite/reset link instead
    email_confirm: true,
    user_metadata: { role, full_name: fullName },
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? "Failed to create user" }, { status: 400 });
  }

  const userId = created.user.id;
  await admin.from("profiles").upsert({ id: userId, role, full_name: fullName });

  if (role === "teacher") {
    await admin.from("teachers").upsert({ id: userId, kindergarten_id: kinder.id });
    if (classId) {
      await admin.from("teacher_classes").upsert({ teacher_id: userId, class_id: classId });
    }
  } else {
    await admin.from("parents").upsert({ id: userId });
  }

  return NextResponse.json({ ok: true, userId });
}
