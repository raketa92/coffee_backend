import { UseCase } from "@/core/UseCase";
import {
  AuthResponseDto,
  UserTokenResponseDto,
} from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "../../exception";
import { LoginUserDto } from "@/infrastructure/http/dto/user/loginUserDto";
import { IAuthService } from "../../ports/IAuthService";
import { UserService } from "@/domain/user/user.service";

@Injectable()
export class LoginUserUseCase
  implements UseCase<LoginUserDto, UserTokenResponseDto>
{
  constructor(
    private readonly userService: UserService,
    private readonly authService: IAuthService
  ) {}

  public async execute(request: LoginUserDto): Promise<UserTokenResponseDto> {
    try {
      const user = await this.userService.findOne({ phone: request.phone });
      if (!user) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }
      const isValidPassword = await this.authService.validateUser({
        password: request.password,
        userPassword: user.password,
      });
      if (!isValidPassword) {
        throw new UseCaseError({
          code: UseCaseErrorCode.BAD_REQUEST,
          message: UseCaseErrorMessage.wrong_password,
        });
      }

      const payload = { sub: user.guid.toValue(), phone: user.phone };
      const accessToken = this.authService.generateAccessToken(payload);
      const refreshToken = this.authService.generateRefreshToken(payload);
      user.setRefreshToken(refreshToken);
      await this.userService.save(user);

      const userDetails: AuthResponseDto = {
        accessToken,
        refreshToken,
        user: {
          guid: user.guid.toValue(),
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          role: user.roles[0],
          isVerified: user.isVerified,
          isActive: user.isActive,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };

      return userDetails;
    } catch (error: any) {
      throw new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.login_user_error,
      });
    }
  }
}
