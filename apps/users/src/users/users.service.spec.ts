import { PrismaService } from "@app/prisma";

import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { UsersService } from "../users/users.service";

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;
  const prismaServiceMock = {
    user: {
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
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: "USERS_KAFKA",
          useValue: {
            connect: jest.fn(),
            close: jest.fn(),
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });
});
