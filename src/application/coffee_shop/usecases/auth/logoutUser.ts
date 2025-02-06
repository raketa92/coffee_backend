import { UseCase } from "@/core/UseCase";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "../../exception";
import { IUserRepository } from "@/domain/user/user.repository";
import { UserTokenDto } from "@/infrastructure/http/dto/user/logoutUserDto";
import { UserService } from "@/domain/user/user.service";
import { ResponseMessages } from "@/core/constants";

@Injectable()
export class LogoutUserUseCase
  implements UseCase<UserTokenDto, { message: string }>
{
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly userservice: UserService
  ) {}

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
      await this.userRepository.save(user);

      return { message: ResponseMessages.success };
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.login_user_error,
      });
    }
  }
}
