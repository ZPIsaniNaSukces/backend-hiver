import { MailService } from "@app/mail";
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

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated users without search", async () => {
      const users = [
        {
          id: 1,
          name: "John",
          surname: "Doe",
          email: "john@example.com",
          password: "hashed",
          role: "EMPLOYEE",
          companyId: 1,
          teams: [],
        },
      ];
      const total = 1;

      prismaServiceMock.user.findMany.mockResolvedValue(users);
      prismaServiceMock.user.count.mockResolvedValue(total);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        where: undefined,
        skip: 0,
        take: 10,
        include: { teams: { select: { id: true, name: true } } },
      });
      expect(prismaServiceMock.user.count).toHaveBeenCalledWith({
        where: undefined,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it("should return paginated users with search", async () => {
      const users = [
        {
          id: 1,
          name: "Alice",
          surname: "Smith",
          email: "alice@example.com",
          password: "hashed",
          role: "EMPLOYEE",
          companyId: 1,
          teams: [],
        },
      ];
      const total = 1;
      const searchTerm = "Alice";

      prismaServiceMock.user.findMany.mockResolvedValue(users);
      prismaServiceMock.user.count.mockResolvedValue(total);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: searchTerm,
      });

      const expectedWhere = {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { surname: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ],
      };

      expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 0,
        take: 10,
        include: { teams: { select: { id: true, name: true } } },
      });
      expect(prismaServiceMock.user.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
