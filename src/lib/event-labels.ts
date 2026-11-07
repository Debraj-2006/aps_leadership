export const EVENT_TYPE_LABEL: Record<string, string> = {
  technical_talk: "Technical talk",
  workshop: "Workshop",
  webinar: "Webinar",
  competition: "Competition",
  seminar: "Seminar",
  social: "Social",
  other: "Other",
};

// "NA", "N/A", "-" and similar placeholders aren't worth showing.
export function meaningful(value: string | null | undefined) {
  if (!value) return null;
  return /^(na|n\/a|none|nil|-+|—)$/i.test(value.trim()) ? null : value;
}
