import { UniqueEntityID } from "@/core/UniqueEntityID";
import { User } from "@/domain/user/user.entity";
import { UserCreateModel, UserModel } from "../persistence/kysely/models/user";

export class UserMapper {
  static toDomain(userModel: UserModel): User {
    return new User(
      {
        phone: userModel.phone,
        userName: userModel.userName,
        firstName: userModel.firstName,
        lastName: userModel.lastName,
        gender: userModel.gender,
        password: userModel.password,
        email: userModel.email,
        roles: userModel.roles,
        isActive: userModel.isActive,
        isVerified: userModel.isVerified,
      },
      new UniqueEntityID(userModel.guid)
    );
  }

  static toDomainFromDto<T extends Partial<UserModel>>(
    data: T,
    existingUser: User
  ): User {
    return User.create(
      {
        userName: data.userName ?? existingUser.userName,
        firstName: data.firstName ?? existingUser.firstName,
        lastName: data.lastName ?? existingUser.lastName,
        gender: data.gender ?? existingUser.gender,
        password: existingUser.password,
        email: existingUser.email,
        phone: existingUser.phone,
        roles: existingUser.roles,
        isVerified: existingUser.isVerified,
        isActive: existingUser.isActive,
      },
      existingUser.guid
    );
  }

  static toDbModel(user: User): UserCreateModel {
    const userDbModel: UserCreateModel = {
      guid: user.guid.toValue(),
      phone: user.phone,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      gender: user.gender,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      isVerified: user.isVerified,
      refreshToken: user.refreshToken,
    };

    return userDbModel;
  }
}
