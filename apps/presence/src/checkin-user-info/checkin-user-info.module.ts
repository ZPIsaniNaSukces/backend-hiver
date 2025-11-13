import { Module } from "@nestjs/common";

import { CheckinUserInfoController } from "./checkin-user-info.controller";
import { CheckinUserInfoService } from "./checkin-user-info.service";

@Module({
  controllers: [CheckinUserInfoController],
  providers: [CheckinUserInfoService],
  exports: [CheckinUserInfoService],
})
export class CheckinUserInfoModule {}
