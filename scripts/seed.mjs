// Seeds a demo kindergarten, one class of 23 children, and the three
// demo accounts (admin/teacher/parent) referenced in the README.
//
// Run with: node scripts/seed.mjs
// Requires SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL in .env.local

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "Demo1234!";

const CHILD_NAMES = [
  "А. Амингоо", "Х. Билэгт", "Б. Бүрэнбилэг", "Т. Ирмүүн", "С. Мөнхгэрэлт",
  "Г. Мөнхтүшиг", "О. Намулун", "Э. Намуун", "Т. Номунмөрөн", "Х. Нэгүн",
  "М. Нэгүнэ", "А. Оргилмаа", "Т. Сийлэн", "Т. Содбилэг", "Б. Соёмбо",
  "А. Тод", "З. Түшиг", "З. Тэмүүлэл", "Б. Уудамтэнгэр", "Д. Уужим",
  "А. Цэцэнбилиг", "М. Эгшиг", "Б. Эмма",
];

async function createAuthUser(email, role, fullName) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { role, full_name: fullName },
  });
  if (error) throw new Error(`createUser(${email}): ${error.message}`);

  const userId = data.user.id;
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    role,
    full_name: fullName,
  });
  if (profileError) throw new Error(`profile(${email}): ${profileError.message}`);
  return userId;
}

async function main() {
  console.log("Seeding demo data...");

  const adminId = await createAuthUser("admin@demo.mn", "admin", "Админ Б.");
  const teacherId = await createAuthUser("teacher@demo.mn", "teacher", "Багш Отгонцэцэг");
  const parentId = await createAuthUser("parent@demo.mn", "parent", "Эцэг эх Ганболд");

  const { data: kinder, error: kErr } = await supabase
    .from("kindergartens")
    .insert({ name: "Наран цэцэрлэг", address: "Улаанбаатар, Сүхбаатар дүүрэг", admin_id: adminId })
    .select()
    .single();
  if (kErr) throw kErr;

  const { data: klass, error: cErr } = await supabase
    .from("classes")
    .insert({ kindergarten_id: kinder.id, name: "Бэлтгэл бүлэг", age_group: "5-6 нас" })
    .select()
    .single();
  if (cErr) throw cErr;

  await supabase.from("teachers").upsert({ id: teacherId, kindergarten_id: kinder.id });
  await supabase.from("teacher_classes").upsert({ teacher_id: teacherId, class_id: klass.id });
  await supabase.from("parents").upsert({ id: parentId });

  const { data: children, error: chErr } = await supabase
    .from("children")
    .insert(CHILD_NAMES.map((full_name) => ({ class_id: klass.id, full_name })))
    .select();
  if (chErr) throw chErr;

  // Link the demo parent to the first child (so parent@demo.mn sees "А. Амингоо")
  await supabase.from("parent_children").upsert({
    parent_id: parentId,
    child_id: children[0].id,
  });

  // Seed today's attendance (all present) so the teacher UI has something to show
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from("attendance").insert(
    children.map((c) => ({
      child_id: c.id,
      report_date: today,
      status: "present",
      marked_by: teacherId,
    }))
  );

  console.log("Done.");
  console.log("--------------------------------------------------");
  console.log("Demo accounts (password for all:", DEMO_PASSWORD, ")");
  console.log("  admin@demo.mn");
  console.log("  teacher@demo.mn");
  console.log("  parent@demo.mn  (linked to А. Амингоо)");
  console.log("--------------------------------------------------");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
