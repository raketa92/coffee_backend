import * as bcrypt from "bcrypt";
import { UserService } from "@/domain/user/user.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "@/domain/user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { EnvService } from "../env";
import { UserTokenResponseDto } from "../http/dto/user/userTokenResponseDto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: EnvService
  ) {}

  async validateUser(phone: string, password: string): Promise<User | null> {
    const user = await this.userService.findOne({ phone });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return user;
      }
    }
    return null;
  }

  generateAccessToken(payload: { sub: string; phone: string }): string {
    return this.jwtService.sign(payload);
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
      const user = await this.userService.findUserByRefreshToken(refreshToken);
      if (!user) {
        throw new UnauthorizedException({ message: "Invalid refresh token" });
      }
      const newAccessToken = this.generateAccessToken({
        phone: payload.phone,
        sub: payload.sub,
      });
      const newRefreshToken = this.generateRefreshToken({
        phone: payload.phone,
        sub: payload.sub,
      });
      user.setRefreshToken(newRefreshToken);
      await this.userService.save(user);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      throw error;
    }
  }
}
