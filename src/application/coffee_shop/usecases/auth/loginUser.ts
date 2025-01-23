import * as bcrypt from "bcrypt";
import { UseCase } from "@/core/UseCase";
import { UserTokenResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "../../exception";
import { IUserRepository } from "@/domain/user/user.repository";
import { JwtService } from "@nestjs/jwt";
import { EnvService } from "@/infrastructure/env";
import { LoginUserDto } from "@/infrastructure/http/dto/user/loginUserDto";
import { UserMapper } from "@/infrastructure/persistence/kysely/mappers/userMapper";

@Injectable()
export class LoginUserUseCase
  implements UseCase<LoginUserDto, UserTokenResponseDto>
{
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: EnvService
  ) {}

  public async execute(request: LoginUserDto): Promise<UserTokenResponseDto> {
    try {
      const userModel = await this.userRepository.getUserByFilter({
        phone: request.phone,
      });
      if (!userModel) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }

      const isPasswordValid = await bcrypt.compare(
        request.password,
        userModel.password
      );
      if (!isPasswordValid) {
        throw new UseCaseError({
          code: UseCaseErrorCode.BAD_REQUEST,
          message: UseCaseErrorMessage.wrong_password,
        });
      }

      const user = UserMapper.toDomain(userModel);

      const payload = { sub: user.guid.toValue(), phone: user.phone };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get("REFRESH_TOKEN_SECRET"),
        expiresIn: "7d",
      });
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
