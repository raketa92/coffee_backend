import { UniqueEntityID } from "@/core/UniqueEntityID";
import { User } from "@/domain/user/user.entity";
import { UserCreateModel, UserModel } from "../persistence/kysely/models/user";
import { UpdateProfileDto } from "@/application/coffee_shop/usecases/user/dto";

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

  static toDomainFromDto(request: UpdateProfileDto, existingUser: User): User {
    return User.create(
      {
        password: existingUser.password,
        email: existingUser.email,
        phone: existingUser.phone,
        userName: request.userName ?? existingUser.userName,
        firstName: request.firstName ?? existingUser.firstName,
        lastName: request.lastName ?? existingUser.lastName,
        gender: request.gender ?? existingUser.gender,
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
