import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { PrismaService } from "./prisma.service";

describe("PrismaService", () => {
  let service: PrismaService;
  let connectSpy: jest.SpiedFunction<PrismaService["$connect"]>;
  let disconnectSpy: jest.SpiedFunction<PrismaService["$disconnect"]>;

  beforeEach(async () => {
    // mock Prisma client's connection methods to avoid real DB calls
    connectSpy = jest
      .spyOn(PrismaService.prototype, "$connect")
      .mockResolvedValue();
    disconnectSpy = jest
      .spyOn(PrismaService.prototype, "$disconnect")
      .mockResolvedValue();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should not call $connect automatically on instantiation", () => {
    // onModuleInit should trigger $connect, not construction
    expect(connectSpy).not.toHaveBeenCalled();
  });

  it("should call $connect when onModuleInit is called", async () => {
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalledTimes(1);
  });

  it("should allow calling $disconnect and call the underlying method", async () => {
    await service.$disconnect();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it("should call $connect each time onModuleInit is invoked", async () => {
    await service.onModuleInit();
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalledTimes(2);
  });
});
