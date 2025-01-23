import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshTokenStrategy } from "./strategies/refreshToken.strategy";
import { EnvModule, EnvService } from "../env";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "@/domain/user/user.module";
import { UserService } from "@/domain/user/user.service";
import { DatabaseModule } from "../persistence/kysely/database.module";

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    PassportModule,
    EnvModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      useFactory: async (configService: EnvService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: {
          expiresIn: "15m",
        },
      }),
      inject: [EnvService],
    }),
  ],
  providers: [
    JwtStrategy,
    RefreshTokenStrategy,
    AuthService,
    LocalStrategy,
    UserService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
