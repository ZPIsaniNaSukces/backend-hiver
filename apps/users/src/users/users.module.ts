import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { UsersController } from "../users/users.controller";
import { UsersService } from "../users/users.service";

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: "USERS_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "users-service",
            brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"],
          },
          consumer: {
            groupId: "users-service-consumer",
          },
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
