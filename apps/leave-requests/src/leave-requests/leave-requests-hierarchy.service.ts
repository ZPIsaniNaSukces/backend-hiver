import type { HierarchyUserInfo } from "@app/auth";
import { BaseHierarchyService } from "@app/auth";

import { Inject, Injectable } from "@nestjs/common";

import {
  LEAVE_REQUESTS_PRISMA,
  LeaveRequestsPrismaClient,
} from "../prisma/prisma.constants";

@Injectable()
export class LeaveRequestsHierarchyService extends BaseHierarchyService {
  constructor(
    @Inject(LEAVE_REQUESTS_PRISMA)
    private readonly prisma: LeaveRequestsPrismaClient,
  ) {
    super();
  }

  async findUserInfo(userId: number): Promise<HierarchyUserInfo | null> {
    const userInfo = await this.prisma.leaveRequestUserInfo.findUnique({
      where: { id: userId },
      select: {
        id: true,
        bossId: true,
        companyId: true,
      },
    });

    return userInfo;
  }
}
