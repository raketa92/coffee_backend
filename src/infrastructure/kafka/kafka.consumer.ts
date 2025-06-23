import { AppEvents } from "@/core/constants";
import {
  ChangePhoneOtpRequestedEvent,
  OTPRequestedEvent,
} from "@/domain/user/events/otpRequest.event";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { OtpEventHandler } from "@/domain/otp/events/otp.eventHandler";

@Controller()
export class KafkaConsumer {
  constructor(private readonly otpEventHandler: OtpEventHandler) {}
  @MessagePattern(AppEvents.otpRequested)
  async handleOtpRequested(@Payload() event: OTPRequestedEvent): Promise<void> {
    await this.otpEventHandler.handleOtpRequested(event);
  }

  @MessagePattern(AppEvents.changePhoneOtpRequested)
  async handleChangePhoneOtpRequested(
    @Payload() event: ChangePhoneOtpRequestedEvent
  ): Promise<void> {
    await this.otpEventHandler.handleChangePhoneOtpRequested(event);
  }
}
