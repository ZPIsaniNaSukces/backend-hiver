import { HIERARCHY_SERVICE } from "@app/auth";
import { MailModule } from "@app/mail";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { UsersHierarchyService } from "../users/users-hierarchy.service";
import { UsersController } from "../users/users.controller";
import { UsersService } from "../users/users.service";

@Module({
  imports: [
    PrismaModule,
    MailModule,
    ClientsModule.register([
      {
        name: "USERS_KAFKA",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "users-service",
            brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"],
          },
          consumer: {
            groupId: "users-service-consumer",
          },
          producer: { allowAutoTopicCreation: true },
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersHierarchyService,
    {
      provide: HIERARCHY_SERVICE,
      useExisting: UsersHierarchyService,
    },
  ],
})
export class UsersModule {}
