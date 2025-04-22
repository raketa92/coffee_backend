import { UseCase } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ChangePhoneDto } from "./dto";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { UseCaseErrorMessage } from "../../exception";
import { ChangePhoneOtpRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { AppEvents } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";

@Injectable()
export class ChangePhoneUseCase
  implements UseCase<ChangePhoneDto, { message: string }>
{
  constructor(
    private readonly userService: IUserService,
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(request: ChangePhoneDto): Promise<{ message: string }> {
    try {
      const existingUser = await this.userService.findOne({
        guid: request.userGuid,
      });
      if (!existingUser) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }

      const otpEvent = new ChangePhoneOtpRequestedEvent({
        phone: request.phone,
        payload: { userGuid: request.userGuid },
      });
      await this.kafkaService.publishEvent<ChangePhoneOtpRequestedEvent>(
        AppEvents.changePhoneOtpRequested,
        otpEvent
      );
      return { message: "Otp sent to change phone number" };
    } catch (error: any) {
      throw new UseCaseError({
        code: error.code || UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.phone_change_error,
      });
    }
  }
}
