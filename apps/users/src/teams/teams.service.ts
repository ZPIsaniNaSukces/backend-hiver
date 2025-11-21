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
    return this.prisma.team.findMany({
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            role: true,
            title: true,
          },
        },
        _count: { select: { users: true } },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.team.findUnique({
      where: { id },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            role: true,
            title: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            role: true,
            title: true,
          },
        },
        _count: { select: { users: true } },
      },
    });
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    return this.prisma.team.update({ where: { id }, data: updateTeamDto });
  }

  async remove(id: number) {
    return this.prisma.team.delete({ where: { id } });
  }
}
