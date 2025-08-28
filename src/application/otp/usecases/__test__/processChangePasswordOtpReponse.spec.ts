import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { OtpChangePasswordResponseDto, OtpChangePhoneResponseDto, OtpResponseDto } from "../dto";
import { OTP } from "@/domain/otp/otp";
import { OtpPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IOtpService } from "@/application/shared/ports/IOtpService";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { AuthResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { ProcessChangePasswordOtpResponseUseCase } from "../processChangePasswordOtpResponse";
import { randomUUID } from "crypto";

describe("Process change phone otp use case", () => {
  let useCase: ProcessChangePasswordOtpResponseUseCase;
  let userService: IUserService;
  let otpService: IOtpService;
  let authService: IAuthService;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessChangePasswordOtpResponseUseCase,
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

    useCase = module.get<ProcessChangePasswordOtpResponseUseCase>(ProcessChangePasswordOtpResponseUseCase);
    userService = module.get<IUserService>(IUserService);
    otpService = module.get<IOtpService>(IOtpService);
    authService = module.get<IAuthService>(IAuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    (userService.findOne as jest.Mock).mockResolvedValue(null);
    const dto: OtpChangePasswordResponseDto = {
      userGuid: randomUUID(),
      phone: "123111",
      otp: "1122",
    };
    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should process otp", async () => {
    const phone = "+99344333322";
    const dto: OtpChangePasswordResponseDto = {
      userGuid,
      phone: phone,
      otp: "1122",
    };
    const hashedPassword = "mocked_hashed_password";
    const newHashedPassword = "new_mocked_hashed_password";

    const userModel: UserModel = {
      guid: userGuid,
      password: hashedPassword,
      phone,
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
      phone: user.phone,
      payload: newHashedPassword,
      purpose: OtpPurpose.userChangePassword,
    });

    (otpService.findOne as jest.Mock).mockResolvedValue(otp);
    (userService.processOtp as jest.Mock).mockImplementationOnce(() => {
      user.verify();
      user.changePassword(newHashedPassword);
      return user;
    });

    const accessToken = "mock_access_token";
    const refreshToken = "mock_refresh_token";
    (authService.generateAccessToken as jest.Mock).mockReturnValue(accessToken);
    (authService.generateRefreshToken as jest.Mock).mockReturnValue(
      refreshToken
    );

    const payload = {
      sub: "8524994a-58c6-4b12-a965-80693a7b9803",
      phone,
    };
    const result = await useCase.execute(dto);
    expect(userService.save).toHaveBeenCalledWith(user);
    expect(otpService.delete).toHaveBeenCalledWith(otp.guid.toValue());
    expect(user).toHaveProperty("isVerified", true);
    expect(user.password).toEqual(newHashedPassword);
    expect(authService.generateAccessToken).toHaveBeenCalledWith(payload);
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
    expect(result).toEqual(userDetails);
  });
});
