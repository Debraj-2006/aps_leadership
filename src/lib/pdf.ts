import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND = { r: 0, g: 50, b: 80 };

function addLetterhead(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("IEEE Antennas & Propagation Society", 14, 12);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Student Branch Chapter · Institute of Engineering & Management", 14, 18);

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 40);
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 90, 90);
    doc.text(subtitle, 14, 46);
  }
  doc.setTextColor(20, 20, 20);
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.getHeight();
    const w = doc.internal.pageSize.getWidth();
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Generated ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · Leadership & Tenure Transition Hub`,
      14,
      h - 8
    );
    doc.text(`Page ${i} of ${pageCount}`, w - 30, h - 8);
  }
}

export function generateCommitteeReport(
  tenureLabel: string,
  members: { name: string; designation: string; email: string; status: string }[]
) {
  const doc = new jsPDF();
  addLetterhead(doc, "Executive Committee Roster", tenureLabel);
  autoTable(doc, {
    startY: 54,
    head: [["Name", "Designation", "Email", "Status"]],
    body: members.map((m) => [m.name, m.designation, m.email, m.status]),
    headStyles: { fillColor: [0, 50, 80] },
    styles: { fontSize: 9 },
  });
  addFooter(doc);
  doc.save(`committee-roster-${tenureLabel}.pdf`);
}

export function generateEventsReport(
  scope: string,
  events: { title: string; type: string; date: string; status: string; venue: string }[]
) {
  const doc = new jsPDF();
  addLetterhead(doc, "Events Report", scope);
  autoTable(doc, {
    startY: 54,
    head: [["Event", "Type", "Date", "Status", "Venue"]],
    body: events.map((e) => [e.title, e.type, e.date, e.status, e.venue]),
    headStyles: { fillColor: [0, 50, 80] },
    styles: { fontSize: 9 },
  });
  addFooter(doc);
  doc.save(`events-report-${scope}.pdf`);
}

export function generateHandoverReport(params: {
  fromTenure: string;
  toTenure: string;
  designation: string;
  outgoing: string;
  incoming: string;
  notes: string;
  tasks: { title: string; status: string; priority: string; dueDate: string }[];
}) {
  const doc = new jsPDF();
  addLetterhead(doc, "Handover Summary Report", `${params.designation} · ${params.fromTenure} → ${params.toTenure}`);

  doc.setFontSize(10);
  doc.text(`Outgoing: ${params.outgoing}`, 14, 56);
  doc.text(`Incoming: ${params.incoming}`, 14, 62);

  let nextY = 70;
  if (params.notes) {
    const lines = doc.splitTextToSize(`Notes: ${params.notes}`, 180);
    doc.text(lines, 14, nextY);
    nextY += lines.length * 5 + 6;
  }

  autoTable(doc, {
    startY: nextY,
    head: [["Task", "Priority", "Status", "Due Date"]],
    body: params.tasks.map((t) => [t.title, t.priority, t.status, t.dueDate]),
    headStyles: { fillColor: [0, 50, 80] },
    styles: { fontSize: 9 },
  });

  addFooter(doc);
  doc.save(`handover-${params.designation}-${params.fromTenure}-to-${params.toTenure}.pdf`);
}

export function generateTenureReport(params: {
  academicYear: string;
  theme: string;
  achievements: string;
  members: { name: string; designation: string }[];
  events: { title: string; date: string; status: string }[];
}) {
  const doc = new jsPDF();
  addLetterhead(doc, `Tenure Report · ${params.academicYear}`, params.theme);

  let y = 56;
  if (params.achievements) {
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(`Achievements: ${params.achievements}`, 180);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 8;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Committee", 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [["Name", "Designation"]],
    body: params.members.map((m) => [m.name, m.designation]),
    headStyles: { fillColor: [0, 50, 80] },
    styles: { fontSize: 9 },
  });

  const afterMembersY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Events Conducted", 14, afterMembersY);
  autoTable(doc, {
    startY: afterMembersY + 4,
    head: [["Event", "Date", "Status"]],
    body: params.events.map((e) => [e.title, e.date, e.status]),
    headStyles: { fillColor: [0, 50, 80] },
    styles: { fontSize: 9 },
  });

  addFooter(doc);
  doc.save(`tenure-report-${params.academicYear}.pdf`);
}
