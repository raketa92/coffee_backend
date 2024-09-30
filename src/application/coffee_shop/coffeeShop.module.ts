import { Module } from "@nestjs/common";
import { RedisModule } from "../../infrastructure/persistence/redis/redis.module";
import { RedisService } from "../../infrastructure/persistence/redis/redis.service";
import { EnvModule } from "../../infrastructure/env";

@Module({
  imports: [RedisModule, EnvModule],
  providers: [RedisService],
})
export class CoffeeShopModule {}
