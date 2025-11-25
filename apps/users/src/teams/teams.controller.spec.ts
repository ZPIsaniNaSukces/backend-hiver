/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { AuthenticatedUser } from "@app/auth";
import { PrismaService } from "@app/prisma";

import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { TeamsController } from "../teams/teams.controller";
import { TeamsService } from "../teams/teams.service";

describe("TeamsController", () => {
  let controller: TeamsController;
  let prismaService: PrismaService;
  const prismaServiceMock = {
    team: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        TeamsService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  it("creates team using admin company id", async () => {
    const admin = { companyId: 7 } as AuthenticatedUser;
    const dto = { name: "Design", memberIds: [1] };
    prismaServiceMock.team.create.mockResolvedValue({
      id: 1,
      name: "Design",
      leader: null,
      users: [],
      _count: { users: 1 },
    });

    await controller.create(dto, admin);

    expect(prismaServiceMock.team.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Design",
        companyId: 7,
        users: { connect: [{ id: 1 }] },
      }),
      include: expect.any(Object),
    });
  });

  it("replaces members list on PUT", async () => {
    const admin = { companyId: 7 } as AuthenticatedUser;
    prismaServiceMock.team.findFirst.mockResolvedValue({ id: 2 });
    prismaServiceMock.team.update.mockResolvedValue({
      id: 2,
      name: "Ops",
      leader: null,
      users: [],
      _count: { users: 2 },
    });

    await controller.replaceMembers(
      2,
      { memberIds: [5, 6], name: "Ops" },
      admin,
    );

    expect(prismaServiceMock.team.findFirst).toHaveBeenCalledWith({
      where: { id: 2, companyId: 7 },
      select: { id: true },
    });
    expect(prismaServiceMock.team.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: {
        name: "Ops",
        users: { set: [{ id: 5 }, { id: 6 }] },
      },
      include: expect.any(Object),
    });
  });
});
