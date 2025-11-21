import { PrismaService } from "@app/prisma";

import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { TeamsService } from "../teams/teams.service";

describe("TeamsService", () => {
  let service: TeamsService;
  let prismaService: PrismaService;
  const prismaServiceMock = {
    team: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  it("should find all teams with leader and user count", async () => {
    await service.findAll();
    expect(prismaServiceMock.team.findMany).toHaveBeenCalledWith({
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            role: true,
            title: true,
          },
        },
        _count: { select: { users: true } },
      },
    });
  });

  it("should find one team with leader, users and count", async () => {
    await service.findOne(1);
    expect(prismaServiceMock.team.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            role: true,
            title: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            role: true,
            title: true,
          },
        },
        _count: { select: { users: true } },
      },
    });
  });
});
