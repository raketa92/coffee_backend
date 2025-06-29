import { UseCase } from "@/core/UseCase";
import {
  AuthResponseDto,
  UserTokenResponseDto,
} from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "../../auth/exception";
import { LoginUserDto } from "@/infrastructure/http/dto/user/loginUserDto";
import { IAuthService } from "../../shared/ports/IAuthService";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { IUserService } from "@/application/shared/ports/IUserService";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";

@Injectable()
export class LoginUserUseCase
  implements UseCase<LoginUserDto, UserTokenResponseDto>
{
  constructor(
    private readonly userService: IUserService,
    private readonly authService: IAuthService,
    private readonly kafkaService: IKafkaService
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
          code: UseCaseErrorCode.VALIDATION_ERROR,
          message: UseCaseErrorMessage.wrong_password,
        });
      }
      if (!user.isVerified) {
        const otpEvent = new OTPRequestedEvent({
          phone: user.phone,
          purpose: OtpPurpose.userRegister,
        });
        await this.kafkaService.publishEvent<OTPRequestedEvent>(
          AppEvents.otpRequested,
          otpEvent
        );
        throw new UseCaseError({
          code: UseCaseErrorCode.VALIDATION_ERROR,
          message: UseCaseErrorMessage.user_not_verified,
        });
      }

      const payload = { sub: user.guid.toValue(), phone: user.phone };
      const accessToken = this.authService.generateAccessToken(payload);
      const refreshToken = this.authService.generateRefreshToken(payload);
      user.setRefreshToken(refreshToken);
      user.setLastLogin(new Date());
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
          lastLogin: user.lastLogin,
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
