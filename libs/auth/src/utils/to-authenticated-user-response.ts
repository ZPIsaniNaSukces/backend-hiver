import type { AuthenticatedUser } from "../interfaces/authenticated-user.type";

// Minimal user shape required to build an AuthenticatedUser response
export interface UserWithTeamsForAuth {
  id: number;
  name: string;
  surname: string;
  email: string;
  role: AuthenticatedUser["role"];
  phone: string | null;
  bossId: number | null;
  companyId: number;
  teams: { id: number }[];
  password?: string | null;
}

export function toAuthenticatedUserResponse(
  user: UserWithTeamsForAuth,
): AuthenticatedUser {
  // Intentionally ignore password if present
  const bossId: number | null = user.bossId ?? null;
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
    phone: user.phone ?? null,
    bossId,
    teamIds: user.teams.map((t) => t.id),
    companyId: user.companyId,
  } satisfies AuthenticatedUser;
}
