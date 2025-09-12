import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCase } from "@/core/UseCase";
import {
  UseCaseCommonErrorMessage,
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IEmailVerificationService } from "@/application/shared/ports/IEmailService";
import { UseCaseErrorMessage } from "./exception";
import { OtpChangeEmailResponseDto } from "./dto";

@Injectable()
export class ProcessChangeEmailResponseUseCase
  implements UseCase<OtpChangeEmailResponseDto, { message: string }>
{
  constructor(
    private readonly userService: IUserService,
    private readonly emailVerificationService: IEmailVerificationService
  ) {}

  public async execute(
    request: OtpChangeEmailResponseDto
  ): Promise<{ message: string }> {
    try {
      const { email, otp, userGuid } = request;
      const user = await this.userService.findOne({
        guid: userGuid,
      });
      if (!user) {
        throw new NotFoundException({
          message: UseCaseCommonErrorMessage.user_not_found,
        });
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
      if (collision && collision.guid.toString() !== userGuid) {
        await this.emailVerificationService.delete(record.guid.toValue());
        throw new UseCaseError({
          code: UseCaseErrorCode.VALIDATION_ERROR,
          message: UseCaseErrorMessage.email_already_in_use,
        });
      }

      user.changeEmail(email);
      await this.userService.save(user);
      await this.emailVerificationService.delete(record.guid.toValue());

      return { message: "Email verified successfully" };
    } catch (error: any) {
      throw new UseCaseError({
        code: error.code || UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.process_email_failed,
      });
    }
  }
}
