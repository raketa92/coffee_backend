import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { EnvService } from "@infrastructure/env";
import { ResponseInterceptor } from "@infrastructure/http/interceptor/response.interceptor";
import { ValidationPipe } from "@nestjs/common";
import { LoggerService } from "@infrastructure/logger/logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  const configService = app.get(EnvService);
  const port = configService.get("PORT");
  const loggerService = app.get(LoggerService);
  app.useGlobalInterceptors(new ResponseInterceptor(loggerService));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );
  await app.listen(port);
}
bootstrap();
