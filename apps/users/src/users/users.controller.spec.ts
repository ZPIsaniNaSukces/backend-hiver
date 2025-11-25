import type { AuthenticatedUser } from "@app/auth";
import { MailService } from "@app/mail";
import { PrismaService } from "@app/prisma";
import { USER_ROLE } from "@prisma/client";

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
      count: jest.fn(),
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

  it("should create user with companyId from admin", async () => {
    const admin = { id: 1, companyId: 10 } as AuthenticatedUser;
    const dto = {
      email: "test@test.com",
      password: "pass",
      role: USER_ROLE.EMPLOYEE,
    };
    const createdUser = {
      id: 2,
      email: "test@test.com",
      companyId: 10,
      teams: [],
    };

    prismaServiceMock.user.create.mockResolvedValue(createdUser);

    await controller.create(dto, admin);

    expect(prismaServiceMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: 10,
        }) as unknown,
      }),
    );
  });
});
