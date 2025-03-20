import { UseCase } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ChangePhoneDto } from "./dto";
import { KafkaService } from "@/infrastructure/kafka/kafka.service";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { UseCaseErrorMessage } from "../../exception";
import { UserService } from "@/domain/user/user.service";
import { ChangePhoneOtpRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { AppEvents } from "@/core/constants";

@Injectable()
export class ChangePhoneUseCase
  implements UseCase<ChangePhoneDto, { message: string }>
{
  constructor(
    private readonly userService: UserService,
    private readonly kafkaService: KafkaService
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
        message: error.message || UseCaseErrorMessage.profile_update_error,
      });
    }
  }
}
