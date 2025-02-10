import { UseCase } from "@/core/UseCase";
import { CreateUserDto } from "@/infrastructure/http/dto/user/createUserDto";
import {
  AuthResponseDto,
  UserTokenResponseDto,
} from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Injectable } from "@nestjs/common";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "../../exception";
import { User } from "@/domain/user/user.entity";
import { UserService } from "@/domain/user/user.service";
import { Roles } from "@/core/constants/roles";
import { IAuthService } from "../../ports/IAuthService";

@Injectable()
export class RegisterUserUseCase
  implements UseCase<CreateUserDto, UserTokenResponseDto>
{
  constructor(
    private readonly userService: UserService,
    private readonly authService: IAuthService
  ) {}

  public async execute(request: CreateUserDto): Promise<AuthResponseDto> {
    try {
      const userExist = await this.userService.findOne({
        phone: request.phone,
      });
      if (userExist) {
        throw new UseCaseError({
          code: UseCaseErrorCode.BAD_REQUEST,
          message: UseCaseErrorMessage.user_already_exists,
        });
      }
      const hashedPassword = await this.authService.hashPassword(
        request.password
      );
      const user = new User({
        ...request,
        roles: [Roles.user],
        password: hashedPassword,
        isActive: true,
        isVerified: false,
      });

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
        message: error.message || UseCaseErrorMessage.register_user_error,
      });
    }
  }
}
