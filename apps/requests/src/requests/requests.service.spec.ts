import type {
  UserCreatedEventDto,
  UserUpdatedEventDto,
} from "@app/contracts/users";

import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { REQUESTS_PRISMA } from "../prisma/prisma.constants";
import { RequestsService } from "./requests.service";

describe("RequestsService", () => {
  let service: RequestsService;
  const prismaServiceMock = {
    availabilityRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    generalRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    requestUserInfo: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: REQUESTS_PRISMA,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("creates RequestUserInfo on user created event", async () => {
    const payload: UserCreatedEventDto = { id: 10, bossId: 3, companyId: 1 };
    const created = { id: 10, bossId: 3, companyId: 1, availableLeaveDays: 20 };
    prismaServiceMock.requestUserInfo.create.mockResolvedValue(created);

    const result = await service.handleUserCreated(payload);
    expect(prismaServiceMock.requestUserInfo.create).toHaveBeenCalledWith({
      data: { id: 10, bossId: 3, companyId: 1, availableLeaveDays: 20 },
    });
    expect(result).toEqual(created);
  });

  it("updates RequestUserInfo on user updated event", async () => {
    const payload: UserUpdatedEventDto = { id: 10, bossId: null, companyId: 2 };
    prismaServiceMock.requestUserInfo.update.mockResolvedValue({});

    await service.handleUserUpdated(payload);

    expect(prismaServiceMock.requestUserInfo.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { bossId: null, companyId: 2 },
    });
  });
});
