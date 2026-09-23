import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";
import { GalleryUploader } from "@/components/teacher/gallery-uploader";

export default async function TeacherGalleryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignment } = await supabase
    .from("teacher_classes")
    .select("class_id")
    .eq("teacher_id", user?.id)
    .maybeSingle();

  if (!assignment) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-brand-600">
        Танд одоогоор анги хуваарилагдаагүй байна.
      </div>
    );
  }

  const date = todayISO();

  const { data: media } = await supabase
    .from("class_media")
    .select("id, media_type, storage_path, caption, created_at")
    .eq("class_id", assignment.class_id)
    .eq("report_date", date)
    .order("created_at", { ascending: false });

  const withUrls = await Promise.all(
    (media ?? []).map(async (m) => {
      const { data: signed } = await supabase.storage
        .from("class-media")
        .createSignedUrl(m.storage_path, 3600);
      return { ...m, url: signed?.signedUrl ?? "" };
    })
  );

  return (
    <div className="mx-auto max-w-md px-4 pt-5 pb-24">
      <h1 className="mb-4 text-lg font-semibold text-brand-900">Зураг / Бичлэг</h1>
      <GalleryUploader classId={assignment.class_id} date={date} initialMedia={withUrls} />
    </div>
  );
}
