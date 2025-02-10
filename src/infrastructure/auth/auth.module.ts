import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshTokenStrategy } from "./strategies/refreshToken.strategy";
import { EnvModule, EnvService } from "../env";
import { LocalStrategy } from "./strategies/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "@/domain/user/user.module";
import { UserService } from "@/domain/user/user.service";
import { DatabaseModule } from "../persistence/kysely/database.module";
import { AuthController } from "./auth.controller";
import { LoginUserUseCase } from "@/application/coffee_shop/usecases/auth/loginUser";
import { RegisterUserUseCase } from "@/application/coffee_shop/usecases/auth/registerUser";
import { LogoutUserUseCase } from "@/application/coffee_shop/usecases/auth/logoutUser";
import { RefreshTokenUseCase } from "@/application/coffee_shop/usecases/auth/refreshToken";
import { AuthServiceImpl } from "./auth.service";

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    PassportModule,
    EnvModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      useFactory: async (configService: EnvService) => {
        const jwtSecret = configService.get("JWT_SECRET");
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: "5m" },
        };
      },
      inject: [EnvService],
    }),
  ],
  providers: [
    JwtStrategy,
    RefreshTokenStrategy,
    LocalStrategy,
    UserService,
    RegisterUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RefreshTokenUseCase,
    AuthServiceImpl,
  ],
  controllers: [AuthController],
  exports: [AuthServiceImpl],
})
export class AuthModule {}
