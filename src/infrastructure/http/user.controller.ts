import { Controller } from "@nestjs/common";
import { RegisterUserUseCase } from "@/application/coffee_shop/usecases/auth/registerUser";
import { LoginUserUseCase } from "@/application/coffee_shop/usecases/auth/loginUser";

@Controller("/user")
export class UserController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}
}
