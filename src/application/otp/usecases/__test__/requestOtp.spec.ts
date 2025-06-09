import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { RequestOtpUseCase } from "../../../otp/usecases/requestOtp";

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

describe("Request otp use case", () => {
  let useCase: RequestOtpUseCase;
  let userService: IUserService;
  let kafkaService: IKafkaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestOtpUseCase,
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
      ],
    }).compile();

    useCase = module.get<RequestOtpUseCase>(RequestOtpUseCase);
    userService = module.get<IUserService>(IUserService);
    kafkaService = module.get<IKafkaService>(IKafkaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    (userService.findOne as jest.Mock).mockResolvedValue(null);
    const otpRequestDto: { phone: string } = {
      phone: "+99364123123",
    };
    await expect(useCase.execute(otpRequestDto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should publish otp event", async () => {
    const otpRequestDto: { phone: string } = {
      phone: "+99364123123",
    };
    const hashedPassword = "mocked_hashed_password";

    const userModel: UserModel = {
      guid: "8524994a-58c6-4b12-a965-80693a7b9803",
      password: hashedPassword,
      phone: otpRequestDto.phone,
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
    (userService.findOne as jest.Mock).mockResolvedValue(user);
    const result = await useCase.execute(otpRequestDto);

    const otpEvent = new OTPRequestedEvent({
      phone: user.phone,
      purpose: OtpPurpose.userRegister,
    });
    expect(kafkaService.publishEvent).toHaveBeenCalledWith(
      AppEvents.otpRequested,
      otpEvent
    );
    expect(result).toEqual({
      message: "OTP sent to your phone. Please verify your account.",
    });
  });
});
