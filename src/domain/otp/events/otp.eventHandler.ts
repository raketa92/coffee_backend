import { IOtpService } from "@/application/shared/ports/IOtpService";
import { OtpPurpose } from "@/core/constants";
import {
  OTPRequestedEvent,
} from "@/domain/user/events/otpRequest.event";
import { LoggerService } from "@/infrastructure/logger/logger";
import { RedisService } from "@/infrastructure/persistence/redis/redis.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OtpEventHandler {
  constructor(
    private readonly otpService: IOtpService,
    private readonly redisService: RedisService,
    private readonly logger: LoggerService
  ) {}

  async handleOtpRequested(event: OTPRequestedEvent): Promise<void> {
    this.logger.info(`OTP requested for phone: ${event.phone}`);
    const smsCode = await this.redisService.generateShortSmsCode();
    this.logger.info(`Generated OTP: ${smsCode}`);
    await this.otpService.create({
      otp: smsCode,
      phone: event.phone,
      purpose: event.purpose,
      payload: event.payload,
    });
    // Send SMS logic here
  }
}
