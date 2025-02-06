import { UseCase } from "@/core/UseCase";
import { CreateUserDto } from "@/infrastructure/http/dto/user/createUserDto";
import {
  AuthResponseDto,
  UserTokenResponseDto,
} from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "../../exception";
import { IUserRepository } from "@/domain/user/user.repository";
import { User } from "@/domain/user/user.entity";
import { AuthService } from "@/infrastructure/auth/auth.service";
import { UserService } from "@/domain/user/user.service";
import { Roles } from "@/core/constants/roles";

@Injectable()
export class RegisterUserUseCase
  implements UseCase<CreateUserDto, UserTokenResponseDto>
{
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly userService: UserService,
    private readonly authService: AuthService
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
      await this.userRepository.save(user);

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
