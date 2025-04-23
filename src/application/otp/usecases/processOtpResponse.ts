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

@Injectable()
export class ProcessOtpResponseUseCase
  implements UseCase<OtpRequestDto, { message: string }>
{
  constructor(
    private readonly userService: IUserService,
    private readonly otpService: IOtpService
  ) {}

  public async execute(request: OtpRequestDto): Promise<{ message: string }> {
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

      return { message: "OTP verified successfully" };
    } catch (error: any) {
      throw new UseCaseError({
        code: error.code || UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.process_otp_error,
      });
    }
  }
}
