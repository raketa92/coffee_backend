import { IUserRepository } from "@/domain/user/user.repository";
import { Inject, Injectable } from "@nestjs/common";
import { Kysely, Transaction } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { UserFiltersDto } from "@/infrastructure/http/dto/user/filters";
import { UserCreateModel, UserModel, UserUpdateModel } from "../models/user";
import { User } from "@/domain/user/user.entity";
import { UserMapper } from "../mappers/userMapper";

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  private async saveUser(
    user: User,
    transaction?: Transaction<DatabaseSchema>
  ) {
    const userModelData = UserMapper.toDbModel(user);
    const query = transaction || this.kysely;
    let updateData: UserUpdateModel = {};
    if (user.changedFields.length) {
      updateData = user.changedFields.reduce(
        (acc, field) => {
          acc[field] = user[field as keyof User];
          return acc;
        },
        {} as Record<string, any>
      );
    }

    if (user.changedFields.length) {
      await this.updateUser(query, updateData, user.guid.toValue());
    } else {
      await this.upsertUser(query, userModelData);
    }
    user.clearChangedFields();
  }

  private async updateUser(
    query: Kysely<DatabaseSchema>,
    updateData: UserUpdateModel,
    userGuid: string
  ) {
    await query
      .updateTable("User")
      .set(updateData)
      .where("User.guid", "=", userGuid)
      .execute();
  }

  private async upsertUser(
    query: Kysely<DatabaseSchema>,
    userModelData: UserCreateModel
  ) {
    await query
      .insertInto("User")
      .values(userModelData)
      .onConflict((conflict) =>
        conflict.column("guid").doUpdateSet(userModelData)
      )
      .execute();
  }

  async save(
    user: User,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<void> {
    if (transaction) {
      await this.saveUser(user, transaction);
    } else {
      await this.saveUser(user);
    }
  }

  async getUserByFilter(filter: UserFiltersDto): Promise<UserModel | null> {
    let query = this.kysely.selectFrom("User").selectAll("User");

    if (filter.email) {
      query = query.where("User.email", "=", filter.email);
    }
    if (filter.firstName) {
      query = query.where("User.firstName", "=", filter.firstName);
    }
    if (filter.lastName) {
      query = query.where("User.lastName", "=", filter.lastName);
    }
    if (filter.phone) {
      query = query.where("User.phone", "=", filter.phone);
    }
    if (filter.userName) {
      query = query.where("User.userName", "=", filter.userName);
    }

    const userModel = await query.executeTakeFirst();

    if (!userModel) {
      return null;
    }

    return userModel;
  }

  async updateRefreshToken(
    userGuid: string,
    refreshToken: string
  ): Promise<void> {
    await this.kysely
      .updateTable("User")
      .set("User.refreshToken", refreshToken)
      .where("User.guid", "=", userGuid)
      .execute();
  }
}
