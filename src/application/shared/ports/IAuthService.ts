import { EmailVerificationPurpose } from "@/core/constants";
import {
  IEmailTokenPayload,
  UserTokenResponseDto,
} from "@/infrastructure/http/dto/user/userTokenResponseDto";

export abstract class IAuthService {
  abstract validateUser(data: {
    userPassword: string;
    password: string;
  }): Promise<boolean>;
  abstract generateAccessToken(payload: {
    sub: string;
    phone: string;
  }): Promise<string>;
  abstract generateRefreshToken(payload: {
    sub: string;
    phone: string;
  }): Promise<string>;
  abstract hashPassword(password: string): Promise<string>;
  abstract refreshToken(refreshToken: string): Promise<UserTokenResponseDto>;
  abstract generateEmailVerificationToken(payload: {
    sub: string;
    purpose: EmailVerificationPurpose;
    newEmail: string;
  }): Promise<string>;
  abstract verifyEmailToken(token: string): Promise<IEmailTokenPayload>;
}
