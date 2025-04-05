import { UseCase } from "@/core/UseCase";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "../../auth/exception";
import { UserTokenDto } from "@/infrastructure/http/dto/user/logoutUserDto";
import { ResponseMessages } from "@/core/constants";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { IUserService } from "@/application/shared/ports/IUserService";

@Injectable()
export class LogoutUserUseCase
  implements UseCase<UserTokenDto, { message: string }>
{
  constructor(private readonly userservice: IUserService) {}

  public async execute(request: UserTokenDto): Promise<{ message: string }> {
    try {
      const user = await this.userservice.findUserByRefreshToken(
        request.refreshToken
      );

      if (!user) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }

      user.removeRefreshToken();
      await this.userservice.save(user);

      return { message: ResponseMessages.success };
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.login_user_error,
      });
    }
  }
}
