import * as bcrypt from "bcrypt";
import { Test, TestingModule } from "@nestjs/testing";
import { LoginUserDto } from "@/infrastructure/http/dto/user/loginUserDto";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { AuthResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { NotFoundException } from "@nestjs/common";
import { LoginUserUseCase } from "../loginUser";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { IUserService } from "@/application/shared/ports/IUserService";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

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

describe("Login user use case", () => {
  let useCase: LoginUserUseCase;
  let authService: IAuthService;
  let userService: IUserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: IUserService,
          useValue: {
            findOne: jest.fn(),
            findUserByRefreshToken: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: IAuthService,
          useValue: {
            validateUser: jest.fn(),
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    authService = module.get<IAuthService>(IAuthService);
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
    const loginUserDto: LoginUserDto = {
      password: "qwerty",
      phone: "+99364123123",
    };
    await expect(useCase.execute(loginUserDto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should throw error if password is wrong", async () => {
    (userService.findOne as jest.Mock).mockResolvedValue(true);
    (authService.validateUser as jest.Mock).mockResolvedValue(false);
    const loginUserDto: LoginUserDto = {
      password: "qwerty",
      phone: "+99364123123",
    };
    await expect(useCase.execute(loginUserDto)).rejects.toThrow(
      new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: UseCaseErrorMessage.wrong_password,
      })
    );
  });

  it("should login user", async () => {
    const loginUserDto: LoginUserDto = {
      password: "qwerty",
      phone: "+99364123123",
    };
    const hashedPassword = "mocked_hashed_password";
    const accessToken = "mock_access_token";
    const refreshToken = "mock_refresh_token";

    const userModel: UserModel = {
      guid: "8524994a-58c6-4b12-a965-80693a7b9803",
      password: hashedPassword,
      phone: loginUserDto.phone,
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
    (authService.validateUser as jest.Mock).mockResolvedValue(true);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (authService.generateAccessToken as jest.Mock).mockReturnValue(accessToken);
    (authService.generateRefreshToken as jest.Mock).mockReturnValue(
      refreshToken
    );

    const payload = {
      sub: "8524994a-58c6-4b12-a965-80693a7b9803",
      phone: user.phone,
    };
    const result = await useCase.execute(loginUserDto);

    expect(authService.generateAccessToken).toHaveBeenCalledWith(payload);
    expect(authService.generateRefreshToken).toHaveBeenCalledWith(payload);
    user.setRefreshToken(refreshToken);
    expect(userService.save).toHaveBeenCalledWith(
      expect.objectContaining({
        password: hashedPassword,
        phone: userModel.phone,
        userName: userModel.userName,
        gender: userModel.gender,
        firstName: userModel.firstName,
        lastName: userModel.lastName,
        email: userModel.email,
        refreshToken,
      })
    );
    const userDetails: AuthResponseDto = {
      accessToken,
      refreshToken,
      user: {
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
      },
    };
    expect(result).toEqual(userDetails);
  });
});
