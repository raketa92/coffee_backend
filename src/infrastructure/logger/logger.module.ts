import { Global, Module } from "@nestjs/common";
import { EnvModule } from "@infrastructure/env";
import { LoggerService } from "./logger";

@Global()
@Module({
  imports: [EnvModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
