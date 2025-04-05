import { AppEvents } from "@/core/constants";
import {
  ChangePhoneOtpRequestedEvent,
  OTPRequestedEvent,
} from "@/domain/user/events/otpRequest.event";
import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LoggerService } from "../logger/logger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  OtpRequestDto,
  otpRequestSchema,
} from "@/application/otp/usecases/dto";
import { ProcessOtpResponseUseCase } from "@/application/otp/usecases/processOtpResponse";

@Controller()
export class KafkaConsumer {
  constructor(
    private readonly logger: LoggerService,
    private readonly processOtpResponseUseCase: ProcessOtpResponseUseCase
  ) {}
  @MessagePattern(AppEvents.otpRequested)
  async handleOtpRequested(@Payload() event: OTPRequestedEvent): Promise<void> {
    this.logger.info(
      `OTP requested for phone: ${event.phone}, purpose: ${event.purpose}`
    );
    // create otp record
    // send sms
  }

  @MessagePattern(AppEvents.changePhoneOtpRequested)
  async handleChangePhoneOtpRequested(
    @Payload() event: ChangePhoneOtpRequestedEvent
  ): Promise<void> {
    this.logger.info(`OTP requested to change phone: ${event.phone}`);
    // create otp record
    // send sms
  }

  @Post("/otp-response")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async handleOtpResponse(@Body() otpRequestDto: OtpRequestDto) {
    this.logger.info("OTP response received");
    const body = otpRequestSchema.parse(otpRequestDto);
    const response = await this.processOtpResponseUseCase.execute(body);
    return response;
  }
}
