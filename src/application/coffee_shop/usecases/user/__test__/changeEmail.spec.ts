import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ChangeEmailDto } from "../dto";
import { AppEvents, EmailVerificationPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { ChangeEmailUseCase } from "../changeEmail";
import { UseCaseErrorMessage } from "@/application/coffee_shop/exception";
import { EmailRequestedEvent } from "@/domain/user/events/emailRequest.event";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";

describe("Change email use case", () => {
  let useCase: ChangeEmailUseCase;
  let userService: IUserService;
  let kafkaService: IKafkaService;
  let authService: IAuthService;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeEmailUseCase,
        {
          provide: IUserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: IAuthService,
          useValue: {
            generateEmailVerificationToken: jest.fn(),
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

    useCase = module.get<ChangeEmailUseCase>(ChangeEmailUseCase);
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
    const dto: ChangeEmailDto = {
      userGuid,
      email: "testEmail",
    };
    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should throw error if email is taken", async () => {
    (userService.findOne as jest.Mock).mockResolvedValueOnce(true);
    (userService.findOne as jest.Mock).mockResolvedValueOnce(true);
    const dto: ChangeEmailDto = {
      userGuid,
      email: "testEmail",
    };
    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.email_already_in_use,
      })
    );
  });

  it("should fire event changeEmailRequested", async () => {
    const dto: ChangeEmailDto = {
      userGuid,
      email: "newEmail",
    };

    const token = "token";
    (authService.generateEmailVerificationToken as jest.Mock).mockResolvedValue(
      token
    );

    const userModel: UserModel = {
      guid: userGuid,
      password: "hashedPassword",
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
    (userService.findOne as jest.Mock).mockResolvedValueOnce(user);
    (userService.findOne as jest.Mock).mockResolvedValueOnce(null);

    const result = await useCase.execute(dto);
    const emailEvent = new EmailRequestedEvent({
      email: dto.email,
      payload: token,
      purpose: EmailVerificationPurpose.userChangeEmail,
    });
    expect(kafkaService.publishEvent).toHaveBeenCalledWith(
      AppEvents.changeEmailRequested,
      emailEvent
    );

    expect(result).toEqual({
      message: `Verification email sent to ${dto.email}`,
    });
  });
});
