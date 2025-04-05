import { Inject, Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { IUserRepository } from "./user.repository";
import { UserFiltersDto } from "@/infrastructure/http/dto/user/filters";
import { Transaction } from "kysely";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { IUserService } from "@/application/shared/ports/IUserService";
import { OTP } from "../otp/otp";
import { OtpPurpose } from "@/core/constants";

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async findOne(filter: UserFiltersDto): Promise<User | null> {
    const userModel = await this.userRepository.getUserByFilter(filter);
    if (!userModel) {
      return null;
    }
    const user = UserMapper.toDomain(userModel);
    return user;
  }

  async findUserByRefreshToken(refreshToken: string): Promise<User | null> {
    const userModel =
      await this.userRepository.getUserByRefreshToken(refreshToken);
    if (!userModel) {
      return null;
    }
    const user = UserMapper.toDomain(userModel);
    return user;
  }

  async save(
    user: User,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<void> {
    await this.userRepository.save(user, transaction);
  }

  async delete(
    userGuid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<boolean> {
    const result = await this.userRepository.delete(userGuid, transaction);
    return !!Number(result.numDeletedRows);
  }

  async processOtp(otp: OTP, user: User): Promise<User> {
    switch (otp.purpose) {
      case OtpPurpose.userChangePassword:
        user.changePassword(otp.payload);
        break;
      case OtpPurpose.userChangePhone:
        user.changePhone(otp.payload);
        break;
      case OtpPurpose.userRegister:
        user.verify();
        break;

      default:
        break;
    }
    return user;
  }
}
