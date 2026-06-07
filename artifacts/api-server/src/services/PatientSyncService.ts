import { SyncQueue } from "./SyncQueue.js";

const queue = new SyncQueue();

export class PatientSyncService {
  async syncCreate(id: string, data: any) {
    await queue.enqueue("Patient", id, "CREATE", data);
  }

  async syncUpdate(id: string, data: any) {
    await queue.enqueue("Patient", id, "UPDATE", data);
  }

  async syncDelete(id: string) {
    await queue.enqueue("Patient", id, "DELETE", { deletedAt: new Date() });
  }
}
