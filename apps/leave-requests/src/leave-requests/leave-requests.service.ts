import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
} from "@app/contracts/leave-requests";
import { PrismaService } from "@app/prisma";
import type { LeaveRequest, Prisma } from "@prisma/client";

import { Injectable } from "@nestjs/common";

@Injectable()
export class LeaveRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createLeaveRequestDto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const data: Prisma.LeaveRequestUncheckedCreateInput = {
      userId: createLeaveRequestDto.userId,
      startsAt: new Date(createLeaveRequestDto.startsAt),
      endsAt: new Date(createLeaveRequestDto.endsAt),
      reason: createLeaveRequestDto.reason,
      status: createLeaveRequestDto.status,
      approvedBy: createLeaveRequestDto.approvedBy ?? null,
    };

    return await this.prisma.leaveRequest.create({
      data,
    });
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
      approvedBy: updateLeaveRequestDto.approvedBy ?? null,
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
}
