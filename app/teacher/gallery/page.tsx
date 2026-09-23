
export async function uploadClassMedia(input: {
  classId: string;
  date: string;
  mediaType: "image" | "video";
  fileName: string;
  fileBase64: string;
  contentType: string;
  caption?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = `${input.classId}/${input.date}/${Date.now()}-${input.fileName}`;
  const binary = Buffer.from(input.fileBase64, "base64");

  const { error: uploadError } = await supabase.storage
    .from("class-media")
    .upload(path, binary, { contentType: input.contentType });

  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await supabase.from("class_media").insert({
    class_id: input.classId,
    media_type: input.mediaType,
    storage_path: path,
    caption: input.caption ?? null,
    report_date: input.date,
    uploaded_by: user?.id,
  });

  if (insertError) throw new Error(insertError.message);

  revalidatePath("/teacher/gallery");
  revalidatePath("/parent");
  return { ok: true };
}

export async function deleteClassMedia(mediaId: string, storagePath: string) {
  const supabase = createClient();

  const { error: storageError } = await supabase.storage.from("class-media").remove([storagePath]);
  if (storageError) throw new Error(storageError.message);

  const { error: dbError } = await supabase.from("class_media").delete().eq("id", mediaId);
  if (dbError) throw new Error(dbError.message);

  revalidatePath("/teacher/gallery");
  return { ok: true };
}
