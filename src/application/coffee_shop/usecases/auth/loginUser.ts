import { UseCase } from "@/core/UseCase";
import { UserTokenResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "../../exception";
import { IUserRepository } from "@/domain/user/user.repository";
import { LoginUserDto } from "@/infrastructure/http/dto/user/loginUserDto";
import { AuthService } from "@/infrastructure/auth/auth.service";

@Injectable()
export class LoginUserUseCase
  implements UseCase<LoginUserDto, UserTokenResponseDto>
{
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly authService: AuthService
  ) {}

  public async execute(request: LoginUserDto): Promise<UserTokenResponseDto> {
    try {
      const user = await this.authService.validateUser(
        request.phone,
        request.password
      );

      if (!user) {
        throw new UseCaseError({
          code: UseCaseErrorCode.BAD_REQUEST,
          message: UseCaseErrorMessage.wrong_password,
        });
      }

      const payload = { sub: user.guid.toValue(), phone: user.phone };
      const accessToken = this.authService.generateAccessToken(payload);
      const refreshToken = this.authService.generateRefreshToken(payload);
      user.setRefreshToken(refreshToken);
      await this.userRepository.save(user);

      return { accessToken, refreshToken };
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.login_user_error,
      });
    }
  }
}
