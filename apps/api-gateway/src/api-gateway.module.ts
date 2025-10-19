import { AuthModule } from "@app/auth";

import { Module } from "@nestjs/common";

import { UsersAppModule } from "./users-app/users-app.module";

@Module({
  imports: [AuthModule, UsersAppModule],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
