import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthClientModule } from "./auth-client.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [ConfigModule, PrismaModule.forRoot(), AuthClientModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, AuthClientModule],
})
export class AuthModule {}
