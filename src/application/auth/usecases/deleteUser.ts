import { UseCase } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "../exception";
import { UserService } from "@/domain/user/user.service";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { ResponseMessages } from "@/core/constants";

@Injectable()
export class DeleteUserUseCase implements UseCase<string, string> {
  constructor(private readonly userService: UserService) {}

  public async execute(userGuid: string): Promise<string> {
    try {
      const user = await this.userService.findOne({ guid: userGuid });
      if (!user) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }

      const userDeleted = await this.userService.delete(userGuid);
      if (!userDeleted) {
        throw ResponseMessages.userDeleteFail;
      }
      return ResponseMessages.userDeleteSuccess;
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.delete_user_error,
      });
    }
  }
}
