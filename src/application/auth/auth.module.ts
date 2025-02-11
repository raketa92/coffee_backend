import { Module } from "@nestjs/common";
import { EnvModule } from "@infrastructure/env";
import { DatabaseModule } from "@infrastructure/persistence/kysely/database.module";
import { LoginUserUseCase } from "../auth/usecases/loginUser";
import { RegisterUserUseCase } from "../auth/usecases/registerUser";
import { JwtService } from "@nestjs/jwt";
import { AuthServiceImpl } from "@/infrastructure/auth/auth.service";
import { UserModule } from "@/domain/user/user.module";
import { UserService } from "@/domain/user/user.service";
import { LogoutUserUseCase } from "../auth/usecases/logoutUser";
import { RefreshTokenUseCase } from "../auth/usecases/refreshToken";
import { IAuthService } from "./ports/IAuthService";

@Module({
  imports: [EnvModule, DatabaseModule, UserModule],
  providers: [
    JwtService,
    LoginUserUseCase,
    RegisterUserUseCase,
    LogoutUserUseCase,
    RefreshTokenUseCase,
    UserService,
    {
      provide: IAuthService,
      useClass: AuthServiceImpl,
    },
  ],
  exports: [
    LoginUserUseCase,
    RegisterUserUseCase,
    LogoutUserUseCase,
    RefreshTokenUseCase,
  ],
})
export class AuthModule {}
