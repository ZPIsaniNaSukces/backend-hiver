import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { LeaveRequestsAppController } from "./leave-requests-app.controller";

describe("LeaveRequestsAppController", () => {
  let controller: LeaveRequestsAppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveRequestsAppController],
    }).compile();

    controller = module.get<LeaveRequestsAppController>(
      LeaveRequestsAppController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
