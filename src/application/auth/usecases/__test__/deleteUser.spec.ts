import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { NotFoundException } from "@nestjs/common";
import { DeleteUserUseCase } from "../deleteUser";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { ResponseMessages } from "@/core/constants";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { IUserService } from "@/application/shared/ports/IUserService";

jest.mock("@/domain/user/user.entity", () => {
  const ActualUser = jest.requireActual("@/domain/user/user.entity").User;
  return {
    User: jest.fn().mockImplementation((props) => {
      const userInstance = new ActualUser(props);
      Object.defineProperty(userInstance, "guid", {
        get: jest.fn(() => ({
          toValue: jest.fn(() => "8524994a-58c6-4b12-a965-80693a7b9803"),
        })),
      });
      return userInstance;
    }),
  };
});

describe("Delete user use case", () => {
  let useCase: DeleteUserUseCase;
  let userService: IUserService;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: IUserService,
          useValue: {
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    userService = module.get<IUserService>(IUserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    (userService.findOne as jest.Mock).mockResolvedValue(null);
    await expect(useCase.execute(userGuid)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should delete user", async () => {
    const hashedPassword = "mocked_hashed_password";

    const userModel: UserModel = {
      guid: userGuid,
      password: hashedPassword,
      phone: "99364123123",
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
    (userService.findOne as jest.Mock).mockResolvedValue(user);
    (userService.delete as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute(userGuid);

    expect(userService.delete).toHaveBeenCalledWith(userGuid);
    expect(result).toEqual(ResponseMessages.userDeleteSuccess);
  });
});
