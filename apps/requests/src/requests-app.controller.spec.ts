import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { RequestsAppController } from "./requests-app.controller";

describe("RequestsAppController", () => {
  let controller: RequestsAppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsAppController],
    }).compile();

    controller = module.get<RequestsAppController>(RequestsAppController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
