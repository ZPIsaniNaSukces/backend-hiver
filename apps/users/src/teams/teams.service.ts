import { CreateTeamDto, UpdateTeamDto } from "@app/contracts/teams";
import { PrismaService } from "@app/prisma/prisma.service";
import type { Prisma } from "@prisma/client";

import { Injectable, NotFoundException } from "@nestjs/common";

const leaderSelect = {
  id: true,
  name: true,
  surname: true,
  email: true,
  role: true,
  title: true,
};

const teamListInclude = {
  leader: { select: leaderSelect },
  _count: { select: { users: true } },
} satisfies Prisma.TeamInclude;

const teamDetailInclude = {
  ...teamListInclude,
  users: {
    select: leaderSelect,
  },
} satisfies Prisma.TeamInclude;

type TeamListRecord = Prisma.TeamGetPayload<{
  include: typeof teamListInclude;
}>;
type TeamDetailRecord = Prisma.TeamGetPayload<{
  include: typeof teamDetailInclude;
}>;

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto, companyId: number) {
    const normalizedMemberIds = this.normalizeMemberIds(
      createTeamDto.memberIds,
    );
    const memberRelation = this.buildMemberConnect(normalizedMemberIds);
    const baseData: Prisma.TeamUncheckedCreateInput = {
      name: createTeamDto.name,
      companyId,
      leaderId: createTeamDto.leaderId ?? null,
    };
    const data =
      memberRelation == null ? baseData : { ...baseData, ...memberRelation };
    const team = await this.prisma.team.create({
      data,
      include: teamDetailInclude,
    });
    return this.toTeamDetailResponse(team);
  }

  async findAll() {
    const teams = await this.prisma.team.findMany({
      include: teamListInclude,
    });
    return teams.map((team) => this.toTeamListResponse(team));
  }

  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: teamDetailInclude,
    });
    if (team == null) {
      return null;
    }
    return this.toTeamDetailResponse(team);
  }

  async update(id: number, updateTeamDto: UpdateTeamDto, companyId: number) {
    await this.ensureTeamBelongsToCompany(id, companyId);
    const { memberIds, id: _ignored, name, leaderId } = updateTeamDto;
    const normalizedMemberIds = this.normalizeMemberIds(memberIds);
    const memberRelation = this.buildMemberSet(normalizedMemberIds);
    const data: Prisma.TeamUncheckedUpdateInput = {};
    if (name !== undefined) {
      data.name = name;
    }
    if (leaderId !== undefined) {
      data.leaderId = leaderId;
    }
    const finalData =
      memberRelation == null ? data : { ...data, ...memberRelation };
    const team = await this.prisma.team.update({
      where: { id },
      data: finalData,
      include: teamDetailInclude,
    });
    return this.toTeamDetailResponse(team);
  }

  async remove(id: number) {
    return this.prisma.team.delete({ where: { id } });
  }

  private async ensureTeamBelongsToCompany(id: number, companyId: number) {
    const team = await this.prisma.team.findFirst({
      where: { id, companyId },
      select: { id: true },
    });
    if (team == null) {
      throw new NotFoundException("Team not found");
    }
  }

  private toTeamListResponse(team: TeamListRecord) {
    const { _count, ...rest } = team;
    return {
      ...rest,
      usersCount: _count.users,
    };
  }

  private toTeamDetailResponse(team: TeamDetailRecord) {
    const { _count, ...rest } = team;
    return {
      ...rest,
      usersCount: _count.users,
    };
  }

  private normalizeMemberIds(memberIds: unknown): number[] | undefined {
    if (!Array.isArray(memberIds)) {
      return;
    }
    return memberIds.filter(
      (value): value is number => typeof value === "number",
    );
  }

  private buildMemberConnect(memberIds?: number[]) {
    if (memberIds == null || memberIds.length === 0) {
      return;
    }
    return {
      users: {
        connect: memberIds.map((userId) => ({ id: userId })),
      },
    };
  }

  private buildMemberSet(memberIds?: number[]) {
    if (memberIds == null) {
      return;
    }
    return {
      users: {
        set: memberIds.map((userId) => ({ id: userId })),
      },
    };
  }
}
