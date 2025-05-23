import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { ProcessOtpResponseUseCase } from "../processOtpResponse";
import { OtpRequestDto } from "../dto";
import { OTP } from "@/domain/otp/otp";
import { UniqueEntityID } from "@/core/UniqueEntityID";
import { OtpPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IOtpService } from "@/application/shared/ports/IOtpService";

describe("Process otp use case", () => {
  let useCase: ProcessOtpResponseUseCase;
  let userService: IUserService;
  let otpService: IOtpService;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessOtpResponseUseCase,
        {
          provide: IUserService,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            processOtp: jest.fn(),
          },
        },
        {
          provide: IOtpService,
          useValue: {
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ProcessOtpResponseUseCase>(ProcessOtpResponseUseCase);
    userService = module.get<IUserService>(IUserService);
    otpService = module.get<IOtpService>(IOtpService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    (userService.findOne as jest.Mock).mockResolvedValue(null);
    const dto: OtpRequestDto = {
      userGuid,
      otp: "1122",
    };
    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should process userRegister otp", async () => {
    const dto: OtpRequestDto = {
      userGuid,
      otp: "1122",
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

    const otp = OTP.create({
      otp: dto.otp,
      userGuid: new UniqueEntityID(dto.userGuid),
      purpose: OtpPurpose.userRegister,
    });

    (otpService.findOne as jest.Mock).mockResolvedValue(otp);
    (userService.processOtp as jest.Mock).mockImplementationOnce(() => {
      user.verify();
      return user;
    });

    const result = await useCase.execute(dto);

    expect(userService.save).toHaveBeenCalledWith(user);
    expect(user).toHaveProperty("isVerified", true);
    expect(result).toEqual({
      message: "OTP verified successfully",
    });
  });

  it("should process userChangePassword otp", async () => {
    const dto: OtpRequestDto = {
      userGuid,
      otp: "1122",
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

    const newPassword = "new_password";

    const otp = OTP.create({
      otp: dto.otp,
      userGuid: new UniqueEntityID(dto.userGuid),
      payload: newPassword,
      purpose: OtpPurpose.userRegister,
    });

    (otpService.findOne as jest.Mock).mockResolvedValue(otp);
    (userService.processOtp as jest.Mock).mockImplementationOnce(() => {
      user.changePassword(newPassword);
      return user;
    });

    const result = await useCase.execute(dto);

    expect(userService.save).toHaveBeenCalledWith(user);
    expect(user).toHaveProperty("password", newPassword);
    expect(result).toEqual({
      message: "OTP verified successfully",
    });
  });

  it("should process userChangePhone otp", async () => {
    const dto: OtpRequestDto = {
      userGuid,
      otp: "1122",
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

    const newPhone = "+99344333333";

    const otp = OTP.create({
      otp: dto.otp,
      userGuid: new UniqueEntityID(dto.userGuid),
      payload: newPhone,
      purpose: OtpPurpose.userRegister,
    });

    (otpService.findOne as jest.Mock).mockResolvedValue(otp);
    (userService.processOtp as jest.Mock).mockImplementationOnce(() => {
      user.changePhone(newPhone);
      return user;
    });

    const result = await useCase.execute(dto);

    expect(userService.save).toHaveBeenCalledWith(user);
    expect(user).toHaveProperty("phone", newPhone);
    expect(result).toEqual({
      message: "OTP verified successfully",
    });
  });
});
