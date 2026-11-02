"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterSelect {
  param: string;
  label: string;
  options: { value: string; label: string }[];
}

// Search box + dropdown filters that live in the URL, so filtered views can be shared.
// Search waits for a pause in typing before reloading the page.
export function FilterToolbar({
  basePath,
  searchPlaceholder,
  selects,
  children,
}: {
  basePath: string;
  searchPlaceholder: string;
  selects: FilterSelect[];
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${basePath}?${qs}` : basePath));
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:min-w-56">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          className="h-9 border-transparent bg-muted/60 pl-8 shadow-none focus-visible:bg-card"
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => push("search", value.trim() || null), 350);
          }}
        />
        {pending && <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {selects.map((s) => (
          <Select
            key={s.param}
            defaultValue={searchParams.get(s.param) ?? "all"}
            items={s.options}
            onValueChange={(v) => push(s.param, v as string)}
          >
            <SelectTrigger className="h-9 w-full min-w-40 sm:w-auto" aria-label={s.label}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {s.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {children}
      </div>
    </div>
  );
}
