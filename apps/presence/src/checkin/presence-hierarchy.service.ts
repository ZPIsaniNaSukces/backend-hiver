import type { HierarchyUserInfo } from "@app/auth";
import { BaseHierarchyService } from "@app/auth";

import { Inject, Injectable } from "@nestjs/common";

import {
  PRESENCE_PRISMA,
  PresencePrismaClient,
} from "../prisma/prisma.constants";

@Injectable()
export class PresenceHierarchyService extends BaseHierarchyService {
  constructor(
    @Inject(PRESENCE_PRISMA)
    private readonly prisma: PresencePrismaClient,
  ) {
    super();
  }

  async findUserInfo(userId: number): Promise<HierarchyUserInfo | null> {
    const userInfo = await this.prisma.checkinUserInfo.findUnique({
      where: { userId },
      select: {
        userId: true,
        bossId: true,
        companyId: true,
      },
    });

    if (userInfo == null) {
      return null;
    }

    return {
      id: userInfo.userId,
      bossId: userInfo.bossId,
      companyId: userInfo.companyId,
    };
  }
}
