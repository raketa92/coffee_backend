import { RegisterUserUseCase } from "../registerUser";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserDto } from "@/infrastructure/http/dto/user/createUserDto";
import { User } from "@/domain/user/user.entity";
import { UserService } from "@/domain/user/user.service";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { Roles } from "@/core/constants/roles";
import { AuthResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { IAuthService } from "@/application/auth/ports/IAuthService";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
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

describe("Register user use case", () => {
  let useCase: RegisterUserUseCase;
  let userService: UserService;
  let authService: IAuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: IAuthService,
          useValue: {
            hashPassword: jest.fn(),
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    userService = module.get<UserService>(UserService);
    authService = module.get<IAuthService>(IAuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user exists already", async () => {
    const createUserDto: CreateUserDto = {
      password: "qwerty",
      phone: "+99364123123",
      userName: "jackal",
      gender: "male",
      firstName: "Charles",
      lastName: "Petzold",
      email: "cp@kkk.com",
    };
    const hashedPassword = "mocked_hashed_password";
    const user = new User({
      ...createUserDto,
      roles: [Roles.user],
      password: hashedPassword,
      isActive: true,
      isVerified: false,
    });
    (userService.findOne as jest.Mock).mockResolvedValue(user);

    await expect(useCase.execute(createUserDto)).rejects.toThrow(
      new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: UseCaseErrorMessage.user_already_exists,
      })
    );
    expect(userService.findOne).toHaveBeenCalled();
  });

  it("should create user", async () => {
    const createUserDto: CreateUserDto = {
      password: "qwerty",
      phone: "+99364123123",
      userName: "jackal",
      gender: "male",
      firstName: "Charles",
      lastName: "Petzold",
      email: "cp@kkk.com",
    };
    (userService.findOne as jest.Mock).mockResolvedValue(null);
    const hashedPassword = "mocked_hashed_password";
    (authService.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

    const accessToken = "mock_access_token";
    const refreshToken = "mock_refresh_token";
    (authService.generateAccessToken as jest.Mock).mockReturnValue(accessToken);
    (authService.generateRefreshToken as jest.Mock).mockReturnValue(
      refreshToken
    );

    const user = new User({
      ...createUserDto,
      roles: [Roles.user],
      password: hashedPassword,
      isActive: true,
      isVerified: false,
    });
    const payload = {
      sub: "8524994a-58c6-4b12-a965-80693a7b9803",
      phone: user.phone,
    };
    const result = await useCase.execute(createUserDto);

    expect(authService.hashPassword).toHaveBeenCalledWith(
      createUserDto.password
    );
    expect(authService.generateAccessToken).toHaveBeenCalledWith(payload);
    expect(authService.generateRefreshToken).toHaveBeenCalledWith(payload);
    user.setRefreshToken(refreshToken);
    expect(userService.save).toHaveBeenCalledWith(
      expect.objectContaining({
        password: hashedPassword,
        phone: createUserDto.phone,
        userName: createUserDto.userName,
        gender: createUserDto.gender,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
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
      },
    };
    expect(result).toEqual(userDetails);
  });
});
