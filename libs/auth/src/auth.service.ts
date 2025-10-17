import { PrismaService } from "@app/prisma";
import * as bcrypt from "bcrypt";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import type { LoginDto } from "./dto/login.dto";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";
import type { AuthenticatedUser } from "./types/authenticated-user.type";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findFirst({
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
      companyId: user.companyId ?? null,
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

    return {
      accessToken,
      user,
    };
  }
}
