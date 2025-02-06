import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { UserMapper } from "@/infrastructure/persistence/kysely/mappers/userMapper";
import { AuthService } from "@/infrastructure/auth/auth.service";
import { Roles } from "@/core/constants/roles";
import { RefreshTokenUseCase } from "../refreshToken";
import { UserTokenDto } from "@/infrastructure/http/dto/user/logoutUserDto";
import { UnauthorizedException } from "@nestjs/common";
import { UserService } from "@/domain/user/user.service";
import { IUserRepository } from "@/domain/user/user.repository";
import { JwtService } from "@nestjs/jwt";
import { EnvService } from "@/infrastructure/env";

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

describe("Refresh token use case", () => {
  let useCase: RefreshTokenUseCase;
  let authService: AuthService;
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        AuthService,
        {
          provide: EnvService,
          useValue: {
            get: jest.fn().mockReturnValue("mock_secret"),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockImplementation((token) => {
              if (token === "sometoken") {
                return {
                  sub: "8524994a-58c6-4b12-a965-80693a7b9803",
                  phone: "393939",
                };
              }
              throw new Error("Invalid token");
            }),
          },
        },
        {
          provide: IUserRepository,
          useValue: {
            save: jest.fn(),
            getUserByFilter: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUserByRefreshToken: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(authService, "refreshToken").mockRestore();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    (userService.findUserByRefreshToken as jest.Mock).mockResolvedValue(null);
    const loginUserDto: UserTokenDto = {
      refreshToken: "sometoken",
    };
    await expect(useCase.execute(loginUserDto)).rejects.toThrow(
      new UnauthorizedException("Invalid refresh token")
    );
  });

  it("should refresh token", async () => {
    const tokenDto: UserTokenDto = {
      refreshToken: "sometoken",
    };
    const hashedPassword = "mocked_hashed_password";
    const accessToken = "mock_access_token";
    const refreshToken = "mock_refresh_token";

    const userModel: UserModel = {
      guid: "8524994a-58c6-4b12-a965-80693a7b9803",
      password: hashedPassword,
      phone: "393939",
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
    };

    const user = UserMapper.toDomain(userModel);
    (userService.findUserByRefreshToken as jest.Mock).mockResolvedValue(user);
    jest.spyOn(authService, "generateAccessToken").mockReturnValue(accessToken);
    jest
      .spyOn(authService, "generateRefreshToken")
      .mockReturnValue(refreshToken);

    const payload = {
      sub: "8524994a-58c6-4b12-a965-80693a7b9803",
      phone: user.phone,
    };
    const result = await useCase.execute(tokenDto);

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

    expect(result).toEqual({ accessToken, refreshToken });
  });
});
