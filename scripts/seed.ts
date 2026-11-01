import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEFAULT_PASSWORD = "IEEEAPS@2025";

if (!SUPABASE_URL || !SERVICE_KEY || SUPABASE_URL.includes("your-project-ref")) {
  console.error(
    "Missing or placeholder Supabase credentials in .env.local. Fill in NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Role = "super_admin" | "faculty_advisor" | "executive" | "core" | "working";

interface SeedPerson {
  key: string;
  full_name: string;
  email: string;
  role: Role;
  ieee_membership_no: string;
  roll_number?: string;
  phone?: string;
  is_active: boolean;
}

const PEOPLE: SeedPerson[] = [
  { key: "fa", full_name: "Dr. Arindam Biswas", email: "arindam.biswas@ieeeapsiem.org", role: "faculty_advisor", ieee_membership_no: "90112233", phone: "+91-98300-00001", is_active: true },
  { key: "sa", full_name: "Prof. Sulagna Mukherjee", email: "sulagna.mukherjee@ieeeapsiem.org", role: "super_admin", ieee_membership_no: "90112234", phone: "+91-98300-00002", is_active: true },

  { key: "rajdeep", full_name: "Rajdeep Ghoshal", email: "rajdeep.ghoshal@ieeeapsiem.org", role: "core", ieee_membership_no: "96100011", roll_number: "IEM/CSE/19/011", is_active: false },
  { key: "suman", full_name: "Suman Kar", email: "suman.kar@ieeeapsiem.org", role: "core", ieee_membership_no: "96100012", roll_number: "IEM/ECE/19/034", is_active: false },

  { key: "souvik", full_name: "Souvik Mondal", email: "souvik.mondal@ieeeapsiem.org", role: "core", ieee_membership_no: "96100013", roll_number: "IEM/ECE/20/008", is_active: false },
  { key: "trisha", full_name: "Trisha Dasgupta", email: "trisha.dasgupta@ieeeapsiem.org", role: "core", ieee_membership_no: "96100014", roll_number: "IEM/CSE/20/019", is_active: false },
  { key: "kunal", full_name: "Kunal Basak", email: "kunal.basak@ieeeapsiem.org", role: "core", ieee_membership_no: "96100015", roll_number: "IEM/ECE/20/027", is_active: false },

  { key: "rohan", full_name: "Rohan Chatterjee", email: "rohan.chatterjee@ieeeapsiem.org", role: "core", ieee_membership_no: "96100016", roll_number: "IEM/ECE/21/004", is_active: false },
  { key: "ananya", full_name: "Ananya Sen", email: "ananya.sen@ieeeapsiem.org", role: "core", ieee_membership_no: "96100017", roll_number: "IEM/ECE/21/012", is_active: false },
  { key: "debanjan", full_name: "Debanjan Roy", email: "debanjan.roy@ieeeapsiem.org", role: "core", ieee_membership_no: "96100018", roll_number: "IEM/CSE/21/021", is_active: false },
  { key: "priya", full_name: "Priya Mallick", email: "priya.mallick@ieeeapsiem.org", role: "core", ieee_membership_no: "96100019", roll_number: "IEM/ECE/21/030", is_active: false },

  { key: "ritika", full_name: "Ritika Banerjee", email: "ritika.banerjee@ieeeapsiem.org", role: "core", ieee_membership_no: "96100020", roll_number: "IEM/ECE/22/003", is_active: false },
  { key: "arka", full_name: "Arka Pramanik", email: "arka.pramanik@ieeeapsiem.org", role: "core", ieee_membership_no: "96100021", roll_number: "IEM/CSE/22/014", is_active: false },
  { key: "snigdha", full_name: "Snigdha Haldar", email: "snigdha.haldar@ieeeapsiem.org", role: "core", ieee_membership_no: "96100022", roll_number: "IEM/ECE/22/022", is_active: false },
  { key: "abhirup", full_name: "Abhirup Saha", email: "abhirup.saha@ieeeapsiem.org", role: "core", ieee_membership_no: "96100023", roll_number: "IEM/ECE/22/029", is_active: false },

  { key: "ishaan", full_name: "Ishaan Verma", email: "ishaan.verma@ieeeapsiem.org", role: "executive", ieee_membership_no: "96100024", roll_number: "IEM/ECE/23/005", is_active: true },
  { key: "nabanita", full_name: "Nabanita Chowdhury", email: "nabanita.chowdhury@ieeeapsiem.org", role: "core", ieee_membership_no: "96100025", roll_number: "IEM/CSE/23/016", is_active: true },
  { key: "farhan", full_name: "Farhan Ahmed", email: "farhan.ahmed@ieeeapsiem.org", role: "core", ieee_membership_no: "96100026", roll_number: "IEM/ECE/23/024", is_active: true },
  { key: "pritha", full_name: "Pritha Sengupta", email: "pritha.sengupta@ieeeapsiem.org", role: "core", ieee_membership_no: "96100027", roll_number: "IEM/ECE/23/031", is_active: true },
  { key: "megha", full_name: "Megha Chakraborty", email: "megha.chakraborty@ieeeapsiem.org", role: "working", ieee_membership_no: "96100028", roll_number: "IEM/CSE/24/009", is_active: true },
];

const DESIGNATIONS = [
  { key: "faculty_advisor", title: "Faculty Advisor", rank: 0 },
  { key: "chairperson", title: "Chairperson", rank: 1 },
  { key: "vice_chairperson", title: "Vice-Chairperson", rank: 2 },
  { key: "secretary", title: "Secretary", rank: 3 },
  { key: "treasurer", title: "Treasurer", rank: 4 },
  { key: "webmaster", title: "Webmaster & Technical Lead", rank: 5 },
  { key: "event_coordinator", title: "Event Coordinator", rank: 6 },
  { key: "media_coordinator", title: "Media & Publicity Coordinator", rank: 7 },
  { key: "executive_member", title: "Executive Member", rank: 8 },
];

const TENURES = [
  { key: "t1", academic_year: "2022-2023", start_date: "2022-08-01", end_date: "2023-07-31", status: "completed", theme: "Foundation & Outreach", achievements: "Chartered the IEEE AP-S Student Branch Chapter at IEM; conducted the first two technical sessions and onboarded 40+ founding members." },
  { key: "t2", academic_year: "2023-2024", start_date: "2023-08-01", end_date: "2024-07-31", status: "completed", theme: "Expansion & Technical Depth", achievements: "Grew membership to 90+ students, ran the chapter's first hands-on simulation workshop, and celebrated IEEE Day with a cross-department turnout." },
  { key: "t3", academic_year: "2024-2025", start_date: "2024-08-01", end_date: "2025-07-31", status: "completed", theme: "Innovation & Industry Collaboration", achievements: "Hosted a metamaterials research talk, ran the chapter's first PCB antenna design competition, and launched a webinar series on propagation modelling." },
  { key: "t4", academic_year: "2025-2026", start_date: "2025-08-01", end_date: "2026-07-31", status: "completed", theme: "Industry Connect & Research Readiness", achievements: "Partnered with ISRO alumni for an industry talk, ran an RF & microwave hands-on workshop, and strengthened financial recordkeeping ahead of handover." },
  { key: "t5", academic_year: "2026-2027", start_date: "2026-08-01", end_date: "2027-07-31", status: "active", theme: "Research & Global Outreach", achievements: null },
];

const EVENTS = [
  { tenure: "t1", title: "Fundamentals of Antenna Design", type: "technical_talk", event_date: "2022-10-15", status: "completed", venue: "Seminar Hall 2, IEM Salt Lake", speaker: "Dr. Arindam Biswas", attendees_count: 65, description: "Introductory session on antenna theory, radiation patterns and basic design parameters for new members." },
  { tenure: "t1", title: "Intro to RF Systems", type: "workshop", event_date: "2023-02-20", status: "completed", venue: "Electronics Lab, IEM", speaker: "Rajdeep Ghoshal", attendees_count: 42, description: "Hands-on orientation to RF test equipment and basic measurement techniques." },

  { tenure: "t2", title: "5G and Beyond: Antenna Challenges", type: "technical_talk", event_date: "2023-10-05", status: "completed", venue: "Auditorium, IEM Salt Lake", speaker: "Prof. Sulagna Mukherjee", attendees_count: 110, description: "Overview of antenna design challenges for 5G/6G systems and massive MIMO." },
  { tenure: "t2", title: "Hands-on with HFSS Simulation", type: "workshop", event_date: "2024-01-18", status: "completed", venue: "CAD Lab, IEM", speaker: "Souvik Mondal", attendees_count: 38, description: "Guided simulation workshop on Ansys HFSS for patch antenna design." },
  { tenure: "t2", title: "IEEE Day Celebration", type: "social", event_date: "2023-10-07", status: "completed", venue: "IEM Campus Grounds", speaker: null, attendees_count: 150, description: "Chapter-wide celebration of IEEE Day with games, exhibits and networking." },

  { tenure: "t3", title: "Metamaterials for Next-Gen Antennas", type: "technical_talk", event_date: "2024-09-12", status: "completed", venue: "Seminar Hall 1, IEM", speaker: "Dr. Arindam Biswas", attendees_count: 80, description: "Deep-dive into metamaterial-based antenna miniaturization techniques." },
  { tenure: "t3", title: "PCB Antenna Design Competition", type: "competition", event_date: "2024-11-23", status: "completed", venue: "Electronics Lab, IEM", speaker: null, attendees_count: 54, description: "Inter-team competition to design and fabricate the most efficient PCB antenna." },
  { tenure: "t3", title: "Propagation Modelling Webinar", type: "webinar", event_date: "2025-02-14", status: "completed", venue: "Online", speaker: "Rohan Chatterjee", attendees_count: 95, description: "Webinar covering path-loss models and propagation prediction tools." },

  { tenure: "t4", title: "Industry Talk: Satellite Communication at ISRO", type: "technical_talk", event_date: "2025-09-20", status: "completed", venue: "Auditorium, IEM Salt Lake", speaker: "ISRO Alumni Panel", attendees_count: 140, description: "Industry perspective on satellite antenna systems and career pathways at ISRO." },
  { tenure: "t4", title: "RF & Microwave Workshop", type: "workshop", event_date: "2025-12-05", status: "completed", venue: "Electronics Lab, IEM", speaker: "Ritika Banerjee", attendees_count: 47, description: "Two-day hands-on workshop on RF/microwave measurement and matching networks." },
  { tenure: "t4", title: "IEEE Day Celebration 2025", type: "social", event_date: "2025-10-04", status: "completed", venue: "IEM Campus Grounds", speaker: null, attendees_count: 170, description: "Annual IEEE Day celebration with technical exhibits and alumni meet-up." },

  { tenure: "t5", title: "Orientation & Membership Drive", type: "seminar", event_date: "2026-08-25", status: "completed", venue: "Seminar Hall 2, IEM", speaker: "Ishaan Verma", attendees_count: 120, description: "Kickoff session introducing the new committee and recruiting first-year members." },
  { tenure: "t5", title: "Antenna Measurement Techniques Workshop", type: "workshop", event_date: "2026-10-10", status: "completed", venue: "Electronics Lab, IEM", speaker: "Nabanita Chowdhury", attendees_count: 50, description: "Workshop on anechoic chamber basics and far-field measurement techniques." },
  { tenure: "t5", title: "5G/6G Webinar Series: Part 1", type: "webinar", event_date: "2026-11-20", status: "planned", venue: "Online", speaker: "External Guest Speaker (TBC)", attendees_count: 0, description: "First session of a multi-part webinar series on 5G/6G antenna research directions." },
  { tenure: "t5", title: "National Antenna Design Competition", type: "competition", event_date: "2026-12-05", status: "planned", venue: "Electronics Lab, IEM", speaker: null, attendees_count: 0, description: "Flagship inter-college antenna design and fabrication competition." },
];

const DOCUMENTS = [
  { tenure: "t1", title: "2022-23 AGM Meeting Minutes", category: "meeting_minutes", filename: "agm-minutes-2022-23.txt", content: "Annual General Meeting Minutes — IEEE AP-S IEM SBC, 2022-23\n\nAttendance, charter approval, and election of founding office-bearers were recorded." },
  { tenure: "t2", title: "2023-24 Annual Event Report", category: "event_report", filename: "event-report-2023-24.txt", content: "Annual Event Report — 2023-24\n\nSummary of technical talks, workshops and IEEE Day celebration conducted during the 2023-24 tenure." },
  { tenure: "t2", title: "2023-24 Financial Statement", category: "financial_report", filename: "financial-statement-2023-24.txt", content: "Financial Statement — 2023-24\n\nOpening balance, sponsorship income, event expenditure and closing balance for the 2023-24 tenure." },
  { tenure: "t3", title: "2024-25 Annual Event Report", category: "event_report", filename: "event-report-2024-25.txt", content: "Annual Event Report — 2024-25\n\nHighlights from the metamaterials talk, PCB antenna competition, and propagation webinar." },
  { tenure: "t3", title: "Workshop Certificates Batch", category: "certificate", filename: "workshop-certificates-2024-25.txt", content: "Certificate issuance log for participants of the 2024-25 PCB Antenna Design Competition." },
  { tenure: "t4", title: "2025-26 Financial Report", category: "financial_report", filename: "financial-report-2025-26.txt", content: "Financial Report — 2025-26\n\nDetailed ledger of chapter funds, sponsorships and event expenditure for 2025-26." },
  { tenure: "t4", title: "2025-26 Handover Dossier", category: "handover", filename: "handover-dossier-2025-26.txt", content: "Handover Dossier — 2025-26 to 2026-27\n\nConsolidated notes, pending action items and institutional knowledge for the incoming committee." },
  { tenure: "t5", title: "2026-27 Kickoff Meeting Minutes", category: "meeting_minutes", filename: "kickoff-minutes-2026-27.txt", content: "Kickoff Meeting Minutes — 2026-27\n\nFirst committee meeting notes: roles confirmed, calendar planning, and handover follow-ups." },
];

async function upsertDesignations(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const d of DESIGNATIONS) {
    const { data: existing } = await supabase.from("designations").select("id").eq("title", d.title).maybeSingle();
    if (existing) {
      map[d.key] = existing.id;
      continue;
    }
    const { data, error } = await supabase.from("designations").insert({ title: d.title, rank: d.rank }).select().single();
    if (error) throw error;
    map[d.key] = data.id;
  }
  console.log(`Designations ready: ${Object.keys(map).length}`);
  return map;
}

async function upsertPeople(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const person of PEOPLE) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = existingUsers?.users.find((u) => u.email?.toLowerCase() === person.email.toLowerCase());

    let userId: string;
    if (existing) {
      userId = existing.id;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: person.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: person.full_name },
      });
      if (error || !data.user) throw error || new Error(`Failed to create ${person.email}`);
      userId = data.user.id;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: person.full_name,
        role: person.role,
        ieee_membership_no: person.ieee_membership_no,
        roll_number: person.roll_number ?? null,
        phone: person.phone ?? null,
        is_active: person.is_active,
      })
      .eq("id", userId);
    if (profileError) throw profileError;

    map[person.key] = userId;
  }
  console.log(`People ready: ${Object.keys(map).length}`);
  return map;
}

async function upsertTenures(peopleMap: Record<string, string>): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const t of TENURES) {
    const { data: existing } = await supabase.from("tenures").select("id").eq("academic_year", t.academic_year).maybeSingle();
    if (existing) {
      map[t.key] = existing.id;
      continue;
    }
    const { data, error } = await supabase
      .from("tenures")
      .insert({
        academic_year: t.academic_year,
        start_date: t.start_date,
        end_date: t.end_date,
        status: t.status,
        theme: t.theme,
        achievements: t.achievements,
        created_by: peopleMap.sa,
      })
      .select()
      .single();
    if (error) throw error;
    map[t.key] = data.id;
  }
  console.log(`Tenures ready: ${Object.keys(map).length}`);
  return map;
}

async function seedCommitteeMembers(
  tenureMap: Record<string, string>,
  peopleMap: Record<string, string>,
  designationMap: Record<string, string>
) {
  const roster: { tenure: string; person: string; designation: string; is_outgoing?: boolean; left_at?: string }[] = [
    // every tenure has the Faculty Advisor
    ...["t1", "t2", "t3", "t4", "t5"].map((t) => ({ tenure: t, person: "fa", designation: "faculty_advisor" })),

    { tenure: "t1", person: "rajdeep", designation: "chairperson", left_at: "2023-07-31" },
    { tenure: "t1", person: "suman", designation: "secretary", left_at: "2023-07-31" },

    { tenure: "t2", person: "souvik", designation: "chairperson", left_at: "2024-07-31" },
    { tenure: "t2", person: "trisha", designation: "vice_chairperson", left_at: "2024-07-31" },
    { tenure: "t2", person: "kunal", designation: "secretary", left_at: "2024-07-31" },

    { tenure: "t3", person: "rohan", designation: "chairperson", left_at: "2025-07-31" },
    { tenure: "t3", person: "ananya", designation: "vice_chairperson", left_at: "2025-07-31" },
    { tenure: "t3", person: "debanjan", designation: "secretary", left_at: "2025-07-31" },
    { tenure: "t3", person: "priya", designation: "treasurer", left_at: "2025-07-31" },

    { tenure: "t4", person: "ritika", designation: "chairperson", is_outgoing: true, left_at: "2026-07-31" },
    { tenure: "t4", person: "arka", designation: "vice_chairperson", is_outgoing: true, left_at: "2026-07-31" },
    { tenure: "t4", person: "snigdha", designation: "secretary", is_outgoing: true, left_at: "2026-07-31" },
    { tenure: "t4", person: "abhirup", designation: "treasurer", is_outgoing: true, left_at: "2026-07-31" },

    { tenure: "t5", person: "ishaan", designation: "chairperson" },
    { tenure: "t5", person: "nabanita", designation: "vice_chairperson" },
    { tenure: "t5", person: "farhan", designation: "secretary" },
    { tenure: "t5", person: "pritha", designation: "treasurer" },
    { tenure: "t5", person: "megha", designation: "event_coordinator" },
  ];

  let count = 0;
  for (const r of roster) {
    const tenure_id = tenureMap[r.tenure];
    const profile_id = peopleMap[r.person];
    const designation_id = designationMap[r.designation];

    const { data: existing } = await supabase
      .from("committee_members")
      .select("id")
      .eq("tenure_id", tenure_id)
      .eq("profile_id", profile_id)
      .eq("designation_id", designation_id)
      .maybeSingle();
    if (existing) continue;

    const { error } = await supabase.from("committee_members").insert({
      tenure_id,
      profile_id,
      designation_id,
      is_outgoing: r.is_outgoing ?? false,
      left_at: r.left_at ?? null,
    });
    if (error) throw error;
    count++;
  }
  console.log(`Committee member rows inserted: ${count}`);
}

async function seedEvents(tenureMap: Record<string, string>, peopleMap: Record<string, string>) {
  let count = 0;
  for (const e of EVENTS) {
    const { data: existing } = await supabase.from("events").select("id").eq("title", e.title).maybeSingle();
    if (existing) continue;

    const { error } = await supabase.from("events").insert({
      tenure_id: tenureMap[e.tenure],
      title: e.title,
      type: e.type,
      description: e.description,
      event_date: e.event_date,
      venue: e.venue,
      speaker: e.speaker,
      status: e.status,
      attendees_count: e.attendees_count,
      created_by: peopleMap.sa,
    });
    if (error) throw error;
    count++;
  }
  console.log(`Events inserted: ${count}`);
}

async function seedDocuments(tenureMap: Record<string, string>, peopleMap: Record<string, string>) {
  const bucket = "documents";
  let count = 0;
  for (const d of DOCUMENTS) {
    const { data: existing } = await supabase.from("documents").select("id").eq("title", d.title).maybeSingle();
    if (existing) continue;

    const tenureId = tenureMap[d.tenure];
    const path = `${tenureId}/${d.category}/${Date.now()}-${d.filename}`;
    const bytes = new TextEncoder().encode(d.content);

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bytes, {
      contentType: "text/plain",
    });
    if (uploadError) throw uploadError;

    const { error } = await supabase.from("documents").insert({
      tenure_id: tenureId,
      title: d.title,
      category: d.category,
      file_path: path,
      file_size: bytes.byteLength,
      mime_type: "text/plain",
      visibility: "all",
      uploaded_by: peopleMap.sa,
    });
    if (error) throw error;
    count++;
  }
  console.log(`Documents inserted: ${count}`);
}

async function seedHandover(
  tenureMap: Record<string, string>,
  peopleMap: Record<string, string>,
  designationMap: Record<string, string>
) {
  const records = [
    {
      key: "hr_chair",
      designation: "chairperson",
      outgoing: "ritika",
      incoming: "ishaan",
      status: "approved",
      approved_by: "fa",
      notes: "Full transition complete. Chapter login credentials, annual report drafts and IEEE Section contacts shared.",
      tasks: [
        { title: "Transfer IEEE SB officer login credentials", status: "completed", priority: "high", due_date: "2026-08-05" },
        { title: "Share chapter annual report draft", status: "completed", priority: "medium", due_date: "2026-08-10" },
        { title: "Introduce incoming chair to Faculty Advisor & IEEE Section committee", status: "completed", priority: "medium", due_date: "2026-08-12" },
      ],
    },
    {
      key: "hr_vc",
      designation: "vice_chairperson",
      outgoing: "arka",
      incoming: "nabanita",
      status: "completed",
      notes: "All planning materials and contacts transferred; pending final sign-off.",
      tasks: [
        { title: "Hand over event planning calendar", status: "completed", priority: "medium", due_date: "2026-08-08" },
        { title: "Share vendor & sponsor contact list", status: "completed", priority: "low", due_date: "2026-08-15" },
      ],
    },
    {
      key: "hr_sec",
      designation: "secretary",
      outgoing: "snigdha",
      incoming: "farhan",
      status: "in_progress",
      notes: "Minutes archive transferred. Membership database and correspondence handover still in progress.",
      tasks: [
        { title: "Transfer meeting minutes archive", status: "completed", priority: "medium", due_date: "2026-08-20" },
        { title: "Share membership database access", status: "in_progress", priority: "high", due_date: "2026-11-10" },
        { title: "Walkthrough of correspondence & official email account", status: "pending", priority: "high", due_date: "2026-11-18" },
      ],
    },
    {
      key: "hr_treasurer",
      designation: "treasurer",
      outgoing: "abhirup",
      incoming: "pritha",
      status: "pending",
      notes: "Financial handover scheduled; awaiting signatory update from the bank.",
      tasks: [
        { title: "Share bank account signatory update forms", status: "pending", priority: "high", due_date: "2026-11-12" },
        { title: "Reconcile 2025-26 financial report with Faculty Advisor", status: "pending", priority: "medium", due_date: "2026-11-25" },
      ],
    },
  ];

  for (const r of records) {
    const { data: existing } = await supabase
      .from("handover_records")
      .select("id")
      .eq("from_tenure_id", tenureMap.t4)
      .eq("to_tenure_id", tenureMap.t5)
      .eq("designation_id", designationMap[r.designation])
      .maybeSingle();

    let handoverId: string;
    if (existing) {
      handoverId = existing.id;
    } else {
      const insertPayload: Record<string, unknown> = {
        from_tenure_id: tenureMap.t4,
        to_tenure_id: tenureMap.t5,
        designation_id: designationMap[r.designation],
        outgoing_profile_id: peopleMap[r.outgoing],
        incoming_profile_id: peopleMap[r.incoming],
        status: r.status,
        notes: r.notes,
      };
      if (r.approved_by) {
        insertPayload.approved_by = peopleMap[r.approved_by];
        insertPayload.approved_at = new Date().toISOString();
      }
      const { data, error } = await supabase.from("handover_records").insert(insertPayload).select().single();
      if (error) throw error;
      handoverId = data.id;

      await supabase.from("notifications").insert({
        recipient_id: peopleMap[r.incoming],
        title: "New handover assigned to you",
        message: `A handover record for ${r.designation.replace("_", " ")} has been created.`,
        type: "handover",
        link: `/handover/${handoverId}`,
      });
    }

    for (const t of r.tasks) {
      const { data: existingTask } = await supabase
        .from("handover_tasks")
        .select("id")
        .eq("handover_record_id", handoverId)
        .eq("title", t.title)
        .maybeSingle();
      if (existingTask) continue;

      const { error } = await supabase.from("handover_tasks").insert({
        handover_record_id: handoverId,
        title: t.title,
        status: t.status,
        priority: t.priority,
        due_date: t.due_date,
      });
      if (error) throw error;
    }
  }
  console.log(`Handover records ready: ${records.length}`);
}

async function seedNotifications(peopleMap: Record<string, string>) {
  const welcomeTargets = ["ishaan", "nabanita", "farhan", "pritha", "megha"];
  for (const key of welcomeTargets) {
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("recipient_id", peopleMap[key])
      .eq("title", "Welcome to the Transition Hub")
      .maybeSingle();
    if (existing) continue;

    await supabase.from("notifications").insert({
      recipient_id: peopleMap[key],
      title: "Welcome to the Transition Hub",
      message: "Explore your handover tasks, chapter documents and the historical archive.",
      type: "info",
    });
  }
  console.log("Welcome notifications seeded.");
}

async function main() {
  console.log("Seeding IEEE AP-S IEM Leadership & Tenure Transition Hub...\n");

  const designationMap = await upsertDesignations();
  const peopleMap = await upsertPeople();
  const tenureMap = await upsertTenures(peopleMap);

  await seedCommitteeMembers(tenureMap, peopleMap, designationMap);
  await seedEvents(tenureMap, peopleMap);
  await seedDocuments(tenureMap, peopleMap);
  await seedHandover(tenureMap, peopleMap, designationMap);
  await seedNotifications(peopleMap);

  console.log("\nSeed complete. All seeded accounts use the password: " + DEFAULT_PASSWORD);
  console.log("Log in with either the email or IEEE membership number, e.g.:");
  console.log("  sulagna.mukherjee@ieeeapsiem.org  OR  membership no. 90112234  (Super Admin)");
  console.log("  ishaan.verma@ieeeapsiem.org       OR  membership no. 96100024  (Executive Committee)");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
