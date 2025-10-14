import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { TeamsController } from "./teams.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "TEAMS_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "teams-gateway",
            brokers: ["localhost:9092"],
          },
          consumer: {
            groupId: "teams-gateway-consumer",
          },
        },
      },
    ]),
  ],
  controllers: [TeamsController],
})
export class TeamsModule {}
