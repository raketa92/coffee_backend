import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { EnvService } from "./infrastructure/env";
import { ResponseInterceptor } from "./infrastructure/http/interceptor/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  const configService = app.get(EnvService);
  const port = configService.get("PORT");
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.listen(port);
}
bootstrap();
