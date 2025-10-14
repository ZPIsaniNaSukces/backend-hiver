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
});
