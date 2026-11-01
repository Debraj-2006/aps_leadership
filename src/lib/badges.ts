import {
  Award,
  Crown,
  HandHeart,
  Lightbulb,
  Megaphone,
  Palette,
  Rocket,
  Star,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface BadgeDefinition {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  className: string;
}

export const BADGES: BadgeDefinition[] = [
  { key: "star_performer", label: "Star Performer", description: "Outstanding overall contribution to the event.", icon: Star, className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  { key: "event_lead", label: "Event Lead", description: "Led the planning or execution of the event.", icon: Crown, className: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300" },
  { key: "best_volunteer", label: "Best Volunteer", description: "Went above and beyond as a volunteer.", icon: HandHeart, className: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300" },
  { key: "technical_excellence", label: "Technical Excellence", description: "Strong technical work — demos, setup or content.", icon: Wrench, className: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300" },
  { key: "creative_mind", label: "Creative Mind", description: "Design, posters, media or creative ideas.", icon: Palette, className: "bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300" },
  { key: "team_player", label: "Team Player", description: "Helped everyone and kept the team together.", icon: Users, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { key: "outreach_champion", label: "Outreach Champion", description: "Brought in participants, sponsors or speakers.", icon: Megaphone, className: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300" },
  { key: "innovator", label: "Innovator", description: "Introduced a new idea that improved the event.", icon: Lightbulb, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300" },
  { key: "rising_star", label: "Rising Star", description: "Newer member who showed great promise.", icon: Rocket, className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300" },
];

const FALLBACK: BadgeDefinition = {
  key: "other",
  label: "Recognition",
  description: "",
  icon: Award,
  className: "bg-muted text-foreground",
};

export function getBadge(key: string): BadgeDefinition {
  return BADGES.find((b) => b.key === key) ?? { ...FALLBACK, key, label: key };
}
