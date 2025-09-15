import { Injectable } from "@nestjs/common";
import { UpdateProfileDto } from "./dto";
import { UserDetails } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { UseCaseEither } from "@/core/UseCase";
import { UseCaseError } from "@/application/shared/exception";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { IUserService } from "@/application/shared/ports/IUserService";
import { Either, left, right } from "@/core/Either";

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
      async (r) => {
        const user = UserMapper.toDomainFromDto(request, r);
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
