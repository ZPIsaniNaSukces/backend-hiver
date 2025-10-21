import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { UsersAppController } from "./users-app.controller";

describe("UsersAppController", () => {
  let controller: UsersAppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersAppController],
    }).compile();

    controller = module.get<UsersAppController>(UsersAppController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
