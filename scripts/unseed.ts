import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CONFIRM = process.argv.includes("--confirm");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing Supabase credentials in .env.local.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Exactly the demo records created by scripts/seed.ts.
const SEED_EMAILS = [
  "arindam.biswas", "sulagna.mukherjee", "rajdeep.ghoshal", "suman.kar", "souvik.mondal",
  "trisha.dasgupta", "kunal.basak", "rohan.chatterjee", "ananya.sen", "debanjan.roy",
  "priya.mallick", "ritika.banerjee", "arka.pramanik", "snigdha.haldar", "abhirup.saha",
  "ishaan.verma", "nabanita.chowdhury", "farhan.ahmed", "pritha.sengupta", "megha.chakraborty",
].map((n) => `${n}@ieeeapsiem.org`);

const SEED_TENURE_YEARS = ["2022-2023", "2023-2024", "2024-2025", "2025-2026", "2026-2027"];

const SEED_EVENT_TITLES = [
  "Fundamentals of Antenna Design", "Intro to RF Systems", "5G and Beyond: Antenna Challenges",
  "Hands-on with HFSS Simulation", "IEEE Day Celebration", "Metamaterials for Next-Gen Antennas",
  "PCB Antenna Design Competition", "Propagation Modelling Webinar",
  "Industry Talk: Satellite Communication at ISRO", "RF & Microwave Workshop",
  "IEEE Day Celebration 2025", "Orientation & Membership Drive",
  "Antenna Measurement Techniques Workshop", "5G/6G Webinar Series: Part 1",
  "National Antenna Design Competition",
];

const SEED_DOCUMENT_TITLES = [
  "2022-23 AGM Meeting Minutes", "2023-24 Annual Event Report", "2023-24 Financial Statement",
  "2024-25 Annual Event Report", "Workshop Certificates Batch", "2025-26 Financial Report",
  "2025-26 Handover Dossier", "2026-27 Kickoff Meeting Minutes",
];

function check(error: { message: string } | null, what: string) {
  if (error) throw new Error(`${what}: ${error.message}`);
}

async function main() {
  console.log(CONFIRM ? "Deleting demo data...\n" : "DRY RUN — nothing will be deleted. Re-run with --confirm to delete.\n");

  // Fake user accounts
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  check(listErr, "list users");
  const fakeUsers = list.users.filter((u) => u.email && SEED_EMAILS.includes(u.email.toLowerCase()));
  const fakeIds = fakeUsers.map((u) => u.id);
  console.log(`Fake accounts: ${fakeUsers.length}`);
  fakeUsers.forEach((u) => console.log(`  - ${u.email}`));

  // Documents
  const { data: docs } = await supabase.from("documents").select("id, title, file_path").in("title", SEED_DOCUMENT_TITLES);
  console.log(`Demo documents: ${docs?.length ?? 0}`);

  // Events
  const { data: events } = await supabase.from("events").select("id, title").in("title", SEED_EVENT_TITLES);
  console.log(`Demo events: ${events?.length ?? 0}`);

  // Handover records involving fake people
  let handovers: { id: string }[] = [];
  if (fakeIds.length) {
    const idList = `(${fakeIds.join(",")})`;
    const { data } = await supabase
      .from("handover_records")
      .select("id")
      .or(`outgoing_profile_id.in.${idList},incoming_profile_id.in.${idList},approved_by.in.${idList}`);
    handovers = data ?? [];
  }
  console.log(`Demo handover records: ${handovers.length}`);

  // Tenures — only those with no real (non-demo) members, events or documents
  const { data: tenures } = await supabase.from("tenures").select("id, academic_year").in("academic_year", SEED_TENURE_YEARS);
  const docIds = new Set((docs ?? []).map((d) => d.id));
  const eventIds = new Set((events ?? []).map((e) => e.id));
  const tenuresToDelete: string[] = [];
  for (const t of tenures ?? []) {
    const { data: members } = await supabase.from("committee_members").select("profile_id").eq("tenure_id", t.id);
    const { data: tEvents } = await supabase.from("events").select("id").eq("tenure_id", t.id);
    const { data: tDocs } = await supabase.from("documents").select("id").eq("tenure_id", t.id);
    const hasReal =
      (members ?? []).some((m) => !fakeIds.includes(m.profile_id)) ||
      (tEvents ?? []).some((e) => !eventIds.has(e.id)) ||
      (tDocs ?? []).some((d) => !docIds.has(d.id));
    if (hasReal) {
      console.log(`  Keeping tenure ${t.academic_year} — it has real members, events or documents.`);
    } else {
      tenuresToDelete.push(t.id);
    }
  }
  console.log(`Demo tenures to delete: ${tenuresToDelete.length}`);

  if (!CONFIRM) {
    console.log("\nDry run finished. Run `npm run unseed -- --confirm` to delete the above.");
    return;
  }

  if (docs?.length) {
    await supabase.storage.from("documents").remove(docs.map((d) => d.file_path));
    check((await supabase.from("documents").delete().in("id", docs.map((d) => d.id))).error, "delete documents");
  }
  if (handovers.length) {
    check((await supabase.from("handover_records").delete().in("id", handovers.map((h) => h.id))).error, "delete handovers");
  }
  if (events?.length) {
    check((await supabase.from("events").delete().in("id", events.map((e) => e.id))).error, "delete events");
  }
  if (tenuresToDelete.length) {
    check((await supabase.from("tenures").delete().in("id", tenuresToDelete)).error, "delete tenures");
  }

  if (fakeIds.length) {
    // Clear remaining references to fake profiles so the accounts can be removed.
    check((await supabase.from("tenures").update({ created_by: null }).in("created_by", fakeIds)).error, "clear tenures.created_by");
    check((await supabase.from("events").update({ created_by: null }).in("created_by", fakeIds)).error, "clear events.created_by");
    check((await supabase.from("documents").update({ uploaded_by: null }).in("uploaded_by", fakeIds)).error, "clear documents.uploaded_by");
    check((await supabase.from("handover_records").update({ approved_by: null }).in("approved_by", fakeIds)).error, "clear handover approved_by");
    check((await supabase.from("activity_logs").delete().in("actor_id", fakeIds)).error, "delete activity logs");

    for (const id of fakeIds) {
      const { error } = await supabase.auth.admin.deleteUser(id);
      check(error, `delete user ${id}`);
    }
  }

  console.log("\nDone. All demo data has been removed.");
}

main().catch((err) => {
  console.error("Cleanup failed:", err.message ?? err);
  process.exit(1);
});
