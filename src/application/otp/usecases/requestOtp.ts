import { UseCase, UseCaseEither } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "../../auth/exception";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception/useCaseError";
import { IUserService } from "@/application/shared/ports/IUserService";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { Either, left, right } from "@/core/Either";

@Injectable()
export class RequestOtpUseCase
  implements
    UseCaseEither<{ phone: string }, { message: string }, UseCaseError>
{
  constructor(
    private readonly userService: IUserService,
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(request: {
    phone: string;
  }): Promise<Either<UseCaseError, { message: string }>> {
    const user = await this.userService.findOne({ phone: request.phone });
    return user.fold(
      (err) => Promise.resolve(left(err)),
      async (userOrNull) => {
        if (!userOrNull) {
          throw new UseCaseError({
            code: UseCaseErrorCode.NOT_FOUND,
            message: UseCaseErrorMessage.user_not_found,
          })
        }
        const otpEvent = new OTPRequestedEvent({
          phone: userOrNull.phone,
          purpose: OtpPurpose.userRegister,
        });
        await this.kafkaService.publishEvent<OTPRequestedEvent>(
          AppEvents.otpRequested,
          otpEvent
        );

        return right({
          message: "OTP sent to your phone. Please verify your account.",
        });
      }
    );
  }
}
