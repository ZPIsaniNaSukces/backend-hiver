import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { TASKS_PRISMA } from "./prisma/prisma.constants";
import { TasksHierarchyService } from "./tasks-hierarchy.service";
import { TasksService } from "./tasks.service";

describe("TasksService", () => {
  let service: TasksService;
  let prismaService: typeof prismaServiceMock;
  const prismaServiceMock = {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    taskUserInfo: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const hierarchyServiceMock = {
    findUserInfo: jest.fn(),
    isAboveInHierarchy: jest.fn(),
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
        {
          provide: TasksHierarchyService,
          useValue: hierarchyServiceMock,
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
