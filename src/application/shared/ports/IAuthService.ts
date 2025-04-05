import { UserTokenResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";

export abstract class IAuthService {
  abstract validateUser(data: {
    userPassword: string;
    password: string;
  }): Promise<boolean>;
  abstract generateAccessToken(payload: { sub: string; phone: string }): string;
  abstract generateRefreshToken(payload: {
    sub: string;
    phone: string;
  }): string;
  abstract hashPassword(password: string): Promise<string>;
  abstract refreshToken(refreshToken: string): Promise<UserTokenResponseDto>;
}
