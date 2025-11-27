import { HIERARCHY_SERVICE } from "@app/auth";

import { Module } from "@nestjs/common";

import { NfcTagsModule } from "../nfc-tags/nfc-tags.module";
import { CheckinController } from "./checkin.controller";
import { CheckinService } from "./checkin.service";
import { CmacService } from "./cmac.service";
import { PresenceHierarchyService } from "./presence-hierarchy.service";

@Module({
  imports: [NfcTagsModule],
  controllers: [CheckinController],
  providers: [
    CheckinService,
    CmacService,
    PresenceHierarchyService,
    {
      provide: HIERARCHY_SERVICE,
      useExisting: PresenceHierarchyService,
    },
  ],
})
export class CheckinModule {}
