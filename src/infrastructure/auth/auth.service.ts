import * as bcrypt from "bcrypt";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EnvService } from "../env";
import { UserTokenResponseDto } from "../http/dto/user/userTokenResponseDto";
import { IAuthService } from "@/application/shared/ports/IAuthService";

@Injectable()
export class AuthServiceImpl implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: EnvService
  ) {}

  async validateUser(data: {
    userPassword: string;
    password: string;
  }): Promise<boolean> {
    return await bcrypt.compare(data.password, data.userPassword);
  }

  generateAccessToken(payload: { sub: string; phone: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: "5m",
    });
  }

  generateRefreshToken(payload: { sub: string; phone: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get("REFRESH_TOKEN_SECRET"),
      expiresIn: "7d",
    });
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async refreshToken(refreshToken: string): Promise<UserTokenResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("REFRESH_TOKEN_SECRET"),
      });
      const newAccessToken = this.generateAccessToken({
        phone: payload.phone,
        sub: payload.sub,
      });
      const newRefreshToken = this.generateRefreshToken({
        phone: payload.phone,
        sub: payload.sub,
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      throw error;
    }
  }
}
