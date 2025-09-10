import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UseCase } from "@/core/UseCase";
import {
  UseCaseCommonErrorMessage,
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { EmailVerificationPurpose } from "@/core/constants";
import { IEmailService } from "@/application/shared/ports/IEmailService";
import { UseCaseErrorMessage } from "./exception";

@Injectable()
export class ProcessChangeEmailResponseUseCase
  implements UseCase<string, { message: string }>
{
  constructor(
    private readonly userService: IUserService,
    private readonly emailService: IEmailService,
    private readonly authService: IAuthService
  ) {}

  public async execute(token: string): Promise<{ message: string }> {
    try {
      const {
        sub: userGuid,
        purpose,
        newEmail,
      } = await this.authService.verifyEmailToken(token);

      if (purpose !== EmailVerificationPurpose.userChangeEmail)
        throw new BadRequestException("Invalid purpose");

      const user = await this.userService.findOne({
        guid: userGuid,
      });
      if (!user) {
        throw new NotFoundException({
          message: UseCaseCommonErrorMessage.user_not_found,
        });
      }

      const record = await this.emailService.findOne({
        email: newEmail,
      });
      if (!record) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.wrong_email,
        });
      }
      if (record.expiresAt && record.expiresAt < new Date()) {
        await this.emailService.delete(record.guid.toValue());
        throw new UseCaseError({
          code: UseCaseErrorCode.VALIDATION_ERROR,
          message: UseCaseErrorMessage.expired_link,
        });
      }

      const collision = await this.userService.findOne({ email: newEmail });
      if (collision && collision.guid.toString() !== userGuid) {
        throw new UseCaseError({
          code: UseCaseErrorCode.VALIDATION_ERROR,
          message: UseCaseErrorMessage.email_already_in_use,
        });
      }

      user.changeEmail(newEmail);
      await this.userService.save(user);
      await this.emailService.delete(record.guid.toValue());

      return { message: "Email verified successfully" };
    } catch (error: any) {
      throw new UseCaseError({
        code: error.code || UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.process_email_failed,
      });
    }
  }
}
