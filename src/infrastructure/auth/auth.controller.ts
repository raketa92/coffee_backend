import { Body, Controller, Post } from "@nestjs/common";
import {
  CreateUserDto,
  createUserSchema,
} from "../http/dto/user/createUserDto";
import { LoginUserDto, loginUserSchema } from "../http/dto/user/loginUserDto";
import { LoginUserUseCase } from "@/application/coffee_shop/usecases/auth/loginUser";
import { RegisterUserUseCase } from "@/application/coffee_shop/usecases/auth/registerUser";

@Controller("/auth")
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
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
}
