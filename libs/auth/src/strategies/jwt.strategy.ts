import { ACCOUNT_STATUS } from "@prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import type { AuthenticatedUser } from "../interfaces/authenticated-user.type";
import type { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    const hasRequiredFields =
      typeof payload.name === "string" &&
      typeof payload.surname === "string" &&
      Array.isArray(payload.teamIds) &&
      typeof payload.companyId === "number";

    if (!hasRequiredFields) {
      throw new UnauthorizedException("Token payload is missing user context");
    }

    return {
      id: payload.sub,
      name: payload.name,
      surname: payload.surname,
      email: payload.email,
      role: payload.role,
      phone: payload.phone ?? null,
      dateOfBirth: null, // JWT doesn't contain dateOfBirth
      bossId: payload.bossId ?? null,
      teamIds: payload.teamIds,
      companyId: payload.companyId,
      accountStatus: ACCOUNT_STATUS.VERIFIED, // Assume verified if they have a valid token
    } satisfies AuthenticatedUser;
  }
}
