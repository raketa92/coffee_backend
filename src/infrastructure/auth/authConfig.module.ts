import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RefreshTokenStrategy } from "./strategies/refreshToken.strategy";
import { EnvModule, EnvService } from "../env";
import { LocalStrategy } from "./strategies/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { AuthServiceImpl } from "./auth.service";

@Module({
  imports: [
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
    AuthServiceImpl,
  ],
  exports: [AuthServiceImpl],
})
export class AuthConfigModule {}
