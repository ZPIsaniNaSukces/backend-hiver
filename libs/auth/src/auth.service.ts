import { PrismaService } from "@app/prisma";
import * as bcrypt from "bcrypt";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { JwtSignOptions } from "@nestjs/jwt";

import type { LoginDto } from "./dto/login.dto";
import type { AuthenticatedUser } from "./interfaces/authenticated-user.type";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";

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
        teamId: true,
        companyId: true,
      },
    });

    if (user?.password == null) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      phone: user.phone ?? null,
      teamId: user.teamId ?? null,
      companyId: user.companyId,
    } satisfies AuthenticatedUser;
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
