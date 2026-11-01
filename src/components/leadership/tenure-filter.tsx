"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TenureFilter({
  tenures,
  current,
  basePath = "/leadership",
}: {
  tenures: { id: string; academic_year: string; status: string }[];
  current: string;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tenure", value);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select tenure" />
      </SelectTrigger>
      <SelectContent>
        {tenures.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.academic_year} {t.status === "active" ? "· Active" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
