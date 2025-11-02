import { PrismaService } from "@app/prisma";

import { Test, TestingModule } from "@nestjs/testing";

import { TasksService } from "./tasks.service";

describe("TasksService", () => {
  let service: TasksService;
  let prismaService: PrismaService;
  const prismaServiceMock = {
    task: {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAssignedToUser: jest.fn(),
      findReportedByUser: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });
});
