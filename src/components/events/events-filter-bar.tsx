"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tenure } from "@/lib/types";

export function EventsFilterBar({ tenures }: { tenures: Pick<Tenure, "id" | "academic_year">[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/events?${params.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="w-48 pl-8 sm:w-56"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateParam("search", e.target.value);
          }}
        />
      </div>
      <Select defaultValue={searchParams.get("type") ?? "all"} onValueChange={(v) => updateParam("type", v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="technical_talk">Technical Talk</SelectItem>
          <SelectItem value="workshop">Workshop</SelectItem>
          <SelectItem value="webinar">Webinar</SelectItem>
          <SelectItem value="competition">Competition</SelectItem>
          <SelectItem value="seminar">Seminar</SelectItem>
          <SelectItem value="social">Social</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get("status") ?? "all"} onValueChange={(v) => updateParam("status", v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="planned">Planned</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={searchParams.get("tenureId") ?? "all"} onValueChange={(v) => updateParam("tenureId", v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Tenure" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tenures</SelectItem>
          {tenures.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.academic_year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
