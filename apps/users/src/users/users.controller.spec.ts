import { MailService } from "@app/mail";
import { PrismaService } from "@app/prisma";

import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { UsersController } from "../users/users.controller";
import { UsersService } from "../users/users.service";

describe("UsersController", () => {
  let controller: UsersController;
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
  const mailServiceMock = {
    sendWelcomeEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: MailService,
          useValue: mailServiceMock,
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

    controller = module.get<UsersController>(UsersController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(prismaService).toBeDefined();
  });
});
