import {
  AvailabilityType,
  CreateAvailabilityRequestDto,
  CreateGeneralRequestDto,
  CreateRequestUserInfoDto,
} from "@app/contracts/requests";
import { UserCreatedEventDto, UserUpdatedEventDto } from "@app/contracts/users";
import { AVAILABILITY_TYPE } from "@generated/requests";
import type { AvailabilityRequest, GeneralRequest } from "@generated/requests";

import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import {
  REQUESTS_PRISMA,
  RequestsPrismaClient,
} from "../prisma/prisma.constants";

@Injectable()
export class RequestsService {
  constructor(
    @Inject(REQUESTS_PRISMA)
    private readonly prisma: RequestsPrismaClient,
  ) {}

  async createAvailabilityRequest(
    dto: CreateAvailabilityRequestDto,
  ): Promise<AvailabilityRequest> {
    const { userId, date, hours, type } = dto;

    // Check for existing request on same date
    const existingRequest = await this.prisma.availabilityRequest.findFirst({
      where: {
        userId,
        date: new Date(date),
      },
    });

    if (existingRequest !== null) {
      throw new BadRequestException(
        "Availability request for this date already exists",
      );
    }

    const userInfo = await this.prisma.requestUserInfo.findUnique({
      where: { id: userId },
    });

    if (userInfo == null) {
      throw new BadRequestException("RequestUserInfo not found for user");
    }

    // Cast type to unknown first to avoid enum overlap issues in strict TS mode if generated types drift
    if (type === AvailabilityType.VACATION) {
      if (userInfo.availableLeaveHours < hours) {
        throw new BadRequestException("Insufficient available leave hours");
      }

      return await this.prisma.$transaction(async (tx) => {
        // Decrement available leave hours
        await tx.requestUserInfo.update({
          where: { id: userId },
          data: {
            availableLeaveHours: {
              decrement: hours,
            },
          },
        });

        return await tx.availabilityRequest.create({
          data: {
            userId,
            date: new Date(date),
            hours,
            type: AVAILABILITY_TYPE[type],
            status: "PENDING",
          },
        });
      });
    }

    return await this.prisma.availabilityRequest.create({
      data: {
        userId,
        date: new Date(date),
        hours,
        type: AVAILABILITY_TYPE[type],
        status: "PENDING",
      },
    });
  }

  async createGeneralRequest(
    dto: CreateGeneralRequestDto,
  ): Promise<GeneralRequest> {
    const { userId, description } = dto;

    const userInfo = await this.prisma.requestUserInfo.findUnique({
      where: { id: userId },
    });

    if (userInfo == null) {
      throw new BadRequestException("RequestUserInfo not found for user");
    }

    return await this.prisma.generalRequest.create({
      data: {
        userId,
        description,
        status: "PENDING",
      },
    });
  }

  async approveAvailabilityRequest(
    id: number,
    approverId: number,
  ): Promise<AvailabilityRequest> {
    return await this.prisma.availabilityRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById: approverId,
        acceptedRejectedAt: new Date(),
      },
    });
  }

  async rejectAvailabilityRequest(
    id: number,
    rejectorId: number,
  ): Promise<AvailabilityRequest> {
    const request = await this.prisma.availabilityRequest.findUnique({
      where: { id },
    });

    if (request === null) {
      throw new BadRequestException("Availability request not found");
    }

    return await this.prisma.$transaction(async (tx) => {
      if (
        request.type === AVAILABILITY_TYPE.VACATION &&
        request.status !== "REJECTED"
      ) {
        await tx.requestUserInfo.update({
          where: { id: request.userId },
          data: {
            availableLeaveHours: {
              increment: request.hours,
            },
          },
        });
      }

      return await tx.availabilityRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          approvedById: rejectorId,
          acceptedRejectedAt: new Date(),
        },
      });
    });
  }

  async approveGeneralRequest(
    id: number,
    approverId: number,
  ): Promise<GeneralRequest> {
    return await this.prisma.generalRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedById: approverId,
        acceptedRejectedAt: new Date(),
      },
    });
  }

  async rejectGeneralRequest(
    id: number,
    rejectorId: number,
  ): Promise<GeneralRequest> {
    return await this.prisma.generalRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedById: rejectorId,
        acceptedRejectedAt: new Date(),
      },
    });
  }

  async findAllAvailabilityRequests(user: { id: number; role: string | null }) {
    const isAdminOrManager = user.role === "ADMIN" || user.role === "MANAGER";

    return await this.prisma.availabilityRequest.findMany({
      where: isAdminOrManager ? {} : { userId: user.id },
      include: {
        user: true,
        approvedBy: true,
      },
    });
  }

  async findAllGeneralRequests(user: { id: number; role: string | null }) {
    const isAdminOrManager = user.role === "ADMIN" || user.role === "MANAGER";

    return await this.prisma.generalRequest.findMany({
      where: isAdminOrManager ? {} : { userId: user.id },
      include: {
        user: true,
        approvedBy: true,
      },
    });
  }

  // Event Handlers

  async handleUserCreated(
    event: UserCreatedEventDto,
  ): Promise<CreateRequestUserInfoDto> {
    return await this.prisma.requestUserInfo.create({
      data: {
        id: event.id,
        bossId: event.bossId ?? null,
        companyId: event.companyId,
        availableLeaveHours: 160, // Default to 160 hours (20 days * 8 hours)
        name: event.name ?? null,
        lastName: event.lastName ?? null,
        title: event.title ?? null,
      },
    });
  }

  async handleUserUpdated(event: UserUpdatedEventDto): Promise<void> {
    const data: {
      bossId?: number | null;
      companyId?: number;
      name?: string | null;
      lastName?: string | null;
      title?: string | null;
    } = {};
    if (event.bossId !== undefined) {
      data.bossId = event.bossId;
    }
    if (event.companyId !== undefined) {
      data.companyId = event.companyId;
    }
    if (event.name !== undefined) {
      data.name = event.name;
    }
    if (event.lastName !== undefined) {
      data.lastName = event.lastName;
    }
    if (event.title !== undefined) {
      data.title = event.title;
    }

    await this.prisma.requestUserInfo.update({
      where: { id: event.id },
      data,
    });
  }

  async handleUserRemoved(userId: number): Promise<void> {
    await this.prisma.requestUserInfo.delete({
      where: { id: userId },
    });
  }
}
