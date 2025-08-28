import { AppEvents } from "@/core/constants";
import {
  OTPRequestedEvent,
} from "@/domain/user/events/otpRequest.event";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { OtpEventHandler } from "@/domain/otp/events/otp.eventHandler";

@Controller()
export class KafkaConsumer {
  constructor(private readonly otpEventHandler: OtpEventHandler) {}
  @MessagePattern([AppEvents.otpRequested, AppEvents.changePhoneOtpRequested, AppEvents.changePasswordOtpRequested])
  async handleOtpRequested(@Payload() event: OTPRequestedEvent): Promise<void> {
    await this.otpEventHandler.handleOtpRequested(event);
  }
}
