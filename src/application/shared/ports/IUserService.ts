import { OTP } from "@/domain/otp/otp";
import { User } from "@/domain/user/user.entity";
import { UserFiltersDto } from "@/infrastructure/http/dto/user/filters";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Transaction } from "kysely";

export abstract class IUserService {
  abstract findOne(filter: UserFiltersDto): Promise<User | null>;
  abstract findUserByRefreshToken(refreshToken: string): Promise<User | null>;
  abstract save(
    user: User,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<void>;
  abstract delete(
    userGuid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<boolean>;
  abstract processOtp(otp: OTP, user: User): Promise<User>;
}
