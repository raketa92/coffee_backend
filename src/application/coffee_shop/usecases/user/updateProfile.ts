import { Injectable } from "@nestjs/common";
import { UpdateProfileDto } from "./dto";
import { UserDetails } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { UseCaseEither } from "@/core/UseCase";
import {
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception/useCaseError";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { IUserService } from "@/application/shared/ports/IUserService";
import { Either, left, right } from "@/core/Either";
import { UseCaseErrorMessage } from "../../exception";

type UpdateProfileError = UseCaseError;

@Injectable()
export class UpdateProfileUseCase
  implements UseCaseEither<UpdateProfileDto, UserDetails, UpdateProfileError>
{
  constructor(private readonly userService: IUserService) {}

  public async execute(
    request: UpdateProfileDto
  ): Promise<Either<UpdateProfileError, UserDetails>> {
    const existingUser = await this.userService.findOne({
      guid: request.userGuid,
    });
    return existingUser.fold<Promise<Either<UseCaseError, UserDetails>>>(
      (err) => Promise.resolve(left(err)),
      async (userOrNull) => {
        if (!userOrNull) {
          throw new UseCaseError({
            code: UseCaseErrorCode.NOT_FOUND,
            message: UseCaseErrorMessage.user_not_found,
          });
        }
        const user = UserMapper.toDomainFromDto(request, userOrNull);
        await this.userService.save(user);

        const userDetails: UserDetails = {
          guid: user.guid.toValue(),
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          role: user.roles[0],
          isVerified: user.isVerified,
          isActive: user.isActive,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          lastLogin: user.lastLogin,
        };
        return right(userDetails);
      }
    );
  }
}
