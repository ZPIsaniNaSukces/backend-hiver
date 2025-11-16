import type {
  UserCreatedEventDto,
  UserUpdatedEventDto,
} from "@app/contracts/users";

import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { LEAVE_REQUESTS_PRISMA } from "../prisma/prisma.constants";
import { LeaveRequestsService } from "./leave-requests.service";

describe("LeaveRequestsService", () => {
  let service: LeaveRequestsService;
  const prismaServiceMock = {
    leaveRequest: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    leaveRequestUserInfo: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveRequestsService,
        {
          provide: LEAVE_REQUESTS_PRISMA,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<LeaveRequestsService>(LeaveRequestsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("creates LeaveRequestUserInfo on user created event", async () => {
    const payload: UserCreatedEventDto = { id: 10, bossId: 3, companyId: 1 };
    const created = { id: 10, bossId: 3, companyId: 1, availableLeaveDays: 20 };
    prismaServiceMock.leaveRequestUserInfo.create.mockResolvedValue(created);

    const result = await service.handleUserCreated(payload);
    expect(prismaServiceMock.leaveRequestUserInfo.create).toHaveBeenCalledWith({
      data: { id: 10, bossId: 3, companyId: 1, availableLeaveDays: 20 },
    });
    expect(result).toEqual(created);
  });

  it("updates LeaveRequestUserInfo on user updated event", async () => {
    const payload: UserUpdatedEventDto = { id: 10, bossId: null, companyId: 2 };
    prismaServiceMock.leaveRequestUserInfo.update.mockResolvedValue({});

    await service.handleUserUpdated(payload);

    expect(prismaServiceMock.leaveRequestUserInfo.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { bossId: null, companyId: 2 },
    });
  });
});
