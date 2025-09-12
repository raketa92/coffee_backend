import { AppEvents } from "@/core/constants";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { OtpEventHandler } from "@/domain/otp/events/otp.eventHandler";
import { EmailVerificationEventHandler } from "@/domain/email_verification/events/email_verification.eventHandler";
import { EmailVerificationRequestedEvent } from "@/domain/user/events/emailRequest.event";

@Controller()
export class KafkaConsumer {
  constructor(
    private readonly otpEventHandler: OtpEventHandler,
    private readonly emailEventHandler: EmailVerificationEventHandler
  ) {}
  @MessagePattern([
    AppEvents.otpRequested,
    AppEvents.changePhoneOtpRequested,
    AppEvents.changePasswordOtpRequested,
  ])
  async handleOtpRequested(@Payload() event: OTPRequestedEvent): Promise<void> {
    await this.otpEventHandler.handleOtpRequested(event);
  }

  @MessagePattern(AppEvents.changeEmailRequested)
  async handleEmailRequested(
    @Payload() event: EmailVerificationRequestedEvent
  ): Promise<void> {
    await this.emailEventHandler.handleEmailVerificationRequested(event);
  }
}
