import * as bcrypt from "bcrypt";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EnvService } from "../env";
import {
  IEmailTokenPayload,
  UserTokenResponseDto,
} from "../http/dto/user/userTokenResponseDto";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { EmailVerificationPurpose } from "@/core/constants";

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

  async generateAccessToken(payload: {
    sub: string;
    phone: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: "5m",
      audience: "access",
    });
  }

  generateRefreshToken(payload: {
    sub: string;
    phone: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get("REFRESH_TOKEN_SECRET"),
      expiresIn: "7d",
      audience: "refresh",
    });
  }

  generateEmailVerificationToken(payload: {
    sub: string;
    purpose: EmailVerificationPurpose;
    newEmail: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get("JWT_SECRET"),
      expiresIn: "15m",
      audience: "emailVerification",
    });
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async refreshToken(refreshToken: string): Promise<UserTokenResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get("REFRESH_TOKEN_SECRET"),
      });
      const newAccessToken = await this.generateAccessToken({
        phone: payload.phone,
        sub: payload.sub,
      });
      const newRefreshToken = await this.generateRefreshToken({
        phone: payload.phone,
        sub: payload.sub,
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      throw error;
    }
  }

  async verifyEmailToken(token: string): Promise<IEmailTokenPayload> {
    try {
      return this.jwtService.verifyAsync<IEmailTokenPayload>(token, {
        secret: this.configService.get("JWT_SECRET"),
        audience: "emailVerification",
      });
    } catch (error) {
      throw error;
    }
  }
}
