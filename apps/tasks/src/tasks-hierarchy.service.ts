import type { HierarchyUserInfo } from "@app/auth";
import { BaseHierarchyService } from "@app/auth";

import { Inject, Injectable } from "@nestjs/common";

import { TASKS_PRISMA, TasksPrismaClient } from "./prisma/prisma.constants";

@Injectable()
export class TasksHierarchyService extends BaseHierarchyService {
  constructor(
    @Inject(TASKS_PRISMA)
    private readonly prisma: TasksPrismaClient,
  ) {
    super();
  }

  async findUserInfo(userId: number): Promise<HierarchyUserInfo | null> {
    const userInfo = await this.prisma.taskUserInfo.findUnique({
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
