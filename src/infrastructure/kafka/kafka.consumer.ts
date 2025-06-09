import { AppEvents, OtpPurpose } from "@/core/constants";
import {
  ChangePhoneOtpRequestedEvent,
  OTPRequestedEvent,
} from "@/domain/user/events/otpRequest.event";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LoggerService } from "../logger/logger";
import {
  OtpRequestDto,
  otpRequestSchema,
  OtpResponseDto,
  otpResponseSchema,
} from "@/application/otp/usecases/dto";
import { ProcessOtpResponseUseCase } from "@/application/otp/usecases/processOtpResponse";
import { IOtpService } from "@/application/shared/ports/IOtpService";
import { RedisService } from "../persistence/redis/redis.service";
import { RequestOtpUseCase } from "@/application/otp/usecases/requestOtp";

@Controller()
export class KafkaConsumer {
  constructor(
    private readonly logger: LoggerService,
    private readonly processOtpResponseUseCase: ProcessOtpResponseUseCase,
    private readonly requestOtpUseCase: RequestOtpUseCase,
    private readonly otpService: IOtpService,
    private readonly redisService: RedisService
  ) {}
  @MessagePattern(AppEvents.otpRequested)
  async handleOtpRequested(@Payload() event: OTPRequestedEvent): Promise<void> {
    this.logger.info(
      `OTP requested for phone: ${event.phone}, purpose: ${event.purpose}`
    );

    const smsCode = await this.redisService.generateShortSmsCode();
    this.logger.info(`Generated OTP: ${smsCode}`);

    await this.otpService.create({
      otp: smsCode,
      phone: event.phone,
      purpose: event.purpose,
      payload: event.payload,
    });
    // send sms
  }

  @MessagePattern(AppEvents.changePhoneOtpRequested)
  async handleChangePhoneOtpRequested(
    @Payload() event: ChangePhoneOtpRequestedEvent
  ): Promise<void> {
    this.logger.info(`OTP requested to change phone: ${event.phone}`);
    // generate sms code
    const smsCode = await this.redisService.generateShortSmsCode();
    this.logger.info(`Generated OTP: ${smsCode}`);

    await this.otpService.create({
      otp: smsCode,
      phone: event.phone,
      purpose: OtpPurpose.userChangePhone,
    });
    // send sms
  }

  /* 
    users send otp data to this endpoint
  */
  @Post("/otp-response")
  @HttpCode(200)
  async handleOtpResponse(@Body() otpRequestDto: OtpResponseDto) {
    this.logger.info("OTP response received");
    const body = otpResponseSchema.parse(otpRequestDto);
    const response = await this.processOtpResponseUseCase.execute(body);
    return response;
  }

  @Post("/otp-request")
  @HttpCode(201)
  async otpRequest(@Body() otpRequestDto: OtpRequestDto) {
    const body = otpRequestSchema.parse(otpRequestDto);
    const response = await this.requestOtpUseCase.execute(body);
    return response;
  }
}
