import { PostgresPatientRepository } from "../repositories/postgres/PatientRepository.js";
import { PatientSyncService } from "./PatientSyncService.js";
import type { Prisma } from "@prisma/client";

const pgRepo = new PostgresPatientRepository();
const syncService = new PatientSyncService();

export class PatientService {
  async createPatient(data: Prisma.PatientUncheckedCreateInput) {
    // 1. Write to PostgreSQL (Primary)
    const patient = await pgRepo.create(data);
    
    // 2. Sync to MySQL (Secondary)
    // We run this asynchronously so we don't block the API response unnecessarily
    // The prompt allows returning success if MySQL succeeds, but retrying if it fails.
    // If we await it entirely, the request might take seconds if MySQL is down.
    // I will await it but the retry loop in syncService might take time.
    await syncService.syncCreate(patient.id, patient);

    return patient;
  }

  async updatePatient(id: string, data: Prisma.PatientUncheckedUpdateInput) {
    const patient = await pgRepo.update(id, data);
    await syncService.syncUpdate(id, data);
    return patient;
  }

  async deletePatient(id: string) {
    const patient = await pgRepo.softDelete(id);
    await syncService.syncDelete(id);
    return patient;
  }
}
