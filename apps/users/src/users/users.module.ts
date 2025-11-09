import { MailModule } from "@app/mail";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";

import { UsersController } from "../users/users.controller";
import { UsersService } from "../users/users.service";

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
