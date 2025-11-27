import type { HierarchyUserInfo } from "@app/auth";
import { BaseHierarchyService } from "@app/auth";

import { Inject, Injectable } from "@nestjs/common";

import {
  REQUESTS_PRISMA,
  RequestsPrismaClient,
} from "../prisma/prisma.constants";

@Injectable()
export class RequestsHierarchyService extends BaseHierarchyService {
  constructor(
    @Inject(REQUESTS_PRISMA)
    private readonly prisma: RequestsPrismaClient,
  ) {
    super();
  }

  async findUserInfo(userId: number): Promise<HierarchyUserInfo | null> {
    const userInfo = await this.prisma.requestUserInfo.findUnique({
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
