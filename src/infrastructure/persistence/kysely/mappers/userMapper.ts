import { UniqueEntityID } from "@/core/UniqueEntityID";
import { UserCreateModel, UserModel } from "../models/user";
import { User } from "@/domain/user/user.entity";

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
      },
      new UniqueEntityID(userModel.guid)
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
      refreshToken: user.refreshToken,
    };

    return userDbModel;
  }
}
