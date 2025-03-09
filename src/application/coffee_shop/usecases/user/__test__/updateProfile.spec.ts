import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { UserDetails } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { UserService } from "@/domain/user/user.service";
import { NotFoundException } from "@nestjs/common";
import { UpdateProfileUseCase } from "../updateProfile";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { UpdateProfileDto } from "../dto";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";

describe("Update profile user use case", () => {
  let useCase: UpdateProfileUseCase;
  let userService: UserService;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    userService = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    (userService.findOne as jest.Mock).mockResolvedValue(null);
    const updateProfileDto: UpdateProfileDto = {
      userGuid,
    };
    await expect(useCase.execute(updateProfileDto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should update profile", async () => {
    const updateProfileDto: UpdateProfileDto = {
      userGuid,
      userName: "usname",
      firstName: "fsname",
      lastName: "lsname",
      gender: "female",
    };
    const hashedPassword = "mocked_hashed_password";

    const userModel: UserModel = {
      guid: userGuid,
      password: hashedPassword,
      phone: "+99344333322",
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
    const udpatedUser = UserMapper.toDomainFromDto(updateProfileDto, user);
    (userService.save as jest.Mock).mockResolvedValue(udpatedUser);

    const result = await useCase.execute(updateProfileDto);

    expect(userService.save).toHaveBeenCalledWith(udpatedUser);
    const userDetails: UserDetails = {
      guid: udpatedUser.guid.toValue(),
      email: udpatedUser.email,
      phone: udpatedUser.phone,
      gender: udpatedUser.gender,
      role: udpatedUser.roles[0],
      isVerified: udpatedUser.isVerified,
      isActive: udpatedUser.isActive,
      userName: udpatedUser.userName,
      firstName: udpatedUser.firstName,
      lastName: udpatedUser.lastName,
      lastLogin: udpatedUser.lastLogin,
    };
    expect(result).toEqual(userDetails);
  });
});
