import { UseCaseEither } from "@/core/UseCase";
import { CreateUserDto } from "@/infrastructure/http/dto/user/createUserDto";
import { UserDetails } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import { UseCaseErrorMessage } from "../../auth/exception";
import { User } from "@/domain/user/user.entity";
import { Roles } from "@/core/constants/roles";
import { IAuthService } from "../../shared/ports/IAuthService";
import {
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception/useCaseError";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { IKafkaService } from "../../shared/ports/IkafkaService";
import { IUserService } from "@/application/shared/ports/IUserService";
import { Either, fold, isLeft, left, mapLeft, right } from "@/core/Either";
import { mapInfraToUseCase } from "@/core/ErrorMappers";

@Injectable()
export class RegisterUserUseCase
  implements UseCaseEither<CreateUserDto, UserDetails, UseCaseError>
{
  constructor(
    private readonly userService: IUserService,
    @Inject(IAuthService)
    private readonly authService: IAuthService,
    @Inject(IKafkaService)
    private readonly kafkaService: IKafkaService
  ) {}

  public async execute(
    request: CreateUserDto
  ): Promise<Either<UseCaseError, UserDetails>> {
    const userE = await this.userService.findOne({ phone: request.phone });
    if (isLeft(userE)) return userE;

    const maybeUser = fold(
      userE,
      (_) => null,
      (u) => u
    );

    if (maybeUser) {
      return left(
        new UseCaseError({
          code: UseCaseErrorCode.CONFLICT,
          message: UseCaseErrorMessage.user_already_exists,
        })
      );
    }

    const hashedPassword = await this.authService.hashPassword(
      request.password
    );

    const user = new User({
      ...request,
      password: hashedPassword,
      roles: [Roles.user],
      isActive: true,
      isVerified: false,
      lastLogin: new Date(),
    });

    const savedE = await this.userService.save(user);
    if (isLeft(savedE)) return savedE;

    const publishedE = await this.kafkaService.publishEvent(
      AppEvents.otpRequested,
      new OTPRequestedEvent({
        phone: user.phone,
        purpose: OtpPurpose.userRegister,
      })
    );
    const published = mapLeft(publishedE, mapInfraToUseCase);
    if (isLeft(published)) return published;

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

    return right(userDetails);
  }
}
