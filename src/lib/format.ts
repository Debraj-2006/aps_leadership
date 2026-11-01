export function initials(name: string | null | undefined): string {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

// "2026-2027" -> "2026–27"; anything else is returned unchanged.
export function shortAcademicYear(year: string): string {
  const match = /^(\d{4})\s*[-–]\s*(\d{4})$/.exec(year.trim());
  return match ? `${match[1]}–${match[2].slice(2)}` : year;
}
