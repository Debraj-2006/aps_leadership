import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TenureFilter } from "@/components/leadership/tenure-filter";
import { MemberFormDialog } from "@/components/leadership/member-form-dialog";
import { DeleteMemberButton } from "@/components/leadership/delete-member-button";
import { DesignationManager } from "@/components/leadership/designation-manager";
import { ExportCommitteeButton } from "@/components/leadership/export-committee-button";
import {
  getCommitteeMembers,
  getDesignations,
  getProfilesForSelect,
  getTenuresForSelect,
} from "@/lib/actions/leadership";
import { getCurrentProfile } from "@/lib/auth";
import { canManageLeadership, ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";
import { format } from "date-fns";

export default async function LeadershipPage({
  searchParams,
}: {
  searchParams: Promise<{ tenure?: string }>;
}) {
  const { profile } = await getCurrentProfile();
  const canManage = canManageLeadership(profile.role);

  const [tenures, designations, profiles] = await Promise.all([
    getTenuresForSelect(),
    getDesignations(),
    getProfilesForSelect(),
  ]);

  const { tenure } = await searchParams;
  const activeTenure = tenures.find((t) => t.status === "active");
  const selectedTenureId = tenure || activeTenure?.id || tenures[0]?.id;
  const members = selectedTenureId ? await getCommitteeMembers(selectedTenureId) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leadership Management"
        description="Executive committee roster and designations for each tenure."
        actions={
          <>
            {tenures.length > 0 && (
              <TenureFilter tenures={tenures} current={selectedTenureId ?? ""} />
            )}
            {members.length > 0 && (
              <ExportCommitteeButton
                tenureLabel={tenures.find((t) => t.id === selectedTenureId)?.academic_year ?? "committee"}
                members={members}
              />
            )}
            {canManage && <DesignationManager designations={designations} />}
            {canManage && selectedTenureId && (
              <MemberFormDialog tenureId={selectedTenureId} designations={designations} profiles={profiles} />
            )}
          </>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {!selectedTenureId ? (
            <p className="text-sm text-muted-foreground">
              No tenure exists yet. Create one in Tenure Management first.
            </p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No committee members assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => {
                    const initials = (m.profile?.full_name ?? "?")
                      .split(" ")
                      .map((p: string) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium leading-tight">{m.profile?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{m.profile?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{m.custom_title || m.designation?.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ROLE_LABELS[(m.profile?.role as UserRole) ?? "working"]}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {m.joined_at ? format(new Date(m.joined_at), "dd MMM yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          {m.is_outgoing ? (
                            <Badge variant="secondary">Outgoing</Badge>
                          ) : (
                            <Badge>Active</Badge>
                          )}
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <MemberFormDialog
                                tenureId={selectedTenureId}
                                designations={designations}
                                profiles={profiles}
                                editing={m}
                              />
                              <DeleteMemberButton id={m.id} />
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
