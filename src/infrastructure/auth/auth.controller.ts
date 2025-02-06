import { Body, Controller, Post } from "@nestjs/common";
import {
  CreateUserDto,
  createUserSchema,
} from "../http/dto/user/createUserDto";
import { LoginUserDto, loginUserSchema } from "../http/dto/user/loginUserDto";
import { LoginUserUseCase } from "@/application/coffee_shop/usecases/auth/loginUser";
import { RegisterUserUseCase } from "@/application/coffee_shop/usecases/auth/registerUser";
import { UserTokenDto, userTokenSchema } from "../http/dto/user/logoutUserDto";
import { LogoutUserUseCase } from "@/application/coffee_shop/usecases/auth/logoutUser";
import { RefreshTokenUseCase } from "@/application/coffee_shop/usecases/auth/refreshToken";

@Controller("/auth")
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  @Post("/register")
  async register(@Body() createUserDto: CreateUserDto) {
    const body = createUserSchema.parse(createUserDto);
    const response = await this.registerUserUseCase.execute(body);
    return response;
  }

  @Post("/login")
  async login(@Body() loginUserDto: LoginUserDto) {
    const body = loginUserSchema.parse(loginUserDto);
    const response = await this.loginUserUseCase.execute(body);
    return response;
  }

  @Post("/logout")
  async logout(@Body() userTokenDto: UserTokenDto) {
    const body = userTokenSchema.parse(userTokenDto);
    const response = await this.logoutUserUseCase.execute(body);
    return response;
  }

  @Post("/refresh-token")
  async refreshToken(@Body() userTokenDto: UserTokenDto) {
    const body = userTokenSchema.parse(userTokenDto);
    const response = await this.refreshTokenUseCase.execute(body);
    return response;
  }
}
