import type { ACCOUNT_STATUS, USER_ROLE } from "@prisma/client";

export type AuthenticatedUser = {
  id: number;
  name: string | null;
  surname: string | null;
  email: string;
  role: USER_ROLE | null;
  phone: string | null;
  dateOfBirth: Date | null;
  title: string | null;
  bossId: number | null;
  teamIds: number[];
  companyId: number;
  accountStatus: ACCOUNT_STATUS;
};
