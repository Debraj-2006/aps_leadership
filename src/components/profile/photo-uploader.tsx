"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { removeMyPhoto, uploadMyPhoto } from "@/lib/actions/profile";

const SIZE = 400; // pixels; plenty for every place a photo appears
const MAX_BYTES = 20 * 1024 * 1024;

// JPG or PNG, judged by type or by name: some phone galleries label photos oddly
// ("image/jpg", a generic type, or none at all).
function isJpgOrPng(file: File) {
  return /^image\/(jpeg|jpg|pjpeg|png)$/i.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
}

// iPhone photos (HEIC/HEIF) are converted to JPG in the browser before cropping.
function isHeic(file: File) {
  return /^image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

async function heicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import("heic2any"); // loaded only when needed (it's large)
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob = Array.isArray(out) ? out[0] : out;
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

// Reads the picture, falling back to a plain <img> if the browser's fast decoder refuses it.
async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; done: () => void }> {
  try {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, done: () => bitmap.close() };
  } catch {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
  }
}

// Crops the chosen picture to a centred square and shrinks it before upload.
async function toSquareJpeg(file: File): Promise<Blob> {
  const { source, width, height, done } = await decode(file);
  const side = Math.min(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.fillStyle = "#ffffff"; // transparent PNG areas become white, not black
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.drawImage(source, (width - side) / 2, (height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  done();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("no blob"))), "image/jpeg", 0.88)
  );
}

export function PhotoUploader({ name, src }: { name: string; src: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<{ blob: Blob; url: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [preparing, setPreparing] = useState(false);

  // Release the preview's memory when it's replaced or the page closes.
  useEffect(() => () => {
    if (draft) URL.revokeObjectURL(draft.url);
  }, [draft]);

  async function handleChoose(file: File | undefined) {
    if (!file) return;
    try {
      const heic = isHeic(file);
      if (!heic && !isJpgOrPng(file)) {
        toast.error("Use a JPG, PNG or iPhone (HEIC) photo.");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("That photo is over 20 MB. Choose a smaller one.");
        return;
      }
      setPreparing(true);
      const blob = await toSquareJpeg(heic ? await heicToJpeg(file) : file);
      setDraft({ blob, url: URL.createObjectURL(blob) });
    } catch {
      toast.error("This photo couldn't be opened. Try another JPG, PNG or iPhone photo.");
    } finally {
      setPreparing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function save() {
    if (!draft) return;
    const formData = new FormData();
    formData.append("photo", new File([draft.blob], "photo.jpg", { type: "image/jpeg" }));
    startTransition(async () => {
      try {
        const result = await uploadMyPhoto(formData);
        if (result?.error) toast.error(result.error);
        else {
          toast.success("Photo saved. It now shows across the hub.");
          setDraft(null);
        }
      } catch {
        toast.error("The photo couldn't be uploaded. Check your connection and try again.");
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
        accept=".jpg,.jpeg,.png,.heic,.heif,image/jpeg,image/png,image/heic,image/heif"
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
          <p className="mt-4 text-sm text-muted-foreground">JPG, PNG or iPhone photo. A clear photo of your face works best; we crop it to a square.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={pending || preparing}>
              {preparing ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              {preparing ? "Preparing photo…" : src ? "Change photo" : "Add a photo"}
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
