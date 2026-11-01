import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { UserCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusPill } from "@/components/shared/status-pill";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { RoleSelect } from "@/components/admin/role-select";
import { ActiveToggleButton } from "@/components/admin/active-toggle-button";
import { getAllProfiles } from "@/lib/actions/users";
import { getCurrentProfile } from "@/lib/auth";
import { canApprovePendingUsers, canManageUsers, ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/format";
import type { Profile, UserRole } from "@/lib/types";

export default async function UserManagementPage() {
  const { profile } = await getCurrentProfile();
  if (!canApprovePendingUsers(profile.role)) redirect("/dashboard");

  const canEditRoles = canManageUsers(profile.role);
  const profiles = (await getAllProfiles()) as Profile[];
  const waiting = profiles
    .filter((p) => !p.is_active)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const active = profiles.filter((p) => p.is_active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User management"
        description={
          waiting.length > 0
            ? `${waiting.length} ${waiting.length === 1 ? "person is" : "people are"} waiting for approval.`
            : "Approve new members and manage access across the chapter hub."
        }
        actions={canEditRoles ? <CreateUserDialog /> : undefined}
      />

      <section aria-labelledby="waiting-heading" className="space-y-3">
        <h2 id="waiting-heading" className="type-eyebrow flex items-center gap-2 text-foreground">
          <span className="size-1.5 rounded-full bg-trace" aria-hidden="true" />
          Waiting for approval
          <span className="type-readout rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-foreground">{waiting.length}</span>
        </h2>
        {waiting.length === 0 ? (
          <EmptyState compact icon={UserCheck} title="No one is waiting" description="New sign-ups appear here until an Executive approves them." />
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {waiting.map((p) => (
              <li key={p.id} className="flex flex-col rounded-xl border bg-card p-4 shadow-[inset_3px_0_0_0_var(--trace)]">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-[11px] font-medium">{initials(p.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.full_name || p.email}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="type-eyebrow text-[10px] text-muted-foreground">Tier</dt>
                    <dd className="mt-0.5 font-medium">{ROLE_LABELS[p.role as UserRole]}</dd>
                  </div>
                  <div>
                    <dt className="type-eyebrow text-[10px] text-muted-foreground">Position</dt>
                    <dd className="mt-0.5 font-medium">{p.position ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="type-eyebrow text-[10px] text-muted-foreground">IEEE no.</dt>
                    <dd className="type-readout mt-0.5">{p.ieee_membership_no ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="type-eyebrow text-[10px] text-muted-foreground">Signed up</dt>
                    <dd className="mt-0.5">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex justify-end border-t pt-3">
                  <ActiveToggleButton profileId={p.id} isActive={false} name={p.full_name || p.email} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="members-heading" className="space-y-3">
        <h2 id="members-heading" className="type-eyebrow text-foreground">
          Members
          <span className="type-readout ml-2 rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-foreground">{active.length}</span>
        </h2>
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">User</TableHead>
                <TableHead>IEEE no.</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {active.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-[11px] font-medium">{initials(p.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-tight">{p.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.email}
                          {p.position ? ` · ${p.position}` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="type-readout text-xs text-muted-foreground">{p.ieee_membership_no ?? "—"}</TableCell>
                  <TableCell>
                    {canEditRoles ? (
                      <RoleSelect profileId={p.id} role={p.role} />
                    ) : (
                      <span className="text-sm">{ROLE_LABELS[p.role as UserRole]}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone="success">Active</StatusPill>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {p.id === profile.id ? (
                      <span className="text-xs text-muted-foreground">You</span>
                    ) : (
                      <ActiveToggleButton profileId={p.id} isActive name={p.full_name} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}
