import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "@prisma/client";

export class PostgresPatientRepository {
  async create(data: Prisma.PatientUncheckedCreateInput) {
    return prisma.patient.create({ data });
  }

  async update(id: string, data: Prisma.PatientUncheckedUpdateInput) {
    return prisma.patient.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.patient.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async findUnique(where: Prisma.PatientWhereUniqueInput) {
    return prisma.patient.findUnique({ where });
  }

  async findFirst(where: Prisma.PatientWhereInput) {
    return prisma.patient.findFirst({ where });
  }
}
