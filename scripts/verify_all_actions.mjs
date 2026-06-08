const API_BASE = "http://localhost:5000/api";

async function main() {
  console.log("Starting Caremesh E2E API Verification...");

  // 1. Login
  console.log("Logging in as admin@northgate.nhs.uk...");
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@northgate.nhs.uk",
      password: "Admin1234!",
    }),
  });

  if (!loginRes.ok) {
    console.error("Login failed:", loginRes.status, await loginRes.text());
    process.exit(1);
  }

  const loginData = await loginRes.json();
  console.log("Login success! User:", loginData.user.email);

  // Extract cookies
  const rawCookies = loginRes.headers.raw?.()["set-cookie"] || loginRes.headers.get("set-cookie");
  let cookieHeader = "";
  if (Array.isArray(rawCookies)) {
    cookieHeader = rawCookies.map(c => c.split(";")[0]).join("; ");
  } else if (typeof rawCookies === "string") {
    cookieHeader = rawCookies.split(";")[0];
  }

  console.log("Extracted Cookie Header:", cookieHeader ? "Success (found cookies)" : "Failed (no cookies)");

  const requestHeaders = {
    "Content-Type": "application/json",
    "Cookie": cookieHeader,
  };

  // 2. Fetch areas
  console.log("Fetching areas list...");
  const areasRes = await fetch(`${API_BASE}/areas`, { headers: requestHeaders });
  if (!areasRes.ok) {
    console.error("Failed to fetch areas:", areasRes.status, await areasRes.text());
    process.exit(1);
  }
  const areasList = await areasRes.json();
  const area = areasList.data?.[0];
  if (!area) {
    console.error("No area found in seed data!");
    process.exit(1);
  }
  console.log(`Using Area: ${area.name} (ID: ${area.id})`);

  // 3. Create Clinic
  const clinicName = `Verification Clinic ${Date.now()}`;
  console.log(`Creating clinic: "${clinicName}"...`);
  const createClinicRes = await fetch(`${API_BASE}/clinics`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      name: clinicName,
      areaId: area.id,
      address: "123 Verification St",
      city: "Leeds",
      phone: "01132432000",
      email: "clinic@verify.nhs.uk"
    }),
  });

  if (!createClinicRes.ok) {
    console.error("Failed to create clinic:", createClinicRes.status, await createClinicRes.text());
    process.exit(1);
  }
  const clinic = await createClinicRes.json();
  console.log(`Clinic created successfully! ID: ${clinic.id}`);

  // 4. Create Program
  const programName = `Verification Program ${Date.now()}`;
  console.log(`Creating program: "${programName}"...`);
  const createProgramRes = await fetch(`${API_BASE}/programs`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      name: programName,
      description: "E2E Verification clinical pathway"
    }),
  });

  if (!createProgramRes.ok) {
    console.error("Failed to create program:", createProgramRes.status, await createProgramRes.text());
    process.exit(1);
  }
  const program = await createProgramRes.json();
  console.log(`Program created successfully! ID: ${program.id}`);

  // 5. Create Patient
  const nhsNumber = String(Math.floor(1000000000 + Math.random() * 9000000000));
  const patientFirstName = "E2EVerified";
  const patientLastName = `Patient-${Date.now()}`;
  console.log(`Creating patient: ${patientFirstName} ${patientLastName} (NHS: ${nhsNumber})...`);

  const createPatientRes = await fetch(`${API_BASE}/patients`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      nhsNumber,
      title: "Mr",
      firstName: patientFirstName,
      lastName: patientLastName,
      email: `patient-${nhsNumber}@verify.nhs.uk`,
      mobile: "07700900123",
      gender: "MALE",
      dob: new Date("1990-01-01").toISOString(),
      programId: program.id,
      clinicId: clinic.id,
      areaId: area.id
    }),
  });

  if (!createPatientRes.ok) {
    console.error("Failed to create patient:", createPatientRes.status, await createPatientRes.text());
    process.exit(1);
  }
  const patient = await createPatientRes.json();
  console.log(`Patient created successfully! ID: ${patient.id}`);

  // 6. Verify Lists
  console.log("Verifying lists return the created entities...");
  const patientsListRes = await fetch(`${API_BASE}/patients?q=${patientLastName}`, { headers: requestHeaders });
  const patientsList = await patientsListRes.json();
  const foundPatient = patientsList.data?.find(p => p.id === patient.id);
  if (!foundPatient) {
    console.error("Created patient not found in search results!");
    process.exit(1);
  }
  console.log("Verified: Patient exists in list response.");

  const clinicsListRes = await fetch(`${API_BASE}/clinics`, { headers: requestHeaders });
  const clinicsList = await clinicsListRes.json();
  const foundClinic = clinicsList.data?.find(c => c.id === clinic.id);
  if (!foundClinic) {
    console.error("Created clinic not found in clinics list!");
    process.exit(1);
  }
  console.log("Verified: Clinic exists in list response.");

  const programsListRes = await fetch(`${API_BASE}/programs`, { headers: requestHeaders });
  const programsList = await programsListRes.json();
  const foundProgram = programsList.data?.find(p => p.id === program.id);
  if (!foundProgram) {
    console.error("Created program not found in programs list!");
    process.exit(1);
  }
  console.log("Verified: Program exists in list response.");

  console.log("\n=============================================");
  console.log("🎉 ALL E2E VERIFICATION CHECKS PASSED!");
  console.log("=============================================");
}

main().catch(err => {
  console.error("E2E Verification crashed:", err);
  process.exit(1);
});
