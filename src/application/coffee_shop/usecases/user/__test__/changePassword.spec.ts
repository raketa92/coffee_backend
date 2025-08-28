import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { ChangePasswordDto, ChangePhoneDto } from "../dto";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { ChangePasswordUseCase } from "../changePassword";
import { IAuthService } from "@/application/shared/ports/IAuthService";

describe("Change phone use case", () => {
  let useCase: ChangePasswordUseCase;
  let userService: IUserService;
  let kafkaService: IKafkaService;
  let authService: IAuthService;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        {
          provide: IUserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: IAuthService,
          useValue: {
            validateUser: jest.fn(),
            hashPassword: jest.fn(),
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

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
    userService = module.get<IUserService>(IUserService);
    kafkaService = module.get<IKafkaService>(IKafkaService);
    authService = module.get<IAuthService>(IAuthService);

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    (userService.findOne as jest.Mock).mockResolvedValue(null);
    const dto: ChangePasswordDto = {
      userGuid,
      password: "new_password",
      oldPassword: "old_password",
    };
    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should fire event changePasswordOtpRequested", async () => {
    const hashedPassword = "mocked_hashed_password";
    const newHashedPassword = "new_mocked_hashed_password";
    const dto: ChangePasswordDto = {
      userGuid,
      password: newHashedPassword,
      oldPassword: hashedPassword,
    };

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
    (authService.validateUser as jest.Mock).mockResolvedValue(true);
    (authService.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

    const result = await useCase.execute(dto);
    const otpEvent = new OTPRequestedEvent({
      phone: user.phone,
      payload: hashedPassword,
      purpose: OtpPurpose.userChangePassword,
    });
    expect(kafkaService.publishEvent).toHaveBeenCalledWith(
      AppEvents.changePasswordOtpRequested,
      otpEvent
    );

    expect(result).toEqual({ message: "Otp sent to change password" });
  });
});
