import { Inject, Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { IUserRepository } from "./user.repository";
import { UserMapper } from "@/infrastructure/persistence/kysely/mappers/userMapper";
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
      return null;
    }
    const user = UserMapper.toDomain(userModel);
    return user;
  }
}
