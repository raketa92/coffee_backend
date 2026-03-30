import {
  OtpResponseDto,
  otpResponseSchema,
  OtpRequestDto,
  otpRequestSchema,
  otpChangePhoneResponseSchema,
  OtpChangePhoneResponseDto,
  OtpChangePasswordResponseDto,
  otpChangePasswordResponseSchema,
} from "@/application/otp/usecases/dto";
import { ProcessInitialOtpResponseUseCase } from "@/application/otp/usecases/processInitialOtpResponse";
import { RequestOtpUseCase } from "@/application/otp/usecases/requestOtp";
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ProcessChangePhoneOtpResponseUseCase } from "@/application/otp/usecases/processChangePhoneOtpResponse";
import { ProcessChangePasswordOtpResponseUseCase } from "@/application/otp/usecases/processChangePasswordOtpResponse";
import { mapUseCaseCodeToHttp } from "@/core/ErrorMappers";

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
    const response = await this.processInitialOtpUseCase.execute(
      otpResponseSchema.parse(dto)
    );
    return response.fold(
          (err) => {
            const status = mapUseCaseCodeToHttp(err.code);
            throw new HttpException(err.message, status);
          },
          (ok) => ok
        );
  }

  @Post("/change-phone/:userGuid")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async handleChangePhoneOtpResponse(
    @Param("userGuid") userGuid: string,
    @Body() dto: OtpChangePhoneResponseDto
  ) {
    return await this.processChangePhoneOtpUseCase.execute(
      otpChangePhoneResponseSchema.parse({ ...dto, userGuid })
    );
  }

  @Post("/change-password/:userGuid")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async handleChangePasswordOtpResponse(
    @Param("userGuid") userGuid: string,
    @Body() dto: OtpChangePasswordResponseDto
  ) {
    return await this.processChangePasswordOtpUseCase.execute(
      otpChangePasswordResponseSchema.parse({ ...dto, userGuid })
    );
  }

  @Post("/request")
  @HttpCode(200)
  async otpRequest(@Body() dto: OtpRequestDto) {
    return await this.requestOtpUseCase.execute(otpRequestSchema.parse(dto));
  }
}
