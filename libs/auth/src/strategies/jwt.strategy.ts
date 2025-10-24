import { PrismaService } from "@app/prisma";
import { ExtractJwt, Strategy } from "passport-jwt";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import type { AuthenticatedUser } from "../interfaces/authenticated-user.type";
import type { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
        phone: true,
        bossId: true,
        companyId: true,
        teams: { select: { id: true } },
      },
    });

    if (user == null) {
      throw new UnauthorizedException("User no longer exists");
    }

    const bossId: number | null =
      (user as { bossId: number | null }).bossId ?? null;
    const teamIds: number[] = Array.isArray(
      (user as { teams?: { id: number }[] }).teams,
    )
      ? (user as { teams: { id: number }[] }).teams.map((t) => t.id)
      : [];
    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      phone: user.phone ?? null,
      bossId,
      teamIds,
      companyId: user.companyId,
    } satisfies AuthenticatedUser;
  }
}
