import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { UserDetails } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { UpdateProfileUseCase } from "../updateProfile";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { UpdateProfileDto } from "../dto";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { IUserService } from "@/application/shared/ports/IUserService";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { fold, isLeft, isRight, left, right } from "@/core/Either";

describe("Update profile user use case", () => {
  let useCase: UpdateProfileUseCase;
  let userService: IUserService;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        {
          provide: IUserService,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    userService = module.get<IUserService>(IUserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("returns Left if user not found", async () => {
    const notFound = new UseCaseError({
      code: UseCaseErrorCode.NOT_FOUND,
      message: UseCaseErrorMessage.user_not_found,
    });

    (userService.findOne as jest.Mock).mockResolvedValue(left(notFound));

    const dto: UpdateProfileDto = { userGuid };

    const res = await useCase.execute(dto);

    expect(isLeft(res)).toBe(true);
    fold(
      res,
      (err) => {
        expect(err).toBeInstanceOf(UseCaseError);
        expect(err.code).toBe(UseCaseErrorCode.NOT_FOUND);
        expect(err.message).toBe(UseCaseErrorMessage.user_not_found);
      },
      () => fail("Expected Left, got Right")
    );
  });

  it("updates profile and returns Right(UserDetails)", async () => {
    const dto: UpdateProfileDto = {
      userGuid,
      userName: "usname",
      firstName: "fsname",
      lastName: "lsname",
      gender: "female",
    };

    const userModel: UserModel = {
      guid: userGuid,
      password: "mocked_hashed_password",
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

    const existingUser = UserMapper.toDomain(userModel);
    (userService.findOne as jest.Mock).mockResolvedValue(right(existingUser));

    const updatedUser = UserMapper.toDomainFromDto(dto, existingUser);

    (userService.save as jest.Mock).mockResolvedValue(right(undefined));

    const res = await useCase.execute(dto);

    expect(userService.save).toHaveBeenCalledTimes(1);
    const savedArg = (userService.save as jest.Mock).mock.calls[0][0];
    expect(savedArg.userName).toBe(updatedUser.userName);
    expect(savedArg.firstName).toBe(updatedUser.firstName);
    expect(savedArg.lastName).toBe(updatedUser.lastName);
    expect(savedArg.gender).toBe(updatedUser.gender);

    expect(isRight(res)).toBe(true);
    fold(
      res,
      (err) => fail(`Expected Right, got Left: ${err.message}`),
      (userDetails) => {
        const expected: UserDetails = {
          guid: updatedUser.guid.toValue(),
          email: updatedUser.email,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
          role: updatedUser.roles[0],
          isVerified: updatedUser.isVerified,
          isActive: updatedUser.isActive,
          userName: updatedUser.userName,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          lastLogin: updatedUser.lastLogin,
        };
        expect(userDetails).toEqual(expected);
      }
    );
  });
});
