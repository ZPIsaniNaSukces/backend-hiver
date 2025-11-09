export type { Prisma } from "@prisma/client";

export const USERS_PRISMA = Symbol("USERS_PRISMA_CLIENT");

export { PrismaClient as UsersPrismaClient } from "@prisma/client";
