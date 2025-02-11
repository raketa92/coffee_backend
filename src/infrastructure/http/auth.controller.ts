import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { CreateUserDto, createUserSchema } from "./dto/user/createUserDto";
import { LoginUserDto, loginUserSchema } from "./dto/user/loginUserDto";
import { LoginUserUseCase } from "@/application/coffee_shop/usecases/auth/loginUser";
import { RegisterUserUseCase } from "@/application/coffee_shop/usecases/auth/registerUser";
import { LogoutUserUseCase } from "@/application/coffee_shop/usecases/auth/logoutUser";
import { RefreshTokenUseCase } from "@/application/coffee_shop/usecases/auth/refreshToken";
import { Request } from "express";
import { JwtRefreshAuthGuard } from "../auth/guards/jwt-refresh-auth.guard";

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
  @UseGuards(JwtRefreshAuthGuard)
  async logout(@Req() req: Request) {
    const user = req.user;
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException("No refresh token found.");
    }
    const refreshToken = user.refreshToken;
    const response = await this.logoutUserUseCase.execute({ refreshToken });
    return response;
  }

  @Post("/refresh-token")
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(@Req() req: Request) {
    const user = req.user;
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException("No refresh token found.");
    }
    const refreshToken = user.refreshToken;
    const response = await this.refreshTokenUseCase.execute({ refreshToken });
    return response;
  }
}
