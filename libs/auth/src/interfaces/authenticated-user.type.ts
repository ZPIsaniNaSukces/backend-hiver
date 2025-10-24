import type { USER_ROLE } from "@prisma/client";

export interface AuthenticatedUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: USER_ROLE;
  phone: string | null;
  bossId: number | null;
  teamIds: number[];
  companyId: number;
}
