import * as bcrypt from "bcrypt";
import { IUserRepository } from "@/domain/user/user.repository";
import { RegisterUserUseCase } from "../registerUser";
import { Test, TestingModule } from "@nestjs/testing";
import { EnvService } from "@/infrastructure/env";
import { CreateUserDto } from "@/infrastructure/http/dto/user/createUserDto";
import { User } from "@/domain/user/user.entity";
import { JwtService } from "@nestjs/jwt";

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
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

describe("Register user use case", () => {
  let useCase: RegisterUserUseCase;
  let userRepository: IUserRepository;
  let configService: EnvService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: IUserRepository,
          useValue: {
            save: jest.fn(),
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

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
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
    const hashedPassword = "mocked_hashed_password";
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

    const accessToken = "mock_access_token";
    const refreshToken = "mock_refresh_token";
    (jwtService.sign as jest.Mock)
      .mockReturnValueOnce(accessToken)
      .mockReturnValueOnce(refreshToken);

    const user = new User({ ...createUserDto, password: hashedPassword });
    const payload = {
      sub: "8524994a-58c6-4b12-a965-80693a7b9803",
      phone: user.phone,
    };
    const result = await useCase.execute(createUserDto);

    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    expect(jwtService.sign).toHaveBeenCalledWith(payload);
    expect(jwtService.sign).toHaveBeenCalledWith(payload, {
      secret: configService.get("REFRESH_TOKEN_SECRET"),
      expiresIn: "7d",
    });
    user.setRefreshToken(refreshToken);
    expect(userRepository.save).toHaveBeenCalledWith(
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
    expect(result).toEqual({ accessToken, refreshToken });
  });
});
