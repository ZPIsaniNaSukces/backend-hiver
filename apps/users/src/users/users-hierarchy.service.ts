import type { HierarchyUserInfo } from "@app/auth";
import { BaseHierarchyService } from "@app/auth";
import { PrismaService } from "@app/prisma";

import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersHierarchyService extends BaseHierarchyService {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findUserInfo(userId: number): Promise<HierarchyUserInfo | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        bossId: true,
        companyId: true,
      },
    });

    return user;
  }
}
