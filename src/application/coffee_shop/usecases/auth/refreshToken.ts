import { UseCase } from "@/core/UseCase";
import { UserTokenResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "../../exception";
import { AuthService } from "@/infrastructure/auth/auth.service";
import { UserTokenDto } from "@/infrastructure/http/dto/user/logoutUserDto";

@Injectable()
export class RefreshTokenUseCase
  implements UseCase<UserTokenDto, UserTokenResponseDto>
{
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  public async execute(request: UserTokenDto): Promise<UserTokenResponseDto> {
    try {
      const newTokens = await this.authService.refreshToken(
        request.refreshToken
      );

      return newTokens;
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.refresh_token_error,
      });
    }
  }
}
