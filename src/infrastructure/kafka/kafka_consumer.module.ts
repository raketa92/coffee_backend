import { Module } from "@nestjs/common";
import { MailerModule } from "../mailer/mailer.module";
import { DatabaseModule } from "../persistence/kysely/database.module";
import { LoggerModule } from "../logger/logger.module";
import { RedisModule } from "../persistence/redis/redis.module";
import { KafkaConsumer } from "./kafka.consumer";
import { IEmailVerificationService } from "@/application/shared/ports/IEmailService";
import { EmailVerificationService } from "@/domain/email_verification/email_verification.service";
import { OtpService } from "@/domain/otp/otp.service";
import { IOtpService } from "@/application/shared/ports/IOtpService";
import { OtpEventHandler } from "@/domain/otp/events/otp.eventHandler";
import { EmailVerificationEventHandler } from "@/domain/email_verification/events/email_verification.eventHandler";
import { RedisService } from "../persistence/redis/redis.service";

@Module({
  imports: [MailerModule, DatabaseModule, LoggerModule, RedisModule],
  controllers: [KafkaConsumer],
  providers: [
    { provide: IEmailVerificationService, useClass: EmailVerificationService },
    { provide: IOtpService, useClass: OtpService },
    RedisService,
    OtpEventHandler,
    EmailVerificationEventHandler,
  ],
})
export class KafkaConsumerModule {}
