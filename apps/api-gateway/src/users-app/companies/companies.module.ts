import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { CompaniesController } from "./companies.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "COMPANIES_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "companies",
            brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"],
          },
          consumer: {
            groupId: "companies-gateway-consumer",
          },
        },
      },
    ]),
  ],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
