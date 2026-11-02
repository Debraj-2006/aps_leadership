"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Hash,
  IdCard,
  LogOut,
  Phone,
  ShieldCheck,
  User as UserIcon,
  UsersRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SkyScene } from "@/components/brand/sky-scene";
import { logoutAction } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/format";
import type { Profile } from "@/lib/types";

function Detail({ icon: Icon, label, value }: { icon: typeof Hash; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 px-1 py-1.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="type-eyebrow text-[10px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm text-foreground">{value || <span className="text-muted-foreground">Not added</span>}</p>
      </div>
    </div>
  );
}

export function UserMenu({ profile }: { profile: Profile }) {
  const name = profile.full_name || profile.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            aria-label={`Your profile: ${name}`}
            className="rounded-full outline-none ring-2 ring-transparent ring-offset-2 ring-offset-background transition-shadow hover:ring-trace/70 focus-visible:ring-ring data-[popup-open]:ring-trace"
          />
        }
      >
        <Avatar className="size-9">
          <AvatarFallback className="bg-ink text-xs font-semibold text-white">
            {initials(name) || <UserIcon className="size-4" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-1.5rem)] p-0">
        <div className="relative overflow-hidden bg-ink px-4 pt-5 pb-14 text-white">
          <SkyScene id="profile-menu" town="sm" petals={false} />
          <div className="relative flex items-center gap-3">
            <Avatar className="size-14 ring-2 ring-trace">
              <AvatarFallback className="bg-white/10 text-base font-semibold text-white">{initials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{name}</p>
              <p className="truncate text-xs text-white/70">{profile.email}</p>
              <p className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full bg-trace/20 px-2 py-0.5 text-[11px] font-medium text-trace">
                <BadgeCheck className="size-3 shrink-0" />
                <span className="truncate">
                  {ROLE_LABELS[profile.role]}
                  {profile.position ? ` · ${profile.position}` : ""}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-2">
          <p className="type-eyebrow px-1 pt-1 pb-1 text-[10px] text-primary">Your details</p>
          <Detail icon={UsersRound} label="Committee" value={ROLE_LABELS[profile.role]} />
          <Detail icon={BriefcaseBusiness} label="Position" value={profile.position} />
          <Detail icon={IdCard} label="IEEE membership no." value={profile.ieee_membership_no && <span className="type-readout">{profile.ieee_membership_no}</span>} />
          <Detail icon={Hash} label="Roll number" value={profile.roll_number} />
          <Detail icon={Phone} label="Phone" value={profile.phone} />
          <Detail icon={CalendarDays} label="Member since" value={format(new Date(profile.created_at), "d MMMM yyyy")} />
          <Detail
            icon={ShieldCheck}
            label="Account"
            value={profile.is_active ? <span className="font-medium text-success">Active</span> : "Waiting for approval"}
          />
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />
        <div className="p-1.5">
          <DropdownMenuItem render={<Link href="/my-recognition" />} className="gap-2 px-2.5 py-2">
            <Award className="size-4" /> My points &amp; badges
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/members" />} className="gap-2 px-2.5 py-2">
            <UsersRound className="size-4" /> All members
          </DropdownMenuItem>
          <form action={logoutAction}>
            <DropdownMenuItem
              nativeButton
              render={<button type="submit" className="flex w-full items-center gap-2 px-2.5 py-2 text-destructive" />}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
