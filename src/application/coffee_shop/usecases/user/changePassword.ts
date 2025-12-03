import { UseCaseEither } from "@/core/UseCase";
import { Injectable } from "@nestjs/common";
import { ChangePasswordDto } from "./dto";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception/useCaseError";
import { UseCaseErrorMessage } from "../../exception";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { Either, left, right } from "@/core/Either";

@Injectable()
export class ChangePasswordUseCase
  implements
    UseCaseEither<ChangePasswordDto, { message: string }, UseCaseError>
{
  constructor(
    private readonly userService: IUserService,
    private readonly authService: IAuthService,
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(
    request: ChangePasswordDto
  ): Promise<Either<UseCaseError, { message: string }>> {
    const existingUser = await this.userService.findOne({
      guid: request.userGuid,
    });

    return existingUser.fold<
      Promise<Either<UseCaseError, { message: string }>>
    >(
      (err) => Promise.resolve(left(err)),
      async (userOrNull) => {
        if (!userOrNull) {
          throw new UseCaseError({
            code: UseCaseErrorCode.NOT_FOUND,
            message: UseCaseErrorMessage.user_not_found,
          })
        }
        const isPasswordValid = await this.authService.validateUser({
          password: request.oldPassword,
          userPassword: userOrNull.password,
        });

        if (!isPasswordValid) {
          throw new UseCaseError({
            code: UseCaseErrorCode.VALIDATION_ERROR,
            message: UseCaseErrorMessage.wrong_password,
          });
        }

        const hashedPassword = await this.authService.hashPassword(
          request.password
        );

        const otpEvent = new OTPRequestedEvent({
          phone: userOrNull.phone,
          payload: hashedPassword,
          purpose: OtpPurpose.userChangePassword,
        });
        await this.kafkaService.publishEvent<OTPRequestedEvent>(
          AppEvents.changePasswordOtpRequested,
          otpEvent
        );
        return right({ message: "Otp sent to change password" });
      }
    );
  }
}
