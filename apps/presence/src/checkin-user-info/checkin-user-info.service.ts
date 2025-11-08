import type { AuthenticatedUser } from "@app/auth";
import { USER_ROLE } from "@prisma/client";

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  PRESENCE_PRISMA,
  PresencePrismaClient,
} from "../prisma/prisma.constants";

@Injectable()
export class CheckinUserInfoService {
  constructor(
    @Inject(PRESENCE_PRISMA)
    private readonly prisma: PresencePrismaClient,
  ) {}

  async upsert(userId: number, companyId: number) {
    return await this.prisma.checkinUserInfo.upsert({
      where: { userId },
      create: { userId, companyId },
      update: { companyId },
    });
  }

  async remove(userId: number) {
    try {
      await this.prisma.checkinUserInfo.delete({ where: { userId } });
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        return;
      }
      throw error;
    }
  }

  async findOne(userId: number, user: AuthenticatedUser) {
    if (user.role === USER_ROLE.EMPLOYEE && user.id !== userId) {
      throw new ForbiddenException(
        "Employees can only view their own synced info",
      );
    }

    const userInfo = await this.prisma.checkinUserInfo.findUnique({
      where: { userId },
    });

    if (userInfo == null) {
      throw new NotFoundException("Presence user info not found");
    }

    if (userInfo.companyId !== user.companyId) {
      throw new ForbiddenException(
        "Cannot access user info from another company",
      );
    }

    return userInfo;
  }

  private isRecordNotFound(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error != null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    );
  }
}
