import type { AuthenticatedUser } from "@app/auth";
import { toAuthenticatedUserResponse } from "@app/auth";
import { CreateUserDto, UpdateUserDto } from "@app/contracts/users";
import { PrismaService } from "@app/prisma";
import type { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";

import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<AuthenticatedUser> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const data: Prisma.UserUncheckedCreateInput & {
      teams?: { connect: { id: number }[] };
    } = {
      name: createUserDto.name,
      surname: createUserDto.surname,
      email: createUserDto.email,
      password: hashedPassword,
      phone: createUserDto.phone ?? null,
      role: createUserDto.role,
      bossId:
        createUserDto.bossId != null && createUserDto.bossId > 0
          ? createUserDto.bossId
          : null,
      companyId: createUserDto.companyId,
    };

    if (createUserDto.teamIds != null && createUserDto.teamIds.length > 0) {
      data.teams = {
        connect: createUserDto.teamIds.map((teamId) => ({ id: teamId })),
      };
    }

    const user = await this.prisma.user.create({
      data,
      include: { teams: { select: { id: true } } },
    });
    return toAuthenticatedUserResponse(user);
  }

  async findAll(): Promise<AuthenticatedUser[]> {
    const users = await this.prisma.user.findMany({
      include: { teams: { select: { id: true } } },
    });
    return users.map((user) => toAuthenticatedUserResponse(user));
  }

  async findOne(id: number): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { teams: { select: { id: true } } },
    });
    if (user == null) {
      return null;
    }
    return toAuthenticatedUserResponse(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<AuthenticatedUser> {
    const hashedPassword =
      updateUserDto.password === undefined
        ? undefined
        : await bcrypt.hash(updateUserDto.password, 12);

    const data: Prisma.UserUncheckedUpdateInput & {
      teams?: { set?: { id: number }[]; connect?: { id: number }[] };
    } = {
      name: updateUserDto.name,
      surname: updateUserDto.surname,
      email: updateUserDto.email,
      password: hashedPassword,
      phone: updateUserDto.phone ?? null,
      role: updateUserDto.role,
      bossId:
        updateUserDto.bossId != null && updateUserDto.bossId > 0
          ? updateUserDto.bossId
          : null,
      companyId:
        updateUserDto.companyId != null && updateUserDto.companyId > 0
          ? updateUserDto.companyId
          : undefined,
    };

    if (updateUserDto.teamIds != null) {
      data.teams = {
        set: [],
        connect: updateUserDto.teamIds.map((teamId) => ({ id: teamId })),
      };
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { teams: { select: { id: true } } },
    });

    return toAuthenticatedUserResponse(user);
  }

  async remove(id: number): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.delete({
      where: { id },
      include: { teams: { select: { id: true } } },
    });
    return toAuthenticatedUserResponse(user);
  }
}
