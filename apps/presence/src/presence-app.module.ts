import { AuthModule } from "@app/auth";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { CheckinUserInfoModule } from "./checkin-user-info/checkin-user-info.module";
import { CheckinModule } from "./checkin/checkin.module";
import { NfcTagsModule } from "./nfc-tags/nfc-tags.module";
import { PresenceAppController } from "./presence-app.controller";
import {
  PRESENCE_PRISMA,
  PresencePrismaClient,
} from "./prisma/prisma.constants";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({
      provide: PRESENCE_PRISMA,
      client: PresencePrismaClient,
      databaseUrlEnv: "PRESENCE_DATABASE_URL",
      global: true,
    }),
    AuthModule,
    CheckinModule,
    CheckinUserInfoModule,
    NfcTagsModule,
  ],
  controllers: [PresenceAppController],
})
export class PresenceAppModule {}
