import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCase } from "@/core/UseCase";
import {
  UseCaseCommonErrorMessage,
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception";
import { OtpRequestDto } from "./dto";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IOtpService } from "@/application/shared/ports/IOtpService";
import { UseCaseErrorMessage } from "../exception";
import { UserTokenResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { IAuthService } from "@/application/shared/ports/IAuthService";

export interface OtpResponse extends UserTokenResponseDto {
  message: string;
}

@Injectable()
export class ProcessOtpResponseUseCase
  implements UseCase<OtpRequestDto, { message: string }>
{
  constructor(
    private readonly userService: IUserService,
    private readonly otpService: IOtpService,
    private readonly authService: IAuthService
  ) {}

  public async execute(request: OtpRequestDto): Promise<OtpResponse> {
    try {
      const existingUser = await this.userService.findOne({
        guid: request.userGuid,
      });
      if (!existingUser) {
        throw new NotFoundException({
          message: UseCaseCommonErrorMessage.user_not_found,
        });
      }

      const otp = await this.otpService.findOne({
        otp: request.otp,
        phone: existingUser.phone,
      });
      if (!otp) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.wrong_otp,
        });
      }
      const user = await this.userService.processOtp(otp, existingUser);
      await this.userService.save(user);
      await this.otpService.delete(otp.guid.toValue());

      const payload = { sub: user.guid.toValue(), phone: user.phone };
      const accessToken = this.authService.generateAccessToken(payload);
      const refreshToken = this.authService.generateRefreshToken(payload);
      user.setRefreshToken(refreshToken);
      await this.userService.save(user);

      return {
        message: "OTP verified successfully",
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      throw new UseCaseError({
        code: error.code || UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.process_otp_error,
      });
    }
  }
}
