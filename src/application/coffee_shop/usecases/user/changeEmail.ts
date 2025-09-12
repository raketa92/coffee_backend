import { UseCase } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ChangeEmailDto } from "./dto";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { UseCaseErrorMessage } from "../../exception";
import { AppEvents, EmailVerificationPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { EmailVerificationRequestedEvent } from "@/domain/user/events/emailRequest.event";

@Injectable()
export class ChangeEmailUseCase
  implements UseCase<ChangeEmailDto, { message: string }>
{
  constructor(
    private readonly userService: IUserService,
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(request: ChangeEmailDto): Promise<{ message: string }> {
    try {
      const existingUser = await this.userService.findOne({
        guid: request.userGuid,
      });
      if (!existingUser) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }

      const emailTaken = await this.userService.findOne({
        email: request.email,
      });
      if (emailTaken) {
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
      return { message: `Verification email sent to ${request.email}` };
    } catch (error: any) {
      throw new UseCaseError({
        code: error.code || UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.email_change_error,
      });
    }
  }
}
