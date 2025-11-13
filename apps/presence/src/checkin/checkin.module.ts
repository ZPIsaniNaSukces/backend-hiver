import { Module } from "@nestjs/common";

import { NfcTagsModule } from "../nfc-tags/nfc-tags.module";
import { CheckinController } from "./checkin.controller";
import { CheckinService } from "./checkin.service";

@Module({
  imports: [NfcTagsModule],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
