import type { AuthenticatedUser } from "@app/auth";
import { CreateUserDto, UpdateUserDto } from "@app/contracts/users";
import { PrismaService } from "@app/prisma";
import type { Prisma, User } from "@prisma/client";
import * as bcrypt from "bcrypt";

import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    const { password: _password, ...rest } = user;

    return {
      ...rest,
      phone: rest.phone ?? null,
      teamId: rest.teamId ?? null,
      companyId: rest.companyId,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<AuthenticatedUser> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const data: Prisma.UserUncheckedCreateInput = {
      name: createUserDto.name,
      surname: createUserDto.surname,
      email: createUserDto.email,
      password: hashedPassword,
      phone: createUserDto.phone ?? null,
      role: createUserDto.role,
      teamId:
        createUserDto.teamId != null && createUserDto.teamId > 0
          ? createUserDto.teamId
          : null,
      companyId: createUserDto.companyId,
    };

    const user = await this.prisma.user.create({ data });
    return this.toAuthenticatedUser(user);
  }

  async findAll(): Promise<AuthenticatedUser[]> {
    const users = await this.prisma.user.findMany();
    return users.map((user) => this.toAuthenticatedUser(user));
  }

  async findOne(id: number): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user == null) {
      return null;
    }
    return this.toAuthenticatedUser(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<AuthenticatedUser> {
    const hashedPassword =
      updateUserDto.password === undefined
        ? undefined
        : await bcrypt.hash(updateUserDto.password, 12);

    const data: Prisma.UserUncheckedUpdateInput = {
      name: updateUserDto.name,
      surname: updateUserDto.surname,
      email: updateUserDto.email,
      password: hashedPassword,
      phone: updateUserDto.phone ?? null,
      role: updateUserDto.role,
      teamId:
        updateUserDto.teamId != null && updateUserDto.teamId > 0
          ? updateUserDto.teamId
          : null,
      companyId:
        updateUserDto.companyId != null && updateUserDto.companyId > 0
          ? updateUserDto.companyId
          : undefined,
    };

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.toAuthenticatedUser(user);
  }

  async remove(id: number): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.delete({ where: { id } });
    return this.toAuthenticatedUser(user);
  }
}
