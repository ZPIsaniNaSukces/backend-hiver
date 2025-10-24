import { PrismaExceptionFilter } from "@app/prisma";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import type { MicroserviceOptions } from "@nestjs/microservices";

import { LeaveRequestsAppModule } from "./leave-requests-app.module";

async function bootstrap() {
  const app = await NestFactory.create(LeaveRequestsAppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"],
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
  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
