import { Global, Module } from "@nestjs/common";
import { EnvModule } from "../env";
import { LoggerService } from "./logger";

@Global()
@Module({
  imports: [EnvModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
