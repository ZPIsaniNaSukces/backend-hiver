import type { ACCOUNT_STATUS, USER_ROLE } from "@prisma/client";

export type JwtPayload = {
  sub: number;
  email: string;
  role: USER_ROLE;
  name: string;
  surname: string;
  phone: string | null;
  title: string | null;
  bossId: number | null;
  companyId: number;
  teamIds: number[];
  teams: { id: number; name: string }[];
  accountStatus: ACCOUNT_STATUS;
  iat?: number;
  exp?: number;
};
