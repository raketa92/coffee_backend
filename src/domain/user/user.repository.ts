import { UserFiltersDto } from "@/infrastructure/http/dto/user/filters";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { User } from "./user.entity";
import { Transaction } from "kysely";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";

export interface IUserRepository {
  getUserByFilter(filter: UserFiltersDto): Promise<UserModel | null>;
  updateRefreshToken(userGuid: string, refreshToken: string): Promise<void>;
  save(user: User, transaction?: Transaction<DatabaseSchema>): Promise<void>;
}

export const IUserRepository = Symbol("IUserRepository");
