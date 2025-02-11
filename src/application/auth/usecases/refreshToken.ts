import { UseCase } from "@/core/UseCase";
import { UserTokenResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "../../auth/exception";
import { UserTokenDto } from "@/infrastructure/http/dto/user/logoutUserDto";
import { IAuthService } from "../ports/IAuthService";
import { UserService } from "@/domain/user/user.service";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";

@Injectable()
export class RefreshTokenUseCase
  implements UseCase<UserTokenDto, UserTokenResponseDto>
{
  constructor(
    @Inject(IAuthService)
    private readonly authService: IAuthService,
    private readonly userservice: UserService
  ) {}

  public async execute(request: UserTokenDto): Promise<UserTokenResponseDto> {
    try {
      const user = await this.userservice.findUserByRefreshToken(
        request.refreshToken
      );

      if (!user) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }
      const newTokens = await this.authService.refreshToken(
        request.refreshToken
      );
      user.setRefreshToken(newTokens.refreshToken);
      this.userservice.save(user);

      return newTokens;
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.refresh_token_error,
      });
    }
  }
}
