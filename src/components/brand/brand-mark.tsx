import Image from "next/image";
import apsMark from "@/assets/brand/ieee-aps-mark.png";
import { cn } from "@/lib/utils";

// The IEEE AP-S symbol (arcs, dot and triangle) on a white tile.
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-black/5", className)}>
      <Image src={apsMark} alt="" fill sizes="48px" className="object-contain" />
    </span>
  );
}
