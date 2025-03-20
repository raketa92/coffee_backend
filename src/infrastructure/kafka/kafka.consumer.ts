import { AppEvents } from "@/core/constants";
import {
  ChangePhoneOtpRequestedEvent,
  OTPRequestedEvent,
} from "@/domain/user/events/otpRequest.event";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LoggerService } from "../logger/logger";

@Controller()
export class KafkaConsumer {
  constructor(private readonly logger: LoggerService) {}
  @MessagePattern(AppEvents.otpRequested)
  async handleOtpRequested(@Payload() event: OTPRequestedEvent): Promise<void> {
    this.logger.info(
      `OTP requested for phone: ${event.phone}, purpose: ${event.purpose}`
    );
  }

  @MessagePattern(AppEvents.changePhoneOtpRequested)
  async handleChangePhoneOtpRequested(
    @Payload() event: ChangePhoneOtpRequestedEvent
  ): Promise<void> {
    this.logger.info(`OTP requested to change phone: ${event.phone}`);
  }
}
