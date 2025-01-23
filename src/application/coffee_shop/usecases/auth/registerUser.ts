import * as bcrypt from "bcrypt";
import { UseCase } from "@/core/UseCase";
import { CreateUserDto } from "@/infrastructure/http/dto/user/createUserDto";
import { UserTokenResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { Inject, Injectable } from "@nestjs/common";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "../../exception";
import { IUserRepository } from "@/domain/user/user.repository";
import { User } from "@/domain/user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { EnvService } from "@/infrastructure/env";

@Injectable()
export class RegisterUserUseCase
  implements UseCase<CreateUserDto, UserTokenResponseDto>
{
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: EnvService
  ) {}

  public async execute(request: CreateUserDto): Promise<UserTokenResponseDto> {
    try {
      const hashedPassword = await bcrypt.hash(request.password, 10);
      const user = new User({ ...request, password: hashedPassword });

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
        message: error.message || UseCaseErrorMessage.register_user_error,
      });
    }
  }
}
