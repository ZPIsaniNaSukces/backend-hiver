import { PrismaExceptionFilter } from "@app/prisma";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import type { MicroserviceOptions } from "@nestjs/microservices";

import { TasksModule } from "./tasks.module";

async function bootstrap() {
  const app = await NestFactory.create(TasksModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: "tasks-service",
        brokers: [process.env.KAFKA_BROKER ?? "localhost:9092"],
      },
      consumer: {
        groupId: "tasks-consumer",
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

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

void bootstrap();
