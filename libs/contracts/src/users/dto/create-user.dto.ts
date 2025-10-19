import type { USER_ROLE } from "@prisma/client";

export class CreateUserDto {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone?: string;
  role: USER_ROLE;
  teamId?: number;
  companyId?: number;
}
