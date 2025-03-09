import { UserService } from "@/domain/user/user.service";
import { LogoutUserUseCase } from "../logoutUser";
import { Test, TestingModule } from "@nestjs/testing";
import { UserTokenDto } from "@/infrastructure/http/dto/user/logoutUserDto";
import { UseCaseErrorMessage } from "@/application/coffee_shop/exception";
import { NotFoundException } from "@nestjs/common";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { ResponseMessages } from "@/core/constants";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";

describe("Logout user use case", () => {
  let useCase: LogoutUserUseCase;
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUserUseCase,
        {
          provide: UserService,
          useValue: {
            findUserByRefreshToken: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LogoutUserUseCase>(LogoutUserUseCase);
    userService = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    (userService.findUserByRefreshToken as jest.Mock).mockResolvedValue(null);
    const loginUserDto: UserTokenDto = {
      refreshToken: "someToken",
    };
    await expect(useCase.execute(loginUserDto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
    expect(userService.findUserByRefreshToken).toHaveBeenCalled();
  });

  it("should logout user and remove refresh token", async () => {
    const loginUserDto: UserTokenDto = {
      refreshToken: "someToken",
    };
    const hashedPassword = "mocked_hashed_password";

    const userModel: UserModel = {
      guid: "8524994a-58c6-4b12-a965-80693a7b9803",
      password: hashedPassword,
      phone: "+9929292",
      email: null,
      userName: "mocked_user_name",
      firstName: "some_first_name",
      lastName: "some_last_name",
      gender: "male",
      roles: [Roles.user],
      refreshToken: "old_refreshToken",
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isActive: false,
      lastLogin: new Date(),
    };

    const user = UserMapper.toDomain(userModel);
    (userService.findUserByRefreshToken as jest.Mock).mockResolvedValue(user);

    const result = await useCase.execute(loginUserDto);

    expect(userService.findUserByRefreshToken).toHaveBeenCalled();
    user.removeRefreshToken();
    expect(userService.save).toHaveBeenCalledWith(
      expect.objectContaining({
        password: hashedPassword,
        phone: userModel.phone,
        userName: userModel.userName,
        gender: userModel.gender,
        firstName: userModel.firstName,
        lastName: userModel.lastName,
        email: userModel.email,
        refreshToken: null,
      })
    );
    expect(result).toEqual({ message: ResponseMessages.success });
  });
});
