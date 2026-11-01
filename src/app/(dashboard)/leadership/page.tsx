import { format, parseISO } from "date-fns";
import { Users } from "lucide-react";
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
import {
  getCommitteeMembers,
  getDesignations,
  getProfilesForSelect,
} from "@/lib/actions/leadership";
import { getCurrentProfile } from "@/lib/auth";
import { canManageLeadership, ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/format";
import type { UserRole } from "@/lib/types";

export default async function LeadershipPage() {
  const { profile } = await getCurrentProfile();
  const canManage = canManageLeadership(profile.role);

  const [members, designations, profiles] = await Promise.all([
    getCommitteeMembers(),
    getDesignations(),
    getProfilesForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leadership"
        description="The chapter's committee roster and designations."
        actions={
          <>
            {members.length > 0 && <ExportCommitteeButton members={members} />}
            {canManage && <DesignationManager designations={designations} />}
            {canManage && <MemberFormDialog designations={designations} profiles={profiles} />}
          </>
        }
      />

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No committee members yet"
          description={canManage ? "Use “Add member” to build the roster." : "The roster will appear once members are added."}
        />
      ) : (
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
                    {m.is_outgoing ? (
                      <StatusPill tone="warning">Outgoing</StatusPill>
                    ) : (
                      <StatusPill tone="success">Serving</StatusPill>
                    )}
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
      )}
    </div>
  );
}
