import { AuthModule } from "@app/auth";

import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { UsersController } from "./users.controller";

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: "USERS_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "users",
            brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"],
          },
          consumer: {
            groupId: "users-consumer",
          },
        },
      },
    ]),
  ],
  controllers: [UsersController],
})
export class UsersModule {}
