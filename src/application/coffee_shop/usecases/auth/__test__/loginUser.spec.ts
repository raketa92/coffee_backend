import * as bcrypt from "bcrypt";
import { IUserRepository } from "@/domain/user/user.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { EnvService } from "@/infrastructure/env";
import { JwtService } from "@nestjs/jwt";
import { LoginUserDto } from "@/infrastructure/http/dto/user/loginUserDto";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { UserMapper } from "@/infrastructure/persistence/kysely/mappers/userMapper";
import { LoginUserUseCase } from "../loginUser";
import { NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "@/application/coffee_shop/exception";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("@/domain/user/user", () => {
  const ActualUser = jest.requireActual("@/domain/user/user").User;
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
  let configService: EnvService;
  let jwtService: JwtService;

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
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn().mockReturnValue("some_REFRESH_TOKEN_SECRET"),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    userRepository = module.get<IUserRepository>(IUserRepository);
    configService = module.get<EnvService>(EnvService);
    jwtService = module.get<JwtService>(JwtService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if ordernumber is wrong", async () => {
    (userRepository.getUserByFilter as jest.Mock).mockResolvedValue(null);
    const loginUserDto: LoginUserDto = {
      password: "qwerty",
      phone: "+99364123123",
    };
    await expect(useCase.execute(loginUserDto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
    expect(userRepository.getUserByFilter).toHaveBeenCalled();
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

    (userRepository.getUserByFilter as jest.Mock).mockResolvedValue(userModel);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwtService.sign as jest.Mock)
      .mockReturnValueOnce(accessToken)
      .mockReturnValueOnce(refreshToken);

    const user = UserMapper.toDomain(userModel);
    const payload = {
      sub: "8524994a-58c6-4b12-a965-80693a7b9803",
      phone: user.phone,
    };
    const result = await useCase.execute(loginUserDto);

    expect(jwtService.sign).toHaveBeenCalledWith(payload);
    expect(jwtService.sign).toHaveBeenCalledWith(payload, {
      secret: configService.get("REFRESH_TOKEN_SECRET"),
      expiresIn: "7d",
    });
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
