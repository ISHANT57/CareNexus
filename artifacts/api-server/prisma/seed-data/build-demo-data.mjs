// ============================================================================
// build-demo-data.mjs — Generates a DETERMINISTIC, branded demo-data.json.
//
// Model:
//   Tenant  = a hospital brand            e.g. "Apollo Hospital"
//   Area    = a Mumbai locality           e.g. "Kandivali", "Kurla", "Chembur"
//   Clinic  = "<Brand> <facility> <Area>" e.g. "Apollo Clinic Kandivali"
//   then Programs → Users (full role spread) → Patients.
//
// IMPORTANT: every unique key (email / phone / NHS number) is derived from a
// STABLE (tenantIndex, localIndex) position — NOT a global running counter.
// This keeps the upsert keys identical even if per-tenant volumes change, so the
// seed stays idempotent across configuration changes (no duplicate rows).
//
// Usage:  node prisma/seed-data/build-demo-data.mjs   →   prisma/demo-data.json
// ============================================================================
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "demo-data.json");

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260622);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

const BRANDS = [
  { name: "Apollo Hospital", short: "apollo" },
  { name: "Fortis Healthcare", short: "fortis" },
  { name: "Lilavati Hospital", short: "lilavati" },
  { name: "Kokilaben Hospital", short: "kokilaben" },
  { name: "Wockhardt Hospitals", short: "wockhardt" },
  { name: "Nanavati Max Hospital", short: "nanavati" },
  { name: "Hinduja Hospital", short: "hinduja" },
  { name: "Jaslok Hospital", short: "jaslok" },
  { name: "Breach Candy Hospital", short: "breachcandy" },
  { name: "Bombay Hospital", short: "bombay" },
  { name: "Saifee Hospital", short: "saifee" },
  { name: "Holy Family Hospital", short: "holyfamily" },
  { name: "Hiranandani Hospital", short: "hiranandani" },
  { name: "Global Hospital", short: "global" },
  { name: "S. L. Raheja Hospital", short: "slraheja" },
  { name: "Reliance Foundation Hospital", short: "reliance" },
  { name: "Bhatia Hospital", short: "bhatia" },
  { name: "Surya Hospital", short: "surya" },
  { name: "Masina Hospital", short: "masina" },
  { name: "Cloudnine Hospital", short: "cloudnine" },
];

const LOCALITIES = [
  "Kandivali", "Kurla", "Chembur", "Andheri", "Bandra", "Dadar", "Borivali",
  "Thane", "Mulund", "Ghatkopar", "Vile Parle", "Goregaon", "Malad", "Powai",
  "Worli", "Lower Parel", "Sion", "Matunga", "Wadala", "Vikhroli", "Juhu",
  "Santacruz", "Khar", "Colaba", "Byculla", "Mahim", "Vashi", "Belapur",
];

const FACILITIES = ["Clinic", "Multispecialty Clinic", "Polyclinic", "Hospital", "Diagnostic Centre"];

const PROGRAM_CATALOG = [
  { name: "Diabetes Management", tags: ["diabetes", "chronic"] },
  { name: "Cardiac Rehabilitation", tags: ["cardiac", "rehabilitation"] },
  { name: "Mental Health Support", tags: ["mental-health"] },
  { name: "Women's Health", tags: ["womens-health"] },
  { name: "Elder Care", tags: ["geriatric", "elder-care"] },
  { name: "Hypertension Management", tags: ["hypertension", "chronic"] },
  { name: "Maternal & Child Health", tags: ["maternal", "pediatric"] },
  { name: "Respiratory Care", tags: ["respiratory", "copd"] },
];

const FIRST_M = ["Aarav","Aditya","Arjun","Rohan","Kabir","Rahul","Amit","Vikram","Sanjay","Rajesh","Suresh","Anil","Deepak","Manish","Nikhil","Karan","Siddharth","Harsh","Yash","Tushar"];
const FIRST_F = ["Ananya","Diya","Aanya","Anika","Sara","Priya","Pooja","Neha","Sneha","Kavya","Divya","Riya","Meera","Aishwarya","Shruti","Isha","Tanvi","Nisha","Rupal","Sonal"];
const LAST = ["Sharma","Patel","Iyer","Nair","Deshmukh","Joshi","Kulkarni","Mehta","Shah","Gupta","Reddy","Rao","Naik","Pillai","Bhat","Chavan","Pawar","More","Gaikwad","Shetty","Kapoor","Singh","Verma","Agarwal","Khan"];
const DIAGNOSES = ["Type 2 Diabetes", "Hypertension", "Coronary Artery Disease", "Asthma", "Depression", "Anxiety Disorder", "Osteoarthritis", "COPD", "Hypothyroidism", "Chronic Kidney Disease"];

const PATIENT_GROUPS = ["NEW_PATIENT", "REFERRED_FOR_REVIEW", "TRANSITION_FROM_CAMHS", "TRANSITION_ADULT"];
const USER_TYPES = ["PRIVATE", "RTC", "ICB_CONTRACT"];

const AREAS_PER_TENANT = 3;
const CLINICS_PER_AREA = 3;
const PROGRAMS_PER_TENANT = 6;
const DOCTORS_PER_TENANT = 12;
const OPERATORS_PER_TENANT = 3;
const STAFF_PER_TENANT = 2;
const PATIENTS_PER_TENANT = 50;

function build() {
  const person = (gender) => ({ first: gender === "FEMALE" ? FIRST_F[Math.floor(rng() * FIRST_F.length)] : FIRST_M[Math.floor(rng() * FIRST_M.length)], last: LAST[Math.floor(rng() * LAST.length)] });
  const out = { meta: { source: "branded synthetic (hospital brand → locality → clinic)", passwordPlain: "Demo1234!", region: "Mumbai" }, tenants: [] };

  for (let bi = 0; bi < BRANDS.length; bi++) {
    const brand = BRANDS[bi];
    const domain = `${brand.short}.caremesh.demo`;
    const ti = String(bi).padStart(2, "0");
    // Stable phone numbers: users +9170<tenant><idx>, patients +9180<tenant><idx>
    const userPhone = (ui) => `+9170${ti}${String(ui).padStart(3, "0")}`;
    const patientPhone = (pi) => `+9180${ti}${String(pi).padStart(4, "0")}`;

    const areas = [];
    for (let a = 0; a < AREAS_PER_TENANT; a++) areas.push(LOCALITIES[(bi * AREAS_PER_TENANT + a) % LOCALITIES.length]);

    const brandWord = brand.name.replace(/ Hospital| Healthcare| Hospitals/i, "").trim();
    const clinics = [];
    for (const area of areas) {
      for (let c = 0; c < CLINICS_PER_AREA; c++) {
        clinics.push({ area, name: `${brandWord} ${FACILITIES[c % FACILITIES.length]} ${area}`, address: `${area}, Mumbai, Maharashtra` });
      }
    }

    const programs = PROGRAM_CATALOG.slice(0, PROGRAMS_PER_TENANT).map((p, i) => ({
      name: p.name, tags: p.tags,
      activationCode: `${brand.short.toUpperCase().slice(0, 8)}-${slug(p.name).slice(0, 6).toUpperCase()}-${i + 1}`,
      priority: i,
    }));

    // ── Users — stable local index `ui` drives email + phone ──────────────
    let ui = 0;
    const users = [];
    const cref = (c) => ({ area: c.area, name: c.name });

    // org admin
    users.push({ role: "AREA_ADMIN", firstName: "Admin", lastName: brandWord, email: `admin@${domain}`, mobile: userPhone(ui++), gender: "MALE", clinics: clinics.map(cref) });
    // clinic admins (one per area)
    for (const area of areas) {
      const g = rng() < 0.5 ? "FEMALE" : "MALE"; const p = person(g);
      users.push({ role: "CLINIC_ADMIN", firstName: p.first, lastName: p.last, email: `cadmin.t${bi}.u${ui}@${domain}`, mobile: userPhone(ui++), gender: g, clinics: clinics.filter((c) => c.area === area).map(cref) });
    }
    // doctors (one clinic each, round-robin)
    const doctors = [];
    for (let d = 0; d < DOCTORS_PER_TENANT; d++) {
      const clinic = clinics[d % clinics.length];
      const g = rng() < 0.45 ? "FEMALE" : "MALE"; const p = person(g);
      const doc = { role: "DOCTOR", firstName: p.first, lastName: p.last, email: `dr.t${bi}.u${ui}@${domain}`, mobile: userPhone(ui++), gender: g, clinics: [cref(clinic)] };
      users.push(doc); doctors.push({ email: doc.email, clinic: cref(clinic) });
    }
    // operators (rolling subset of clinics)
    for (let o = 0; o < OPERATORS_PER_TENANT; o++) {
      const g = rng() < 0.6 ? "FEMALE" : "MALE"; const p = person(g);
      const assigned = [];
      for (let k = 0; k < 3; k++) assigned.push(clinics[(o * 3 + k) % clinics.length]);
      users.push({ role: "OPERATOR", firstName: p.first, lastName: p.last, email: `ops.t${bi}.u${ui}@${domain}`, mobile: userPhone(ui++), gender: g, clinics: assigned.map(cref) });
    }
    // staff (one clinic each)
    for (let s = 0; s < STAFF_PER_TENANT; s++) {
      const g = rng() < 0.5 ? "FEMALE" : "MALE"; const p = person(g);
      const clinic = clinics[s % clinics.length];
      users.push({ role: "STAFF", firstName: p.first, lastName: p.last, email: `staff.t${bi}.u${ui}@${domain}`, mobile: userPhone(ui++), gender: g, clinics: [cref(clinic)] });
    }

    // ── Patients — stable local index `pi` drives email + phone + NHS ─────
    const patients = [];
    for (let pi = 0; pi < PATIENTS_PER_TENANT; pi++) {
      const clinic = clinics[pi % clinics.length];
      const clinicDoctors = doctors.filter((d) => d.clinic.area === clinic.area && d.clinic.name === clinic.name);
      const doctor = clinicDoctors[pi % clinicDoctors.length];
      const g = rng() < 0.5 ? "FEMALE" : "MALE"; const p = person(g);
      const age = 18 + Math.floor(rng() * 70);
      const month = String(1 + Math.floor(rng() * 12)).padStart(2, "0");
      const day = String(1 + Math.floor(rng() * 28)).padStart(2, "0");
      patients.push({
        firstName: p.first, lastName: p.last,
        nhsNumber: `9${ti}${String(pi).padStart(5, "0")}`,
        email: `patient.t${bi}.p${pi}@patients.caremesh.demo`,
        mobile: patientPhone(pi), gender: g, dob: `${2026 - age}-${month}-${day}`,
        status: rng() < 0.85 ? "ACTIVE" : "INACTIVE",
        diagnosis: DIAGNOSES[pi % DIAGNOSES.length],
        patientGroup: PATIENT_GROUPS[pi % PATIENT_GROUPS.length],
        userType: USER_TYPES[pi % USER_TYPES.length],
        area: clinic.area, clinic: clinic.name,
        program: programs[pi % programs.length].name,
        doctorEmail: doctor.email,
      });
    }

    out.tenants.push({ name: brand.name, domain, city: "Mumbai", areas, clinics, programs, users, patients });
  }

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  const sum = (f) => out.tenants.reduce((n, x) => n + f(x), 0);
  const byRole = {};
  for (const t of out.tenants) for (const u of t.users) byRole[u.role] = (byRole[u.role] || 0) + 1;
  console.log("✅ demo-data.json written:", OUT_PATH);
  console.log("   tenants:", out.tenants.length, "| areas:", sum((t) => t.areas.length), "| clinics:", sum((t) => t.clinics.length), "| programs:", sum((t) => t.programs.length));
  console.log("   users:", sum((t) => t.users.length), JSON.stringify(byRole), "| patients:", sum((t) => t.patients.length));
}

build();
