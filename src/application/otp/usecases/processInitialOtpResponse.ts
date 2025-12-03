import { Injectable, NotFoundException } from "@nestjs/common";
import { UseCase, UseCaseEither } from "@/core/UseCase";
import {
  UseCaseCommonErrorMessage,
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception/useCaseError";
import { OtpResponseDto } from "./dto";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IOtpService } from "@/application/shared/ports/IOtpService";
import { UseCaseErrorMessage } from "../exception";
import { AuthResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { Either, left, right } from "@/core/Either";

@Injectable()
export class ProcessInitialOtpResponseUseCase
  implements UseCaseEither<OtpResponseDto, AuthResponseDto, UseCaseError>
{
  constructor(
    private readonly userService: IUserService,
    private readonly otpService: IOtpService,
    private readonly authService: IAuthService
  ) {}

  public async execute(
    request: OtpResponseDto
  ): Promise<Either<UseCaseError, AuthResponseDto>> {
    const existingUser = await this.userService.findOne({
      phone: request.phone,
    });
    return existingUser.fold(
      (err) => Promise.resolve(left(err)),
      async (userOrNull) => {
        if (!userOrNull) {
          throw new UseCaseError({
            code: UseCaseErrorCode.NOT_FOUND,
            message: UseCaseErrorMessage.user_not_found,
          })
        }
        const otp = await this.otpService.findOne({
          otp: request.otp,
          phone: request.phone,
        });
        if (!otp) {
          throw new NotFoundException({
            message: UseCaseErrorMessage.wrong_otp,
          });
        }
        const user = await this.userService.processOtp(otp, userOrNull);
        await this.userService.save(user);
        await this.otpService.delete(otp.guid.toValue());

        const payload = { sub: user.guid.toValue(), phone: user.phone };
        const accessToken = await this.authService.generateAccessToken(payload);
        const refreshToken =
          await this.authService.generateRefreshToken(payload);
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
            lastLogin: user.lastLogin,
          },
        };

        return right(userDetails);
      }
    );
  }
}
