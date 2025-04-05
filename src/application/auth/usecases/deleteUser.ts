import { UseCase } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "../exception";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { ResponseMessages } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";

@Injectable()
export class DeleteUserUseCase implements UseCase<string, string> {
  constructor(private readonly userService: IUserService) {}

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
