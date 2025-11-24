/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaServiceMock.team.findMany.mockResolvedValue([]);
    prismaServiceMock.team.findUnique.mockResolvedValue({
      id: 1,
      name: "Ops",
      leader: null,
      users: [],
      _count: { users: 0 },
    });
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

  it("creates a team with inferred companyId and members", async () => {
    prismaServiceMock.team.create.mockResolvedValue({
      id: 1,
      name: "Ops",
      leader: null,
      users: [],
      _count: { users: 2 },
    });

    await service.create({ name: "Ops", leaderId: 5, memberIds: [10, 11] }, 3);

    expect(prismaServiceMock.team.create).toHaveBeenCalledWith({
      data: {
        name: "Ops",
        leaderId: 5,
        companyId: 3,
        users: { connect: [{ id: 10 }, { id: 11 }] },
      },
      include: expect.objectContaining({
        users: expect.any(Object),
      }),
    });
  });

  it("should find all teams with leader and user count", async () => {
    await service.findAll();
    expect(prismaServiceMock.team.findMany).toHaveBeenCalledWith({
      include: expect.objectContaining({
        leader: expect.any(Object),
        _count: { select: { users: true } },
      }),
    });
  });

  it("should find one team with leader, users and count", async () => {
    await service.findOne(1);
    expect(prismaServiceMock.team.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: expect.objectContaining({
        leader: expect.any(Object),
        users: expect.any(Object),
        _count: { select: { users: true } },
      }),
    });
  });

  it("updates a team by replacing members list", async () => {
    prismaServiceMock.team.findFirst.mockResolvedValue({ id: 1 });
    prismaServiceMock.team.update.mockResolvedValue({
      id: 1,
      name: "Updated",
      leader: null,
      users: [],
      _count: { users: 2 },
    });

    await service.update(1, { memberIds: [1, 2], name: "Updated" }, 3);

    expect(prismaServiceMock.team.findFirst).toHaveBeenCalledWith({
      where: { id: 1, companyId: 3 },
      select: { id: true },
    });
    expect(prismaServiceMock.team.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        name: "Updated",
        users: { set: [{ id: 1 }, { id: 2 }] },
      },
      include: expect.objectContaining({
        users: expect.any(Object),
      }),
    });
  });
});
