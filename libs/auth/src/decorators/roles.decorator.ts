import type { USER_ROLE } from "@prisma/client";

import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: USER_ROLE[]) => SetMetadata(ROLES_KEY, roles);
