import { DatabaseModule } from "@/infrastructure/persistence/kysely/database.module";
import { Module } from "@nestjs/common";
import { IUserService } from "../shared/ports/IUserService";
import { UserService } from "@/domain/user/user.service";
import { IAuthService } from "../shared/ports/IAuthService";
import { AuthServiceImpl } from "@/infrastructure/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { EnvModule } from "@/infrastructure/env";
import { KafkaModule } from "@/infrastructure/kafka/kafka.module";
import { ProcessChangeEmailResponseUseCase } from "./usecases/processChangeEmailResponse";
import { EmailEventHandler } from "@/domain/email/events/email.eventHandler";
import { IEmailService } from "../shared/ports/IEmailService";
import { EmailService } from "@/domain/email/email.service";
import { IEmailSender } from "../shared/ports/IEmailSender";
import { NodemailerEmailSender } from "@/infrastructure/mailer/mailer.service";
@Module({
  imports: [DatabaseModule, EnvModule, KafkaModule],
  providers: [
    JwtService,
    ProcessChangeEmailResponseUseCase,
    EmailEventHandler,
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IAuthService,
      useClass: AuthServiceImpl,
    },
    {
      provide: IEmailService,
      useClass: EmailService,
    },
    {
      provide: IEmailSender,
      useClass: NodemailerEmailSender,
    },
  ],
  exports: [ProcessChangeEmailResponseUseCase, EmailEventHandler],
})
export class EmailVerificationModule {}
