import { PrismaService } from "@app/prisma";
import { ExtractJwt, Strategy } from "passport-jwt";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import type { JwtPayload } from "../interfaces/jwt-payload.interface";
import type { AuthenticatedUser } from "../types/authenticated-user.type";

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
        teamId: true,
        companyId: true,
      },
    });

    if (user == null) {
      throw new UnauthorizedException("User no longer exists");
    }

    return {
      ...user,
      phone: user.phone ?? null,
      teamId: user.teamId ?? null,
      companyId: user.companyId ?? null,
    } satisfies AuthenticatedUser;
  }
}
