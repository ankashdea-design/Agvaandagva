"use client";

import { useRef, useState } from "react";
import { uploadClassMedia, deleteClassMedia } from "@/app/teacher/actions";
import { Button } from "@/components/ui/button";

type MediaItem = {
  id: string;
  media_type: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
  url: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function GalleryUploader({
  classId,
  date,
  initialMedia,
}: {
  classId: string;
  date: string;
  initialMedia: MediaItem[];
}) {
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const mediaType = file.type.startsWith("video") ? "video" : "image";

      await uploadClassMedia({
        classId,
        date,
        mediaType,
        fileName: file.name,
        fileBase64: base64,
        contentType: file.type,
        caption: caption || undefined,
      });

      setCaption("");
      window.location.reload();
    } catch (err) {
      alert("Оруулахад алдаа гарлаа: " + (err instanceof Error ? err.message : "Тодорхойгүй алдаа"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string, path: string) {
    if (!confirm("Устгах уу?")) return;
    await deleteClassMedia(id, path);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="mb-5 rounded-2xl bg-white p-4 shadow-soft">
        <p className="mb-2 text-sm font-semibold text-brand-800">Шинэ зураг/бичлэг нэмэх</p>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Тайлбар (заавал биш)"
          className="mb-3 w-full rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="w-full text-sm"
        />
        {uploading && <p className="mt-2 text-xs text-brand-500">Оруулж байна...</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {media.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-xl bg-white shadow-soft">
            {m.media_type === "video" ? (
              <video src={m.url} controls className="aspect-square w-full object-cover" />
            ) : (
              <img src={m.url} alt={m.caption ?? ""} className="aspect-square w-full object-cover" />
            )}
            <div className="p-2">
              {m.caption && <p className="mb-1 text-xs text-brand-700">{m.caption}</p>}
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleDelete(m.id, m.storage_path)}>
                Устгах
              </Button>
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <p className="mt-6 text-center text-sm text-brand-400">Өнөөдөр зураг/бичлэг оруулаагүй байна.</p>
      )}
    </div>
  );
}
