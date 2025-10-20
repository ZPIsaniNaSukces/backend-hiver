import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { ApiGatewayModule } from "./api-gateway.module";

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

  app.enableCors();
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
