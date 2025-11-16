import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { LEAVE_REQUESTS_PRISMA } from "../prisma/prisma.constants";
import { LeaveRequestsController } from "./leave-requests.controller";
import { LeaveRequestsService } from "./leave-requests.service";

describe("LeaveRequestsController", () => {
  let controller: LeaveRequestsController;
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
      controllers: [LeaveRequestsController],
      providers: [
        LeaveRequestsService,
        {
          provide: LEAVE_REQUESTS_PRISMA,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    controller = module.get<LeaveRequestsController>(LeaveRequestsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
