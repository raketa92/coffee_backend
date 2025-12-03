import { UseCase, UseCaseEither } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ChangeEmailDto } from "./dto";
import {
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception/useCaseError";
import { UseCaseErrorMessage } from "../../exception";
import { AppEvents, EmailVerificationPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { EmailVerificationRequestedEvent } from "@/domain/user/events/emailRequest.event";
import { Either, flatMap, isLeft, isRight, left, right } from "@/core/Either";

@Injectable()
export class ChangeEmailUseCase
  implements UseCaseEither<ChangeEmailDto, { message: string }, UseCaseError>
{
  constructor(
    private readonly userService: IUserService,
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(
    request: ChangeEmailDto
  ): Promise<Either<UseCaseError, { message: string }>> {
    const existingUser = await this.userService.findOne({
      guid: request.userGuid,
    });

    return existingUser.fold(
      (err) => Promise.resolve(left(err)),
      async (userOrNull) => {
        if (!userOrNull) {
          throw new UseCaseError({
            code: UseCaseErrorCode.NOT_FOUND,
            message: UseCaseErrorMessage.user_not_found,
          });
        }
        const foundE = await this.userService.findOne({
          email: request.email,
        });
        if (isLeft(foundE)) return foundE;

        const isTaken = foundE.fold(
          () => false,
          (u) => !!u
        );

        if (isTaken) {
          throw new UseCaseError({
            code: UseCaseErrorCode.VALIDATION_ERROR,
            message: UseCaseErrorMessage.email_already_in_use,
          });
        }

        const emailEvent = new EmailVerificationRequestedEvent({
          email: request.email,
          purpose: EmailVerificationPurpose.userChangeEmail,
        });
        await this.kafkaService.publishEvent<EmailVerificationRequestedEvent>(
          AppEvents.changeEmailRequested,
          emailEvent
        );
        return right({
          message: `Verification email sent to ${request.email}`,
        });
      }
    );
  }
}
