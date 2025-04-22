import { DatabaseModule } from "@/infrastructure/persistence/kysely/database.module";
import { Module } from "@nestjs/common";
import { IOtpService } from "../shared/ports/IOtpService";
import { OtpService } from "@/domain/otp/otp.service";
import { ProcessOtpResponseUseCase } from "./usecases/processOtpResponse";
import { IUserService } from "../shared/ports/IUserService";
import { UserService } from "@/domain/user/user.service";
@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: IOtpService,
      useClass: OtpService,
    },
    {
      provide: IUserService,
      useClass: UserService,
    },
    ProcessOtpResponseUseCase,
  ],
  exports: [ProcessOtpResponseUseCase],
})
export class OtpModule {}
