import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCase, UseCaseEither } from "@/core/UseCase";
import {
  UseCaseCommonErrorMessage,
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception/useCaseError";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IEmailVerificationService } from "@/application/shared/ports/IEmailService";
import { UseCaseErrorMessage } from "./exception";
import { OtpChangeEmailResponseDto } from "./dto";
import { Either, left, right } from "@/core/Either";

@Injectable()
export class ProcessChangeEmailResponseUseCase
  implements
    UseCaseEither<OtpChangeEmailResponseDto, { message: string }, UseCaseError>
{
  constructor(
    private readonly userService: IUserService,
    private readonly emailVerificationService: IEmailVerificationService
  ) {}

  public async execute(
    request: OtpChangeEmailResponseDto
  ): Promise<Either<UseCaseError, { message: string }>> {
    const { email, otp, userGuid } = request;
    const user = await this.userService.findOne({
      guid: userGuid,
    });
    return user.fold(
      (err) => Promise.resolve(left(err)),
      async (userOrNull) => {
        if (!userOrNull) {
          throw new UseCaseError({
            code: UseCaseErrorCode.NOT_FOUND,
            message: UseCaseErrorMessage.user_not_found,
          })
        }
        const record = await this.emailVerificationService.findOne({
          email,
          otp,
        });
        if (!record) {
          throw new NotFoundException({
            message: UseCaseErrorMessage.wrong_email,
          });
        }
        if (record.expiresAt && record.expiresAt < new Date()) {
          await this.emailVerificationService.delete(record.guid.toValue());
          throw new UseCaseError({
            code: UseCaseErrorCode.VALIDATION_ERROR,
            message: UseCaseErrorMessage.expired_link,
          });
        }

        const collision = await this.userService.findOne({ email });
        return collision.fold((err) => Promise.resolve(left(err)), async (collisionUser) => {
          if (collisionUser && collisionUser.guid.toString() !== userGuid) {
            await this.emailVerificationService.delete(record.guid.toValue());
            throw new UseCaseError({
              code: UseCaseErrorCode.VALIDATION_ERROR,
              message: UseCaseErrorMessage.email_already_in_use,
            });
          }

          userOrNull.changeEmail(email);
          await this.userService.save(userOrNull);
          await this.emailVerificationService.delete(record.guid.toValue());

          return right({ message: "Email verified successfully" });
        });        
      }
    );
  }
}
