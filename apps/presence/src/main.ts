import { PrismaExceptionFilter } from "@app/prisma";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import type { MicroserviceOptions } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { PresenceAppModule } from "./presence-app.module";

async function bootstrap() {
  const app = await NestFactory.create(PresenceAppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: "presence-service",
        brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"],
      },
      consumer: {
        groupId: "presence-service-consumer",
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Presence Service API")
    .setDescription(
      "API documentation for the Presence microservice - manages check-ins, NFC tags, and attendance",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Check-in/Check-out", "Check-in and check-out endpoints")
    .addTag("NFC Tags", "NFC tag management endpoints")
    .addTag("Check-in User Info", "User info for check-in service")
    .addTag("Health", "Health check endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
