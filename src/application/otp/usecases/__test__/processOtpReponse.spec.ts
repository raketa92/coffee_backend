import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { NotFoundException } from "@nestjs/common";
import { UseCaseErrorMessage } from "@/application/auth/exception";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { ProcessOtpResponseUseCase } from "../processOtpResponse";
import { OtpResponseDto } from "../dto";
import { OTP } from "@/domain/otp/otp";
import { OtpPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IOtpService } from "@/application/shared/ports/IOtpService";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { AuthResponseDto } from "@/infrastructure/http/dto/user/userTokenResponseDto";

describe("Process otp use case", () => {
  let useCase: ProcessOtpResponseUseCase;
  let userService: IUserService;
  let otpService: IOtpService;
  let authService: IAuthService;
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

    useCase = module.get<ProcessOtpResponseUseCase>(ProcessOtpResponseUseCase);
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
    const dto: OtpResponseDto = {
      phone: userGuid,
      otp: "1122",
    };
    await expect(useCase.execute(dto)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseErrorMessage.user_not_found,
      })
    );
  });

  it("should process userRegister otp", async () => {
    const dto: OtpResponseDto = {
      phone: userGuid,
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
      phone: user.phone,
      purpose: OtpPurpose.userRegister,
    });

    (otpService.findOne as jest.Mock).mockResolvedValue(otp);
    (userService.processOtp as jest.Mock).mockImplementationOnce(() => {
      user.verify();
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
      phone: user.phone,
    };
    const result = await useCase.execute(dto);
    expect(userService.save).toHaveBeenCalledWith(user);
    expect(otpService.delete).toHaveBeenCalledWith(otp.guid.toValue());
    expect(user).toHaveProperty("isVerified", true);
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

  it("should process userChangePassword otp", async () => {
    const dto: OtpResponseDto = {
      phone: userGuid,
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
      phone: user.phone,
      payload: newPassword,
      purpose: OtpPurpose.userRegister,
    });

    (otpService.findOne as jest.Mock).mockResolvedValue(otp);
    (userService.processOtp as jest.Mock).mockImplementationOnce(() => {
      user.changePassword(newPassword);
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
      phone: user.phone,
    };

    const result = await useCase.execute(dto);

    expect(userService.save).toHaveBeenCalledWith(user);
    expect(otpService.delete).toHaveBeenCalledWith(otp.guid.toValue());
    expect(user).toHaveProperty("password", newPassword);
    expect(authService.generateAccessToken).toHaveBeenCalledWith(payload);
    expect(authService.generateRefreshToken).toHaveBeenCalledWith(payload);
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

  it("should process userChangePhone otp", async () => {
    const dto: OtpResponseDto = {
      phone: userGuid,
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
      phone: user.phone,
      payload: newPhone,
      purpose: OtpPurpose.userRegister,
    });

    (otpService.findOne as jest.Mock).mockResolvedValue(otp);
    (userService.processOtp as jest.Mock).mockImplementationOnce(() => {
      user.changePhone(newPhone);
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
      phone: newPhone,
    };

    const result = await useCase.execute(dto);

    expect(userService.save).toHaveBeenCalledWith(user);
    expect(otpService.delete).toHaveBeenCalledWith(otp.guid.toValue());
    expect(user).toHaveProperty("phone", newPhone);
    expect(authService.generateAccessToken).toHaveBeenCalledWith(payload);
    expect(authService.generateRefreshToken).toHaveBeenCalledWith(payload);

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
