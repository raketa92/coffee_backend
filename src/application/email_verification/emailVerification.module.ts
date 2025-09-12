import { DatabaseModule } from "@/infrastructure/persistence/kysely/database.module";
import { Module } from "@nestjs/common";
import { IUserService } from "../shared/ports/IUserService";
import { UserService } from "@/domain/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { EnvModule } from "@/infrastructure/env";
// import { KafkaModule } from "@/infrastructure/kafka/kafka.module";
import { ProcessChangeEmailResponseUseCase } from "./usecases/processChangeEmailResponse";
import { EmailVerificationEventHandler } from "@/domain/email_verification/events/email_verification.eventHandler";
import { IEmailVerificationService } from "../shared/ports/IEmailService";
import { EmailVerificationService } from "@/domain/email_verification/email_verification.service";
import { IEmailSender } from "../shared/ports/IEmailSender";
import { NodemailerEmailSender } from "@/infrastructure/mailer/mailer.service";
import { RedisService } from "@/infrastructure/persistence/redis/redis.service";
@Module({
  imports: [DatabaseModule, EnvModule],
  providers: [
    JwtService,
    RedisService,
    ProcessChangeEmailResponseUseCase,
    EmailVerificationEventHandler,
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IEmailVerificationService,
      useClass: EmailVerificationService,
    },
    {
      provide: IEmailSender,
      useClass: NodemailerEmailSender,
    },
  ],
  exports: [ProcessChangeEmailResponseUseCase, EmailVerificationEventHandler],
})
export class EmailVerificationModule {}
