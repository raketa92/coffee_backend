import {
  OtpResponseDto,
  otpResponseSchema,
  OtpRequestDto,
  otpRequestSchema,
  otpChangePhoneResponseSchema,
  OtpChangePhoneResponseDto,
} from "@/application/otp/usecases/dto";
import { ProcessInitialOtpResponseUseCase } from "@/application/otp/usecases/processInitialOtpResponse";
import { RequestOtpUseCase } from "@/application/otp/usecases/requestOtp";
import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ProcessChangePhoneOtpResponseUseCase } from "@/application/otp/usecases/processChangePhoneOtpResponse";
import { ProcessChangePasswordOtpResponseUseCase } from "@/application/otp/usecases/processChangePasswordOtpResponse";

@Controller("otp")
export class OtpController {
  constructor(
    private readonly processInitialOtpUseCase: ProcessInitialOtpResponseUseCase,
    private readonly processChangePhoneOtpUseCase: ProcessChangePhoneOtpResponseUseCase,
    private readonly processChangePasswordOtpUseCase: ProcessChangePasswordOtpResponseUseCase,
    private readonly requestOtpUseCase: RequestOtpUseCase
  ) {}

  @Post("/initial")
  @HttpCode(200)
  async handleInitialOtpResponse(@Body() dto: OtpResponseDto) {
    return await this.processInitialOtpUseCase.execute(otpResponseSchema.parse(dto));
  }

  @Post("/change-phone")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async handleChangePhoneOtpResponse(@Body() dto: OtpChangePhoneResponseDto) {
    return await this.processChangePhoneOtpUseCase.execute(otpChangePhoneResponseSchema.parse(dto));
  }

  @Post("/change-password")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async handleChangePasswordOtpResponse(@Body() dto: OtpResponseDto) {
    return await this.processChangePasswordOtpUseCase.execute(otpResponseSchema.parse(dto));
  }

  @Post("/request")
  @HttpCode(200)
  async otpRequest(@Body() dto: OtpRequestDto) {
    return await this.requestOtpUseCase.execute(otpRequestSchema.parse(dto));
  }
}
