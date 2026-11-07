"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { removeMyPhoto, uploadMyPhoto } from "@/lib/actions/profile";

const SIZE = 400; // pixels; plenty for every place a photo appears

// Crops the chosen picture to a centred square and shrinks it before upload.
async function toSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("no blob"))), "image/jpeg", 0.88)
  );
}

export function PhotoUploader({ name, src }: { name: string; src: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<{ blob: Blob; url: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Release the preview's memory when it's replaced or the page closes.
  useEffect(() => () => {
    if (draft) URL.revokeObjectURL(draft.url);
  }, [draft]);

  async function handleChoose(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file, such as a JPG or PNG.");
      return;
    }
    try {
      const blob = await toSquareJpeg(file);
      setDraft({ blob, url: URL.createObjectURL(blob) });
    } catch {
      toast.error("This photo format isn't supported here. Use a JPG or PNG.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function save() {
    if (!draft) return;
    const formData = new FormData();
    formData.append("photo", new File([draft.blob], "photo.jpg", { type: "image/jpeg" }));
    startTransition(async () => {
      const result = await uploadMyPhoto(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Photo saved. It now shows across the hub.");
        setDraft(null);
      }
    });
  }

  function remove() {
    if (!confirm("Remove your photo? Your initials will show instead.")) return;
    startTransition(async () => {
      const result = await removeMyPhoto();
      if (result?.error) toast.error(result.error);
      else toast.success("Photo removed.");
    });
  }

  return (
    <div className="flex flex-col items-center text-center">
      {/* The photo wears Doraemon's collar and bell. */}
      <div className="flex flex-col items-center">
        <MemberAvatar
          name={name}
          src={draft?.url ?? src}
          className="size-32 shadow-[0_12px_28px_-14px_rgb(0_90_160/0.7)] ring-4 ring-primary/20"
          fallbackClassName="bg-primary/10 text-3xl font-semibold text-primary"
        />
        <span className="-mt-1.5 h-2 w-20 rounded-full bg-collar" />
        <span className="-mt-1 size-4 rounded-full bg-trace ring-1 ring-[#7a5600]/50" />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        id="photo-input"
        onChange={(e) => handleChoose(e.target.files?.[0])}
      />

      {draft ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">This is how your photo will look.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button onClick={save} disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Save photo
            </Button>
            <Button variant="outline" onClick={() => setDraft(null)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">A clear photo of your face works best. We crop it to a square.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={pending}>
              <Camera className="size-4" />
              {src ? "Change photo" : "Add a photo"}
            </Button>
            {src && (
              <Button variant="ghost" onClick={remove} disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
                Remove
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
