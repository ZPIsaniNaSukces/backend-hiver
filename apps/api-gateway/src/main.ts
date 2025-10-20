import { PrismaExceptionFilter } from "@app/prisma";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { ApiGatewayModule } from "./api-gateway.module";
import { RpcExceptionFilter } from "./filters/rpc-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new RpcExceptionFilter(), new PrismaExceptionFilter());

  app.enableCors();
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
