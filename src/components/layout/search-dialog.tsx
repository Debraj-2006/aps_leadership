"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { searchEverything, type SearchGroup } from "@/lib/actions/search";
import { cn } from "@/lib/utils";

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [active, setActive] = useState(0);
  const [pending, startTransition] = useTransition();
  const latest = useRef("");

  // Ctrl+K / Cmd+K opens search from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Search after a short pause in typing; ignore answers to older queries.
  useEffect(() => {
    const q = query.trim();
    latest.current = q;
    if (q.length < 2) return; // the dialog shows a hint instead of results
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const result = await searchEverything(q);
        if (latest.current === q) {
          setGroups(result);
          setActive(0);
        }
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const flat = groups.flatMap((g) => g.hits);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active].href);
    }
  }

  let index = -1;
  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label="Search the hub"
        className="h-9 gap-2 px-2.5 text-muted-foreground sm:w-48 sm:justify-start sm:border sm:bg-card/70 lg:w-60"
      >
        <Search className="size-4" />
        <span className="hidden text-sm sm:inline">Search…</span>
        <kbd className="type-readout ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] lg:inline">Ctrl K</kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[12%] translate-y-0 gap-0 p-0 pt-1.5 sm:max-w-xl" showCloseButton={false}>
          <DialogTitle className="sr-only">Search the hub</DialogTitle>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search events, documents, members, tasks…"
              aria-label="Search"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {pending && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
          </div>
          <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
            {query.trim().length < 2 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Type at least two letters to search.</p>
            ) : !pending && groups.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing matches “{query.trim()}”.</p>
            ) : (
              groups.map((g) => (
                <div key={g.label} className="mb-2 last:mb-0">
                  <p className="type-eyebrow px-3 pt-2 pb-1 text-[10px] text-primary">{g.label}</p>
                  <ul>
                    {g.hits.map((hit) => {
                      index += 1;
                      const i = index;
                      return (
                        <li key={`${g.label}-${hit.id}`}>
                          <button
                            type="button"
                            onClick={() => go(hit.href)}
                            onMouseEnter={() => setActive(i)}
                            className={cn(
                              "flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors",
                              i === active ? "bg-secondary" : "hover:bg-secondary/60"
                            )}
                          >
                            <span className="truncate text-sm font-medium">{hit.title}</span>
                            {hit.subtitle && <span className="truncate text-xs text-muted-foreground capitalize">{hit.subtitle}</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
