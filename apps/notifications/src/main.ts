import { PrismaExceptionFilter } from "@app/prisma";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import type { MicroserviceOptions } from "@nestjs/microservices";

import { NotificationsModule } from "./notifications.module";

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: "notifications-service",
        brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"],
      },
      consumer: {
        groupId: "notifications-service-consumer",
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3005);
}

void bootstrap();
