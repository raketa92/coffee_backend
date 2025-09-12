import { IEmailSender } from "@/application/shared/ports/IEmailSender";
import { IEmailVerificationService } from "@/application/shared/ports/IEmailService";
import { EmailVerificationRequestedEvent } from "@/domain/user/events/emailRequest.event";
import { LoggerService } from "@/infrastructure/logger/logger";
import { RedisService } from "@/infrastructure/persistence/redis/redis.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailVerificationEventHandler {
  constructor(
    private readonly emailService: IEmailVerificationService,
    private readonly emailSender: IEmailSender,
    private readonly redisService: RedisService,
    private readonly logger: LoggerService
  ) {}

  async handleEmailVerificationRequested(
    event: EmailVerificationRequestedEvent
  ): Promise<void> {
    this.logger.info(`Email verification requested for email: ${event.email}`);
    const code = await this.redisService.generateEmailCode();
    await this.emailService.create({
      otp: code,
      email: event.email,
      purpose: event.purpose,
    });

    try {
      await this.emailSender.send({
        to: event.email,
        content: {
          subject: "Confirm your new email",
          html: `
          <p>We received a request to change your email.</p>
          <p>Please confirm by entering code below:</p>
          <p>Code: ${code}</p>
          <p>If you didn’t request this, you can ignore this email.</p>
        `,
          text: `Confirm your new email`,
        },
      });
    } catch (error) {
      this.logger.error(`Email verification requested error: ${error}`);
    }
  }
}
