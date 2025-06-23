import {
  OtpResponseDto,
  otpResponseSchema,
  OtpRequestDto,
  otpRequestSchema,
} from "@/application/otp/usecases/dto";
import { ProcessOtpResponseUseCase } from "@/application/otp/usecases/processOtpResponse";
import { RequestOtpUseCase } from "@/application/otp/usecases/requestOtp";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";

@Controller("otp")
export class OtpController {
  constructor(
    private readonly processOtpUseCase: ProcessOtpResponseUseCase,
    private readonly requestOtpUseCase: RequestOtpUseCase
  ) {}

  /* 
    users send otp data to this endpoint
  */
  @Post("/response")
  @HttpCode(200)
  async handleOtpResponse(@Body() dto: OtpResponseDto) {
    return await this.processOtpUseCase.execute(otpResponseSchema.parse(dto));
  }

  @Post("/request")
  @HttpCode(200)
  async otpRequest(@Body() dto: OtpRequestDto) {
    return await this.requestOtpUseCase.execute(otpRequestSchema.parse(dto));
  }
}
