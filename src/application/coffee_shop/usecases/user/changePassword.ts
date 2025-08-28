import { UseCase } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ChangePasswordDto } from "./dto";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { UseCaseErrorMessage } from "../../exception";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { IAuthService } from "@/application/shared/ports/IAuthService";

@Injectable()
export class ChangePasswordUseCase
  implements UseCase<ChangePasswordDto, { message: string }>
{
  constructor(
    private readonly userService: IUserService,
    private readonly authService: IAuthService,
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(
    request: ChangePasswordDto
  ): Promise<{ message: string }> {
    try {
      const existingUser = await this.userService.findOne({
        guid: request.userGuid,
      });
      if (!existingUser) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }

      const isValidPassword = await this.authService.validateUser({
        password: request.oldPassword,
        userPassword: existingUser.password,
      });
      if (!isValidPassword) {
        throw new UseCaseError({
          code: UseCaseErrorCode.VALIDATION_ERROR,
          message: UseCaseErrorMessage.wrong_password,
        });
      }

      const hashedPassword = await this.authService.hashPassword(
        request.password
      );

      const otpEvent = new OTPRequestedEvent({
        phone: existingUser.phone,
        payload: hashedPassword,
        purpose: OtpPurpose.userChangePassword,
      });
      await this.kafkaService.publishEvent<OTPRequestedEvent>(
        AppEvents.changePasswordOtpRequested,
        otpEvent
      );
      return { message: "Otp sent to change password" };
    } catch (error: any) {
      throw new UseCaseError({
        code: error.code || UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.password_change_error,
      });
    }
  }
}
