import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { CreateUserDto, createUserSchema } from "./dto/user/createUserDto";
import { LoginUserDto, loginUserSchema } from "./dto/user/loginUserDto";
import { LoginUserUseCase } from "@/application/auth/usecases/loginUser";
import { RegisterUserUseCase } from "@/application/auth/usecases/registerUser";
import { LogoutUserUseCase } from "@/application/auth/usecases/logoutUser";
import { RefreshTokenUseCase } from "@/application/auth/usecases/refreshToken";
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
  @HttpCode(200)
  async login(@Body() loginUserDto: LoginUserDto) {
    const body = loginUserSchema.parse(loginUserDto);
    const response = await this.loginUserUseCase.execute(body);
    return response;
  }

  @Post("/logout")
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(200)
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
  @HttpCode(200)
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
