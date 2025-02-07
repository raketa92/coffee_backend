import { Global, Module } from "@nestjs/common";
import { Redis } from "ioredis";
import { EnvModule, EnvService } from "@infrastructure/env";

@Global()
@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: "REDIS_CLIENT",
      useFactory: (configService: EnvService) => {
        const redisHost = configService.get("REDIS_HOST");
        const redisPort = configService.get("REDIS_PORT");
        // const redisPassword = configService.get("REDIS_PASSWORD");
        return new Redis({
          host: redisHost,
          port: redisPort,
          // password: redisPassword,
        });
      },
      inject: [EnvService],
    },
  ],
  exports: ["REDIS_CLIENT"],
})
export class RedisModule {}
