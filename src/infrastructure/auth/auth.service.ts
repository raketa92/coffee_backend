import * as bcrypt from "bcrypt";
import { UserService } from "@/domain/user/user.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.userService.findOne({ phone });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return user;
      }
    }
    return null;
  }
}
