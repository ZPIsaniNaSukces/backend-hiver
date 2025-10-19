import { CreateTeamDto, UpdateTeamDto } from "@app/contracts/teams";
import { PrismaService } from "@app/prisma/prisma.service";

import { Injectable } from "@nestjs/common";

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto) {
    return this.prisma.team.create({ data: createTeamDto });
  }

  async findAll() {
    return this.prisma.team.findMany();
  }

  async findOne(id: number) {
    return this.prisma.team.findUnique({ where: { id } });
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    return this.prisma.team.update({ where: { id }, data: updateTeamDto });
  }

  async remove(id: number) {
    return this.prisma.team.delete({ where: { id } });
  }
}
