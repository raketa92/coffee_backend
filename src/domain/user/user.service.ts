import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./user.entity";
import { IUserRepository } from "./user.repository";
import { UserMapper } from "@/infrastructure/persistence/kysely/mappers/userMapper";
import { UseCaseErrorMessage } from "@/application/coffee_shop/exception";
import { UserFiltersDto } from "@/infrastructure/http/dto/user/filters";

@Injectable()
export class UserService {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  async findOne(filter: UserFiltersDto): Promise<User | null> {
    const userModel = await this.userRepository.getUserByFilter(filter);
    if (!userModel) {
      throw new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      });
    }
    const user = UserMapper.toDomain(userModel);
    return user;
  }
}
