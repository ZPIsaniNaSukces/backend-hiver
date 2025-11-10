import {
  CreateLeaveRequestDto,
  CreateLeaveRequestUserInfoDto,
  UpdateLeaveRequestDto,
} from "@app/contracts/leave-requests";
import { UserCreatedEventDto, UserUpdatedEventDto } from "@app/contracts/users";
import type { LeaveRequest, Prisma } from "@generated/leave-requests";

import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import {
  LEAVE_REQUESTS_PRISMA,
  LeaveRequestsPrismaClient,
} from "../prisma/prisma.constants";

@Injectable()
export class LeaveRequestsService {
  constructor(
    @Inject(LEAVE_REQUESTS_PRISMA)
    private readonly prisma: LeaveRequestsPrismaClient,
  ) {}

  private calculateLeaveDays(startsAt: Date, endsAt: Date): number {
    // Normalize to midnight to avoid partial day issues
    const start = new Date(
      Date.UTC(
        startsAt.getUTCFullYear(),
        startsAt.getUTCMonth(),
        startsAt.getUTCDate(),
      ),
    );
    const end = new Date(
      Date.UTC(
        endsAt.getUTCFullYear(),
        endsAt.getUTCMonth(),
        endsAt.getUTCDate(),
      ),
    );
    const diffMs = end.getTime() - start.getTime();
    // Inclusive day count; same-day leave counts as 1
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
    return days;
  }

  async create(
    createLeaveRequestDto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const startsAt = new Date(createLeaveRequestDto.startsAt);
    const endsAt = new Date(createLeaveRequestDto.endsAt);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException("Invalid date format for startsAt/endsAt");
    }
    if (endsAt < startsAt) {
      throw new BadRequestException("endsAt must be on or after startsAt");
    }

    const requestedDays = this.calculateLeaveDays(startsAt, endsAt);

    // TODO: refactor
    type LRUIDelegate = {
      findUnique: (options: {
        where: { id: number };
        select: { id: true; availableLeaveDays: true };
      }) => Promise<{ id: number; availableLeaveDays: number } | null>;
      update: (options: {
        where: { id: number };
        data: { availableLeaveDays: { decrement: number } };
      }) => Promise<unknown>;
    };
    const lru = (
      this.prisma as unknown as {
        leaveRequestUserInfo: LRUIDelegate;
      }
    ).leaveRequestUserInfo;

    const userInfo = await lru.findUnique({
      where: { id: createLeaveRequestDto.userId },
      select: { id: true, availableLeaveDays: true },
    });

    if (userInfo == null) {
      throw new BadRequestException("LeaveRequestUserInfo not found for user");
    }
    if (userInfo.availableLeaveDays < requestedDays) {
      throw new BadRequestException("Insufficient available leave days");
    }

    const data: Prisma.LeaveRequestUncheckedCreateInput = {
      userId: createLeaveRequestDto.userId,
      startsAt,
      endsAt,
      reason: createLeaveRequestDto.reason,
      status: createLeaveRequestDto.status,
      approvedById: createLeaveRequestDto.approvedById ?? null,
    };

    const created = await this.prisma.$transaction(async (tx) => {
      await (
        tx as unknown as { leaveRequestUserInfo: LRUIDelegate }
      ).leaveRequestUserInfo.update({
        where: { id: userInfo.id },
        data: { availableLeaveDays: { decrement: requestedDays } },
      });

      return await tx.leaveRequest.create({ data });
    });

    return created;
  }

  async findAll(): Promise<LeaveRequest[]> {
    return await this.prisma.leaveRequest.findMany();
  }

  async findOne(id: number): Promise<LeaveRequest | null> {
    return await this.prisma.leaveRequest.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    updateLeaveRequestDto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const data: Prisma.LeaveRequestUncheckedUpdateInput = {
      userId: updateLeaveRequestDto.userId,
      startsAt:
        updateLeaveRequestDto.startsAt === undefined
          ? undefined
          : new Date(updateLeaveRequestDto.startsAt),
      endsAt:
        updateLeaveRequestDto.endsAt === undefined
          ? undefined
          : new Date(updateLeaveRequestDto.endsAt),
      reason: updateLeaveRequestDto.reason,
      status: updateLeaveRequestDto.status,
      approvedById: updateLeaveRequestDto.approvedById ?? null,
    };

    return await this.prisma.leaveRequest.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<LeaveRequest> {
    return await this.prisma.leaveRequest.delete({
      where: { id },
    });
  }

  async approve(id: number): Promise<LeaveRequest> {
    return await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    });
  }

  async reject(id: number): Promise<LeaveRequest> {
    return await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: "REJECTED" },
    });
  }

  async handleUserCreated(
    event: UserCreatedEventDto,
  ): Promise<CreateLeaveRequestUserInfoDto> {
    type LRUIWriter = {
      create: (options: {
        data: {
          id: number;
          bossId?: number | null;
          companyId: number;
          availableLeaveDays?: number;
        };
      }) => Promise<CreateLeaveRequestUserInfoDto>;
    };
    const lruWriter = (
      this.prisma as unknown as { leaveRequestUserInfo: LRUIWriter }
    ).leaveRequestUserInfo;

    return await lruWriter.create({
      data: {
        id: event.id,
        bossId: event.bossId ?? null,
        companyId: event.companyId,
        availableLeaveDays: 20,
      },
    });
  }

  async handleUserUpdated(event: UserUpdatedEventDto): Promise<void> {
    type LRUIUpdater = {
      update: (options: {
        where: { id: number };
        data: { bossId?: number | null; companyId?: number };
      }) => Promise<unknown>;
    };
    const lruUpdater = (
      this.prisma as unknown as { leaveRequestUserInfo: LRUIUpdater }
    ).leaveRequestUserInfo;

    const data: { bossId?: number | null; companyId?: number } = {};
    if (event.bossId !== undefined) {
      data.bossId = event.bossId;
    }
    if (event.companyId !== undefined) {
      data.companyId = event.companyId;
    }

    await lruUpdater.update({
      where: { id: event.id },
      data,
    });
  }

  async handleUserRemoved(userId: number): Promise<void> {
    await this.prisma.leaveRequestUserInfo.delete({
      where: { id: userId },
    });
  }
}
