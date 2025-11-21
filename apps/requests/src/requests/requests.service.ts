import {
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

    const userInfo = await this.prisma.requestUserInfo.findUnique({
      where: { id: userId },
    });

    if (userInfo == null) {
      throw new BadRequestException("RequestUserInfo not found for user");
    }

    // Optional: Check for existing request on same date?
    // Optional: Logic for VACATION deduction (skipped for now as per simplified requirements)

    return await this.prisma.availabilityRequest.create({
      data: {
        userId,
        date: new Date(date),
        hours,
        type: type as unknown as AVAILABILITY_TYPE,
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
    return await this.prisma.availabilityRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedById: rejectorId,
        acceptedRejectedAt: new Date(),
      },
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

  async findAllAvailabilityRequests(): Promise<AvailabilityRequest[]> {
    return await this.prisma.availabilityRequest.findMany();
  }

  async findAllGeneralRequests(): Promise<GeneralRequest[]> {
    return await this.prisma.generalRequest.findMany();
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
        availableLeaveDays: 20,
      },
    });
  }

  async handleUserUpdated(event: UserUpdatedEventDto): Promise<void> {
    const data: { bossId?: number | null; companyId?: number } = {};
    if (event.bossId !== undefined) {
      data.bossId = event.bossId;
    }
    if (event.companyId !== undefined) {
      data.companyId = event.companyId;
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
