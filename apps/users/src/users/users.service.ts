import { PrismaService } from "@app/prisma";

import { Injectable } from "@nestjs/common";

import { CreateUserDto } from "../../../api-gateway/src/users/dto/create-user.dto";
import { UpdateUserDto } from "../../../api-gateway/src/users/dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const data = {
      name: createUserDto.name,
      surname: createUserDto.surname,
      email: createUserDto.email,
      password: createUserDto.password,
      phone: createUserDto.phone ?? undefined,
      role: createUserDto.role,
      teamId:
        createUserDto.teamId != null && createUserDto.teamId > 0
          ? createUserDto.teamId
          : undefined,
      companyId:
        createUserDto.companyId != null && createUserDto.companyId > 0
          ? createUserDto.companyId
          : undefined,
    } satisfies Parameters<typeof this.prisma.user.create>[0]["data"];

    return this.prisma.user.create({ data });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
