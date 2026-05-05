import { IUserRepository } from "@/domain/user/user.repository";
import { Inject, Injectable } from "@nestjs/common";
import { DeleteResult, Kysely, Transaction } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { UserFiltersDto } from "@/infrastructure/http/dto/user/filters";
import { UserCreateModel, UserModel, UserUpdateModel } from "../models/user";
import { User } from "@/domain/user/user.entity";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import {
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception/useCaseError";
import { Either, left, right } from "@/core/Either";
import { UseCaseErrorMessage } from "@/application/coffee_shop/exception";

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}

  async delete(
    userGuid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<DeleteResult> {
    const query = transaction || this.kysely;
    return await query
      .deleteFrom("User")
      .where("User.guid", "=", userGuid)
      .executeTakeFirst();
  }

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
  ): Promise<Either<UseCaseError, void>> {
    try {
      if (transaction) {
        await this.saveUser(user, transaction);
      } else {
        await this.saveUser(user);
      }
      return right(undefined);
    } catch (err: any) {
      if (err?.code === "23505") {
        return left(
          new UseCaseError({
            code: UseCaseErrorCode.CONFLICT,
            message: UseCaseErrorMessage.user_already_exists,
          })
        );
      }
      return left(
        new UseCaseError({
          code: UseCaseErrorCode.INTERNAL,
          message: UseCaseErrorMessage.fetch_error,
          info: { cause: err?.message },
        })
      );
    }
  }

  async getUserByFilter(
    filter: UserFiltersDto
  ): Promise<Either<UseCaseError, UserModel | null>> {
    try {
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
      if (filter.guid) {
        query = query.where("User.guid", "=", filter.guid);
      }

      const userModel = await query.executeTakeFirst();

      return right(userModel ?? null);
    } catch (error) {
      return left(
        error instanceof UseCaseError
          ? error
          : new UseCaseError({
              code: UseCaseErrorCode.INTERNAL,
              message: UseCaseErrorMessage.fetch_error,
            })
      );
    }
  }

  async getUserByRefreshToken(refreshToken: string): Promise<UserModel | null> {
    const query = this.kysely
      .selectFrom("User")
      .selectAll("User")
      .where("User.refreshToken", "=", refreshToken);

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
