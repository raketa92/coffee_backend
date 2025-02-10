import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthServiceImpl } from "../auth.service";
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthServiceImpl) {
    super({ usernameField: "phone", passwordField: "password" });
  }

  async validate(userPassword: string, password: string): Promise<any> {
    const user = await this.authService.validateUser({
      userPassword,
      password,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
