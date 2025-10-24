import { PrismaService } from "@app/prisma";
import * as bcrypt from "bcrypt";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { JwtSignOptions } from "@nestjs/jwt";

import type { LoginDto } from "./dto/login.dto";
import type { AuthenticatedUser } from "./interfaces/authenticated-user.type";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";
import { toAuthenticatedUserResponse } from "./utils/to-authenticated-user-response";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        password: true,
        role: true,
        phone: true,
        bossId: true,
        companyId: true,
        teams: { select: { id: true } },
      },
    });

    if (user?.password == null) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return toAuthenticatedUserResponse(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    } satisfies JwtPayload;

    const accessToken = await this.jwtService.signAsync(payload);
    const accessTokenExpiresAt = this.getTokenExpiration(accessToken);

    const jwtSecret = this.configService.get<string>("JWT_SECRET");
    if (jwtSecret == null) {
      throw new Error("JWT_SECRET is not configured");
    }

    const refreshTokenSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ?? jwtSecret;
    const refreshTokenExpiresIn =
      this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d";

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpiresIn as JwtSignOptions["expiresIn"],
    });
    const refreshTokenExpiresAt = this.getTokenExpiration(refreshToken);

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
      user,
    };
  }

  async refresh(refreshToken: string) {
    const jwtSecret = this.configService.get<string>("JWT_SECRET");
    if (jwtSecret == null) {
      throw new Error("JWT_SECRET is not configured");
    }

    const refreshTokenSecret =
      this.configService.get<string>("JWT_REFRESH_SECRET") ?? jwtSecret;

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshTokenSecret,
      });
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const userRecord = await this.prisma.user.findUnique({
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

    if (userRecord == null) {
      throw new UnauthorizedException("User no longer exists");
    }

    const user = toAuthenticatedUserResponse(userRecord);

    const refreshedPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    } satisfies JwtPayload;

    const accessToken = await this.jwtService.signAsync(refreshedPayload);
    const accessTokenExpiresAt = this.getTokenExpiration(accessToken);

    const refreshTokenExpiresIn =
      this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d";

    const newRefreshToken = await this.jwtService.signAsync(refreshedPayload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpiresIn as JwtSignOptions["expiresIn"],
    });
    const refreshTokenExpiresAt = this.getTokenExpiration(newRefreshToken);

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt,
      user,
    };
  }

  getTokenInfo(token: string): {
    issuedAt: string | null;
    expiresAt: string | null;
    payload: {
      sub: number | null;
      email: string | null;
      role: AuthenticatedUser["role"] | null;
    };
  } | null {
    const decoded: unknown = this.jwtService.decode(token);
    if (decoded == null || typeof decoded !== "object") {
      return null;
    }

    const claims = decoded as Partial<JwtPayload> & {
      exp?: unknown;
      iat?: unknown;
    };

    return {
      issuedAt:
        typeof claims.iat === "number"
          ? new Date(claims.iat * 1000).toISOString()
          : null,
      expiresAt:
        typeof claims.exp === "number"
          ? new Date(claims.exp * 1000).toISOString()
          : null,
      payload: {
        sub: typeof claims.sub === "number" ? claims.sub : null,
        email: typeof claims.email === "string" ? claims.email : null,
        role: typeof claims.role === "string" ? claims.role : null,
      },
    };
  }

  private getTokenExpiration(token: string): string | null {
    const decoded: unknown = this.jwtService.decode(token);
    if (decoded == null || typeof decoded !== "object") {
      return null;
    }

    const exp = (decoded as { exp?: unknown }).exp;
    if (typeof exp !== "number") {
      return null;
    }

    return new Date(exp * 1000).toISOString();
  }
}
