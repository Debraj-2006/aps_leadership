import { format, parseISO } from "date-fns";
import { Crown, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MemberFormDialog } from "@/components/leadership/member-form-dialog";
import { DeleteMemberButton } from "@/components/leadership/delete-member-button";
import { DesignationManager } from "@/components/leadership/designation-manager";
import { ExportCommitteeButton } from "@/components/leadership/export-committee-button";
import { getCommitteeMembers, getDesignations, getProfilesForSelect } from "@/lib/actions/leadership";
import { getMemberDirectory } from "@/lib/actions/users";
import { getCurrentProfile } from "@/lib/auth";
import { canManageLeadership, ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

type DirectoryMember = Awaited<ReturnType<typeof getMemberDirectory>>[number];

// Chair and faculty roles first, then everyone else alphabetically.
const POSITION_ORDER = ["faculty advisor", "chairperson", "chair", "vice chair", "vice-chair", "secretary", "treasurer"];
function positionRank(position: string | null) {
  const p = (position ?? "").toLowerCase();
  const i = POSITION_ORDER.findIndex((x) => p === x || p.startsWith(x));
  return i === -1 ? POSITION_ORDER.length : i;
}
function sortCommittee(list: DirectoryMember[]) {
  return [...list].sort(
    (a, b) => positionRank(a.position) - positionRank(b.position) || (a.full_name ?? "").localeCompare(b.full_name ?? ""),
  );
}

function MemberCard({ m, featured }: { m: DirectoryMember; featured?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:border-primary/30",
        featured && "border-trace/40",
      )}
    >
      <Avatar className={cn("size-11", featured && "ring-2 ring-trace")}>
        <AvatarFallback className={cn("text-sm font-semibold", featured ? "bg-ink text-white" : "bg-primary/10 text-primary")}>
          {initials(m.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium leading-tight">{m.full_name}</p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{m.position || ROLE_LABELS[m.role]}</p>
      </div>
    </div>
  );
}

function CommitteeSection({
  title,
  description,
  members,
  featured,
}: {
  title: string;
  description: string;
  members: DirectoryMember[];
  featured?: boolean;
}) {
  return (
    <section aria-label={title}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="type-eyebrow flex items-center gap-2 text-foreground">
            {featured && <Crown className="size-3.5 text-trace" />}
            {title}
            <span className="type-readout rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border">
              {members.length}
            </span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card/50 p-4 text-sm text-muted-foreground">No one here yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((m) => (
            <MemberCard key={m.id} m={m} featured={featured} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function LeadershipPage() {
  const { profile } = await getCurrentProfile();
  const canManage = canManageLeadership(profile.role);

  const [members, designations, profiles, directory] = await Promise.all([
    getCommitteeMembers(),
    getDesignations(),
    getProfilesForSelect(),
    getMemberDirectory(),
  ]);

  const executives = sortCommittee(directory.filter((m) => m.role === "executive"));
  const core = sortCommittee(directory.filter((m) => m.role === "core"));
  const workingCount = directory.filter((m) => m.role === "working").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leadership"
        description={`The people running IEEE AP-S IEM this tenure.${workingCount ? ` Supported by ${workingCount} working committee member${workingCount === 1 ? "" : "s"}.` : ""}`}
        actions={
          <>
            {members.length > 0 && <ExportCommitteeButton members={members} />}
            {canManage && <DesignationManager designations={designations} />}
            {canManage && <MemberFormDialog designations={designations} profiles={profiles} />}
          </>
        }
      />

      {executives.length === 0 && core.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No committee members yet"
          description="Executive and core committee members appear here once their accounts are approved."
        />
      ) : (
        <>
          <CommitteeSection
            title="Executive Committee"
            description="Chapter leadership and faculty."
            members={executives}
            featured
          />
          <CommitteeSection title="Core Committee" description="Leads for each area of the chapter." members={core} />
        </>
      )}

      {members.length > 0 && (
        <section aria-label="Designation roster">
          <h2 className="type-eyebrow mb-3 text-foreground">Designation roster</h2>
          <Card className="py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5">Member</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && <TableHead className="pr-5 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[11px] font-medium">{initials(m.profile?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-tight">{m.profile?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{m.profile?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{m.custom_title || m.designation?.title}</TableCell>
                    <TableCell className="text-muted-foreground">{ROLE_LABELS[(m.profile?.role as UserRole) ?? "working"]}</TableCell>
                    <TableCell className="type-readout text-xs text-muted-foreground">
                      {m.joined_at ? format(parseISO(m.joined_at), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      {m.is_outgoing ? <StatusPill tone="warning">Outgoing</StatusPill> : <StatusPill tone="success">Serving</StatusPill>}
                    </TableCell>
                    {canManage && (
                      <TableCell className="pr-5 text-right">
                        <div className="flex justify-end gap-1">
                          <MemberFormDialog designations={designations} profiles={profiles} editing={m} />
                          <DeleteMemberButton id={m.id} />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      )}
    </div>
  );
}
