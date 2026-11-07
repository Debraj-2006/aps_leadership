import Link from "next/link";
import { format } from "date-fns";
import { UsersRound } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ReadoutStrip } from "@/components/shared/readout-strip";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth";
import { getMemberDirectory } from "@/lib/actions/users";
import { ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

const FILTERS: { key: string; label: string; roles: UserRole[] | null }[] = [
  { key: "all", label: "Everyone", roles: null },
  { key: "executive", label: "Executive", roles: ["executive", "super_admin", "faculty_advisor"] },
  { key: "core", label: "Core", roles: ["core"] },
  { key: "working", label: "Working", roles: ["working"] },
];

export default async function MembersPage({ searchParams }: { searchParams: Promise<{ committee?: string }> }) {
  const [{ profile }, members, { committee }] = await Promise.all([getCurrentProfile(), getMemberDirectory(), searchParams]);

  const active = FILTERS.find((f) => f.key === committee) ?? FILTERS[0];
  const shown = active.roles ? members.filter((m) => active.roles!.includes(m.role)) : members;
  const count = (roles: UserRole[]) => members.filter((m) => roles.includes(m.role)).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Members" description="Everyone who has joined the chapter hub, newest first." />

      <ReadoutStrip
        items={[
          { label: "Members", value: members.length, hint: "Approved accounts" },
          { label: "Executive", value: count(["executive", "super_admin", "faculty_advisor"]), hint: "Incl. Faculty Advisor" },
          { label: "Core", value: count(["core"]), hint: "Core Committee" },
          { label: "Working", value: count(["working"]), hint: "Working Committee" },
        ]}
      />

      <nav aria-label="Filter by committee" className="inline-flex flex-wrap rounded-lg border bg-card p-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/members" : `/members?committee=${f.key}`}
            aria-current={f.key === active.key ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              f.key === active.key ? "bg-ink text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <EmptyState icon={UsersRound} title="No members here yet" description="Approved members will appear here." />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Member</TableHead>
                <TableHead>Committee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="pr-5 text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((m) => {
                const isMe = m.id === profile.id;
                return (
                  <TableRow key={m.id} className={cn(isMe && "bg-trace/10 hover:bg-trace/15")}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <MemberAvatar name={m.full_name} src={m.avatar_url} className="size-8" fallbackClassName="text-[11px] font-medium" />
                        <p className="text-sm font-medium">
                          {m.full_name || "Unnamed member"}
                          {isMe && <span className="font-normal text-muted-foreground"> (you)</span>}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ROLE_LABELS[m.role]}</TableCell>
                    <TableCell className="text-muted-foreground">{m.position ?? "—"}</TableCell>
                    <TableCell className="type-readout pr-5 text-right text-xs text-muted-foreground">
                      {format(new Date(m.created_at), "dd MMM yyyy")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
