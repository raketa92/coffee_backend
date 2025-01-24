import * as bcrypt from "bcrypt";
import { IUserRepository } from "@/domain/user/user.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { LoginUserDto } from "@/infrastructure/http/dto/user/loginUserDto";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { UserMapper } from "@/infrastructure/persistence/kysely/mappers/userMapper";
import { LoginUserUseCase } from "../loginUser";
import {
  UseCaseError,
  UseCaseErrorCode,
  UseCaseErrorMessage,
} from "@/application/coffee_shop/exception";
import { AuthService } from "@/infrastructure/auth/auth.service";

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
  let userRepository: IUserRepository;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: IUserRepository,
          useValue: {
            save: jest.fn(),
            getUserByFilter: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    userRepository = module.get<IUserRepository>(IUserRepository);
    authService = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    (authService.validateUser as jest.Mock).mockResolvedValue(null);
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
    expect(authService.validateUser).toHaveBeenCalled();
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
      refreshToken: "old_refreshToken",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = UserMapper.toDomain(userModel);
    (authService.validateUser as jest.Mock).mockResolvedValue(user);
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
    expect(userRepository.save).toHaveBeenCalledWith(
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
