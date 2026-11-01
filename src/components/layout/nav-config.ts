import {
  LayoutDashboard,
  Users,
  CalendarRange,
  CalendarDays,
  FileText,
  ArrowLeftRight,
  Archive,
  UserCog,
  ScrollText,
  Trophy,
  ListChecks,
  Award,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leadership", href: "/leadership", icon: Users },
  { label: "Tenure", href: "/tenure", icon: CalendarRange },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Handover", href: "/handover", icon: ArrowLeftRight },
  { label: "Archive", href: "/archive", icon: Archive },
  {
    label: "User Management",
    href: "/admin/users",
    icon: UserCog,
    roles: ["super_admin", "faculty_advisor", "executive"],
  },
  {
    label: "Activity Log",
    href: "/admin/activity",
    icon: ScrollText,
    roles: ["super_admin", "faculty_advisor", "executive"],
  },
];

const WORKING_NAV_ITEMS: NavItem[] = [
  { label: "My Tasks", href: "/tasks", icon: ListChecks },
  { label: "My Points & Badges", href: "/my-recognition", icon: Award },
];

export function visibleNavItems(role: UserRole): NavItem[] {
  if (role === "working") return WORKING_NAV_ITEMS;
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
