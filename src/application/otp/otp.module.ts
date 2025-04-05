import { DatabaseModule } from "@/infrastructure/persistence/kysely/database.module";
import { Module } from "@nestjs/common";
import { IOtpService } from "../shared/ports/IOtpService";
import { OtpService } from "@/domain/otp/otp.service";
import { ProcessOtpResponseUseCase } from "./usecases/processOtpResponse";

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: IOtpService,
      useClass: OtpService,
    },
    ProcessOtpResponseUseCase,
  ],
  exports: [ProcessOtpResponseUseCase],
})
export class OtpModule {}
