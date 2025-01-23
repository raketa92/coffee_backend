import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { RegisterUserUseCase } from "@/application/coffee_shop/usecases/auth/registerUser";
import { LoginUserUseCase } from "@/application/coffee_shop/usecases/auth/loginUser";
import { CreateUserDto, createUserSchema } from "./dto/user/createUserDto";
import { LoginUserDto, loginUserSchema } from "./dto/user/loginUserDto";
import { LocalAuthGuard } from "../auth/guards/local-auth.guard";

@Controller("/user")
export class UserController {
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

  @UseGuards(LocalAuthGuard)
  @Post("/login")
  async login(@Body() loginUserDto: LoginUserDto) {
    const body = loginUserSchema.parse(loginUserDto);
    const response = await this.loginUserUseCase.execute(body);
    return response;
  }
}
