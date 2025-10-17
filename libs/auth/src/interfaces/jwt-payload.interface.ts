import type { USER_ROLE } from "@prisma/client";

export interface JwtPayload {
  sub: number;
  email: string;
  role: USER_ROLE;
  iat?: number;
  exp?: number;
}
