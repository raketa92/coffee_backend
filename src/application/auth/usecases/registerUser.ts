import { UseCase } from "@/core/UseCase";
import { CreateUserDto } from "@/infrastructure/http/dto/user/createUserDto";
import { UserDetails } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import { UseCaseErrorMessage } from "../../auth/exception";
import { User } from "@/domain/user/user.entity";
import { Roles } from "@/core/constants/roles";
import { IAuthService } from "../../shared/ports/IAuthService";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { IKafkaService } from "../../shared/ports/IkafkaService";
import { IUserService } from "@/application/shared/ports/IUserService";

@Injectable()
export class RegisterUserUseCase
  implements UseCase<CreateUserDto, UserDetails>
{
  constructor(
    private readonly userService: IUserService,
    @Inject(IAuthService)
    private readonly authService: IAuthService,
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(request: CreateUserDto): Promise<UserDetails> {
    try {
      const userExist = await this.userService.findOne({
        phone: request.phone,
      });
      if (userExist) {
        throw new UseCaseError({
          code: UseCaseErrorCode.CONFLICT,
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
        lastLogin: new Date(),
      });

      await this.userService.save(user);

      const otpEvent = new OTPRequestedEvent({
        phone: user.phone,
        purpose: OtpPurpose.userRegister,
      });
      await this.kafkaService.publishEvent<OTPRequestedEvent>(
        AppEvents.otpRequested,
        otpEvent
      );

      const userDetails: UserDetails = {
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
      };

      return userDetails;
    } catch (error: any) {
      throw new UseCaseError({
        code: error.code || UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.register_user_error,
      });
    }
  }
}
