import { UseCaseEither } from "@/core/UseCase";
import { AuthResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import { UseCaseErrorMessage } from "../../auth/exception";
import { LoginUserDto } from "@/infrastructure/http/dto/user/loginUserDto";
import { IAuthService } from "../../shared/ports/IAuthService";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception/useCaseError";
import { IUserService } from "@/application/shared/ports/IUserService";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { Either, left, right, isLeft, mapLeft } from "@/core/Either";
import { mapInfraToUseCase } from "@/core/ErrorMappers";

@Injectable()
export class LoginUserUseCase
  implements UseCaseEither<LoginUserDto, AuthResponseDto, UseCaseError>
{
  constructor(
    private readonly userService: IUserService,
    @Inject(IAuthService)
    private readonly authService: IAuthService,
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(request: LoginUserDto): Promise<Either<UseCaseError, AuthResponseDto>> {
    const user = await this.userService.findOne({ phone: request.phone });
    return user.fold(
      async (err) => left(err),
      async (userOrNull) => {
        if (!userOrNull) {
          return left(
            new UseCaseError({
              code: UseCaseErrorCode.NOT_FOUND,
              message: UseCaseErrorMessage.user_not_found,
            })
          );
        }
        const isValidPassword = await this.authService.validateUser({
          password: request.password,
          userPassword: userOrNull.password,
        });
        if (!isValidPassword) {
          return left(
            new UseCaseError({
              code: UseCaseErrorCode.VALIDATION_ERROR,
              message: UseCaseErrorMessage.wrong_password,
            })
          );
        }
        if (!userOrNull.isVerified) {
          const otpEvent = new OTPRequestedEvent({
            phone: userOrNull.phone,
            purpose: OtpPurpose.userRegister,
          });
          const publishedE = await this.kafkaService.publishEvent<OTPRequestedEvent>(
            AppEvents.otpRequested,
            otpEvent
          );
          const published = mapLeft(publishedE, mapInfraToUseCase);
          if (isLeft(published)) return published;
          return left(
            new UseCaseError({
              code: UseCaseErrorCode.VALIDATION_ERROR,
              message: UseCaseErrorMessage.user_not_verified,
            })
          );
        }

        const payload = { sub: userOrNull.guid.toValue(), phone: userOrNull.phone };
        const accessToken = await this.authService.generateAccessToken(payload);
        const refreshToken =
          await this.authService.generateRefreshToken(payload);
        userOrNull.setRefreshToken(refreshToken);
        userOrNull.setLastLogin(new Date());
        const savedE = await this.userService.save(userOrNull);
        if (isLeft(savedE)) return savedE;

        const userDetails: AuthResponseDto = {
          accessToken,
          refreshToken,
          user: {
            guid: userOrNull.guid.toValue(),
            email: userOrNull.email,
            phone: userOrNull.phone,
            gender: userOrNull.gender,
            role: userOrNull.roles[0],
            isVerified: userOrNull.isVerified,
            isActive: userOrNull.isActive,
            userName: userOrNull.userName,
            firstName: userOrNull.firstName,
            lastName: userOrNull.lastName,
            lastLogin: userOrNull.lastLogin,
          },
        };

        return right(userDetails);
      }
    );
  }
}
