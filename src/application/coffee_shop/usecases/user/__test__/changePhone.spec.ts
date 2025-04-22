import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { ChangePhoneDto } from "../dto";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { ChangePhoneUseCase } from "../changePhone";
import { ChangePhoneOtpRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { AppEvents } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";

describe("Change phone use case", () => {
  let useCase: ChangePhoneUseCase;
  let userService: IUserService;
  let kafkaService: IKafkaService;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePhoneUseCase,
        {
          provide: IUserService,
          useValue: {
            findOne: jest.fn(),
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

    useCase = module.get<ChangePhoneUseCase>(ChangePhoneUseCase);
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
    const changePhoneDto: ChangePhoneDto = {
      userGuid,
      phone: "111",
    };
    await expect(useCase.execute(changePhoneDto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should fire event changePhoneOtpRequested", async () => {
    const changePhoneDto: ChangePhoneDto = {
      userGuid,
      phone: "111",
    };
    const hashedPassword = "mocked_hashed_password";

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

    const result = await useCase.execute(changePhoneDto);
    const otpEvent = new ChangePhoneOtpRequestedEvent({
      phone: changePhoneDto.phone,
      payload: { userGuid: changePhoneDto.userGuid },
    });
    expect(kafkaService.publishEvent).toHaveBeenCalledWith(
      AppEvents.changePhoneOtpRequested,
      otpEvent
    );

    expect(result).toEqual({ message: "Otp sent to change phone number" });
  });
});
