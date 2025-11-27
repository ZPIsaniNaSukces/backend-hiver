import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { REQUESTS_PRISMA } from "../prisma/prisma.constants";
import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";

describe("RequestsController", () => {
  let controller: RequestsController;
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
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [
        RequestsService,
        {
          provide: REQUESTS_PRISMA,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
