import { IEmailSender } from "@/application/shared/ports/IEmailSender";
import { IEmailService } from "@/application/shared/ports/IEmailService";
import { EmailRequestedEvent } from "@/domain/user/events/emailRequest.event";
import { LoggerService } from "@/infrastructure/logger/logger";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailEventHandler {
  constructor(
    private readonly emailService: IEmailService,
    private readonly emailSender: IEmailSender,
    private readonly logger: LoggerService
  ) {}

  async handleEmailVerificationRequested(
    event: EmailRequestedEvent
  ): Promise<void> {
    this.logger.info(`Email verification requested for email: ${event.email}`);
    await this.emailService.create({
      email: event.email,
      purpose: event.purpose,
      payload: event.payload,
    });

    const verifyUrl = `${process.env.PUBLIC_BASE_URL}/email/verify?token=${encodeURIComponent(event.payload)}`;
    await this.emailSender.send({
      to: event.email,
      content: {
        subject: "Confirm your new email",
        html: `
          <p>We received a request to change your email.</p>
          <p>Please confirm by clicking the link below:</p>
          <p><a href="${verifyUrl}">Verify Email</a></p>
          <p>If you didn’t request this, you can ignore this email.</p>
        `,
        text: `Confirm your new email: ${verifyUrl}`,
      },
    });
  }
}
