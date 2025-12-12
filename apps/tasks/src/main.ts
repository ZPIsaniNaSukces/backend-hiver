import { PrismaExceptionFilter } from "@app/prisma";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import type { MicroserviceOptions } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { TasksModule } from "./tasks.module";

async function bootstrap() {
  const app = await NestFactory.create(TasksModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: "tasks-service",
        brokers: [process.env.KAFKA_BROKER ?? "kafka:9092"],
      },
      consumer: {
        groupId: "tasks-service-consumer",
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
    .setTitle("Tasks Service API")
    .setDescription(
      "API documentation for the Tasks microservice - manages tasks and assignments",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Tasks", "Task management endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003);
}

void bootstrap();
