import { DatabaseModule } from "@/infrastructure/persistence/kysely/database.module";
import { Module } from "@nestjs/common";
import { IOtpService } from "../shared/ports/IOtpService";
import { OtpService } from "@/domain/otp/otp.service";
import { ProcessOtpResponseUseCase } from "./usecases/processOtpResponse";
import { IUserService } from "../shared/ports/IUserService";
import { UserService } from "@/domain/user/user.service";
import { IAuthService } from "../shared/ports/IAuthService";
import { AuthServiceImpl } from "@/infrastructure/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { EnvModule } from "@/infrastructure/env";
import { RequestOtpUseCase } from "./usecases/requestOtp";
import { OtpEventHandler } from "@/domain/otp/events/otp.eventHandler";
import { RedisService } from "@/infrastructure/persistence/redis/redis.service";
import { KafkaModule } from "@/infrastructure/kafka/kafka.module";
@Module({
  imports: [DatabaseModule, EnvModule, KafkaModule],
  providers: [
    JwtService,
    RedisService,
    ProcessOtpResponseUseCase,
    RequestOtpUseCase,
    OtpEventHandler,
    {
      provide: IOtpService,
      useClass: OtpService,
    },
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IAuthService,
      useClass: AuthServiceImpl,
    },
  ],
  exports: [ProcessOtpResponseUseCase, RequestOtpUseCase, OtpEventHandler],
})
export class OtpModule {}
