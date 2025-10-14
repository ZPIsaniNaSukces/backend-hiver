import { PrismaService } from "@app/prisma";

import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { CompaniesService } from "./companies.service";

describe("CompaniesService", () => {
  let service: CompaniesService;
  let prismaService: PrismaService;
  const prismaServiceMock = {
    company: {
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
        CompaniesService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });
});
