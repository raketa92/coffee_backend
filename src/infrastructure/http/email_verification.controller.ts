import { Body, Controller, HttpCode, Param, Post } from "@nestjs/common";
import { ProcessChangeEmailResponseUseCase } from "@/application/email_verification/usecases/processChangeEmailResponse";
import {
  OtpChangeEmailResponseDto,
  otpChangeEmailResponseSchema,
} from "@/application/email_verification/usecases/dto";

@Controller("email")
export class EmailVerificationController {
  constructor(
    private readonly processChangeEmailUseCase: ProcessChangeEmailResponseUseCase
  ) {}

  @Post("/verify/:userGuid")
  @HttpCode(200)
  async handleChangeEmailResponse(
    @Param("userGuid") userGuid: string,
    @Body() dto: OtpChangeEmailResponseDto
  ) {
    return await this.processChangeEmailUseCase.execute(
      otpChangeEmailResponseSchema.parse({ ...dto, userGuid })
    );
  }
}
