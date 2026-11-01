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
export function DocumentsFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/documents?${params.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="w-48 pl-8 sm:w-56"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateParam("search", e.target.value);
          }}
        />
      </div>
      <Select defaultValue={searchParams.get("category") ?? "all"} onValueChange={(v) => updateParam("category", v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          <SelectItem value="event_report">Event Report</SelectItem>
          <SelectItem value="meeting_minutes">Meeting Minutes</SelectItem>
          <SelectItem value="certificate">Certificate</SelectItem>
          <SelectItem value="financial_report">Financial Report</SelectItem>
          <SelectItem value="handover">Handover</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
