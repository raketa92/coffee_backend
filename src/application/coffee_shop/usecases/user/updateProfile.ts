import { Injectable, NotFoundException } from "@nestjs/common";
import { UpdateProfileDto } from "./dto";
import { UserDetails } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { UseCase } from "@/core/UseCase";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { UseCaseErrorMessage } from "../../exception";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { IUserService } from "@/application/shared/ports/IUserService";

@Injectable()
export class UpdateProfileUseCase
  implements UseCase<UpdateProfileDto, UserDetails>
{
  constructor(private readonly userService: IUserService) {}

  public async execute(request: UpdateProfileDto): Promise<UserDetails> {
    try {
      const existingUser = await this.userService.findOne({
        guid: request.userGuid,
      });
      if (!existingUser) {
        throw new NotFoundException({
          message: UseCaseErrorMessage.user_not_found,
        });
      }

      const user = UserMapper.toDomainFromDto(request, existingUser);

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

      return userDetails;
    } catch (error: any) {
      throw new UseCaseError({
        code: error.code || UseCaseErrorCode.BAD_REQUEST,
        message: error.message || UseCaseErrorMessage.profile_update_error,
      });
    }
  }
}
