import { UseCase } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "../../auth/exception";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { IUserService } from "@/application/shared/ports/IUserService";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";

@Injectable()
export class RequestOtpUseCase
  implements UseCase<{ phone: string }, { message: string }>
{
  constructor(
    private readonly userService: IUserService,
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(request: {
    phone: string;
  }): Promise<{ message: string }> {
    try {
      const user = await this.userService.findOne({ phone: request.phone });
      if (!user) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }
      const otpEvent = new OTPRequestedEvent({
        phone: user.phone,
        purpose: OtpPurpose.userRegister,
      });
      await this.kafkaService.publishEvent<OTPRequestedEvent>(
        AppEvents.otpRequested,
        otpEvent
      );

      return { message: "OTP sent to your phone. Please verify your account." };
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.login_user_error,
      });
    }
  }
}
