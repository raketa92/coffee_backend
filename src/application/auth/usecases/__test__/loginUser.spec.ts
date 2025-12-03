import * as bcrypt from "bcrypt";
import { Test, TestingModule } from "@nestjs/testing";
import { LoginUserDto } from "@/infrastructure/http/dto/user/loginUserDto";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { AuthResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { LoginUserUseCase } from "../loginUser";
import { UseCaseErrorCode } from "@/application/shared/exception/useCaseError";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { left, right } from "@/core/Either";

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
  let kafkaService: IKafkaService;

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
          provide: IKafkaService,
          useValue: {
            publishEvent: jest.fn(),
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
    kafkaService = module.get<IKafkaService>(IKafkaService);

    jest
      .useFakeTimers({
        doNotFake: [
          "nextTick",
          "setImmediate",
          "setInterval",
          "setTimeout",
          "queueMicrotask",
        ],
        advanceTimers: true,
      })
      .setSystemTime(new Date(2025, 2, 17));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return Left(NOT_FOUND) if user not found", async () => {
    (userService.findOne as jest.Mock).mockResolvedValue(right(null));
    const loginUserDto: LoginUserDto = {
      password: "qwerty",
      phone: "+99364123123",
    };
    const res = await useCase.execute(loginUserDto);
    expect(res._tag).toBe("Left");
    res.fold(
      (err) => {
        expect(err.code).toBe(UseCaseErrorCode.NOT_FOUND);
        expect(err.message).toBe(UseCaseErrorMessage.user_not_found);
      },
      () => fail("Expected Left(NOT_FOUND) but got Right")
    );
  });

  it("should return Left(VALIDATION_ERROR) if password is wrong", async () => {
    const userModel: UserModel = {
      guid: "8524994a-58c6-4b12-a965-80693a7b9803",
      password: "hashed",
      phone: "+99364123123",
      email: null,
      userName: "mocked_user_name",
      firstName: "some_first_name",
      lastName: "some_last_name",
      gender: "male",
      roles: [Roles.user],
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
      isActive: true,
      lastLogin: new Date(),
    };
    const user = UserMapper.toDomain(userModel);
    (userService.findOne as jest.Mock).mockResolvedValue(right(user));
    (authService.validateUser as jest.Mock).mockResolvedValue(false);
    const loginUserDto: LoginUserDto = {
      password: "qwerty",
      phone: "+99364123123",
    };
    const res = await useCase.execute(loginUserDto);
    expect(res._tag).toBe("Left");
    res.fold(
      (err) => {
        expect(err.code).toBe(UseCaseErrorCode.VALIDATION_ERROR);
        expect(err.message).toBe(UseCaseErrorMessage.wrong_password);
      },
      () => fail("Expected Left(VALIDATION_ERROR) but got Right")
    );
  });

  it("should return Left(VALIDATION_ERROR) if user not verified", async () => {
    (userService.findOne as jest.Mock).mockResolvedValue(true);
    (authService.validateUser as jest.Mock).mockResolvedValue(true);
    const loginUserDto: LoginUserDto = {
      password: "qwerty",
      phone: "+99364123123",
    };
    const userModel: UserModel = {
      guid: "8524994a-58c6-4b12-a965-80693a7b9803",
      password: "hashedPassword",
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
    (userService.findOne as jest.Mock).mockResolvedValue(right(user));
    (kafkaService.publishEvent as jest.Mock).mockResolvedValue(right(null));
    const res = await useCase.execute(loginUserDto);
    expect(res._tag).toBe("Left");
    res.fold(
      (err) => {
        expect(err.code).toBe(UseCaseErrorCode.VALIDATION_ERROR);
        expect(err.message).toBe(UseCaseErrorMessage.user_not_verified);
      },
      () => fail("Expected Left(VALIDATION_ERROR) but got Right")
    );
    const otpEvent = new OTPRequestedEvent({
      phone: user.phone,
      purpose: OtpPurpose.userRegister,
    });
    expect(kafkaService.publishEvent).toHaveBeenCalledWith(
      AppEvents.otpRequested,
      otpEvent
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
      isVerified: true,
      isActive: false,
      lastLogin: new Date(),
    };

    const user = UserMapper.toDomain(userModel);
    (userService.findOne as jest.Mock).mockResolvedValue(right(user));
    (userService.save as jest.Mock).mockResolvedValue(right(null));
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
    expect(result).toEqual(right(userDetails));
  });
});
