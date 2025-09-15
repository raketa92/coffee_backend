import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { ChangePasswordDto } from "../dto";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { AppEvents, OtpPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { ChangePasswordUseCase } from "../changePassword";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception";
import { isLeft, isRight, left, right } from "@/core/Either";

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

  it("returns Left if user not found", async () => {
    const notFound = new UseCaseError({
      code: UseCaseErrorCode.NOT_FOUND,
      message: UseCaseErrorMessage.user_not_found,
    });
    (userService.findOne as jest.Mock).mockResolvedValue(left(notFound));

    const dto: ChangePasswordDto = {
      userGuid,
      password: "new_password",
      oldPassword: "old_password",
    };
    const res = await useCase.execute(dto);
    expect(isLeft(res)).toBe(true);
    res.fold(
      (err) => {
        expect(err).toBeInstanceOf(UseCaseError);
        expect(err.code).toBe(UseCaseErrorCode.NOT_FOUND);
        expect(err.message).toBe(UseCaseErrorMessage.user_not_found);
      },
      () => fail("Expected Left, got Right")
    );
  });

  it("Changes password and fire event changePasswordOtpRequested", async () => {
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
    (userService.findOne as jest.Mock).mockResolvedValue(right(user));
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
    expect(isRight(result)).toBe(true);
    result.fold(
      (err) => fail(`Expected Right, got Left: ${err.message}`),
      (r) => expect(r).toEqual({ message: "Otp sent to change password" })
    );
  });
});
