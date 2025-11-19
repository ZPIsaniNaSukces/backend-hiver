import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { TASKS_PRISMA } from "./prisma/prisma.constants";
import { TasksService } from "./tasks.service";

describe("TasksService", () => {
  let service: TasksService;
  let prismaService: typeof prismaServiceMock;
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
          provide: TASKS_PRISMA,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<typeof prismaServiceMock>(TASKS_PRISMA);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });
});
