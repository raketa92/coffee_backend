import * as bcrypt from "bcrypt";
import { UserService } from "@/domain/user/user.service";
import { Injectable } from "@nestjs/common";
import { User } from "@/domain/user/user.entity";
import { JwtService } from "@nestjs/jwt";
import { EnvService } from "../env";

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
}
