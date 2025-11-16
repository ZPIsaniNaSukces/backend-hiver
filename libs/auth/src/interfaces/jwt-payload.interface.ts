import type { USER_ROLE } from "@prisma/client";

export interface JwtPayload {
  sub: number;
  email: string;
  role: USER_ROLE;
  name: string;
  surname: string;
  phone: string | null;
  bossId: number | null;
  companyId: number;
  teamIds: number[];
  iat?: number;
  exp?: number;
}
