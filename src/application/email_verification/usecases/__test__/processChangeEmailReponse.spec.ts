import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { EmailVerificationPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { IAuthService } from "@/application/shared/ports/IAuthService";
import { IEmailTokenPayload } from "@/infrastructure/http/dto/user/userTokenResponseDto";
import { ProcessChangeEmailResponseUseCase } from "../processChangeEmailResponse";
import { IEmailService } from "@/application/shared/ports/IEmailService";
import { EmailVerification } from "@/domain/email/email";
import { addMinutes, subMinutes } from "date-fns";
import {
  UseCaseCommonErrorMessage,
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception";
import { UseCaseErrorMessage } from "../exception";

describe("Process change email response use case", () => {
  let useCase: ProcessChangeEmailResponseUseCase;
  let userService: IUserService;
  let emailService: IEmailService;
  let authService: IAuthService;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessChangeEmailResponseUseCase,
        {
          provide: IUserService,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: IEmailService,
          useValue: {
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: IAuthService,
          useValue: {
            verifyEmailToken: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ProcessChangeEmailResponseUseCase>(
      ProcessChangeEmailResponseUseCase
    );
    userService = module.get<IUserService>(IUserService);
    emailService = module.get<IEmailService>(IEmailService);
    authService = module.get<IAuthService>(IAuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should throw error if user not found", async () => {
    const payload: IEmailTokenPayload = {
      sub: userGuid,
      purpose: EmailVerificationPurpose.userChangeEmail,
      newEmail: "testEmail",
    };
    (authService.verifyEmailToken as jest.Mock).mockReturnValue(payload);
    (userService.findOne as jest.Mock).mockResolvedValue(null);
    const token = "token";
    await expect(useCase.execute(token)).rejects.toThrow(
      new NotFoundException({
        message: UseCaseCommonErrorMessage.user_not_found,
      })
    );
  });

  it("should throw error if email purporse is wrong", async () => {
    const token = "token";
    const payload: IEmailTokenPayload = {
      sub: userGuid,
      purpose: "random" as EmailVerificationPurpose,
      newEmail: "testEmail",
    };
    (authService.verifyEmailToken as jest.Mock).mockReturnValue(payload);
    await expect(useCase.execute(token)).rejects.toThrow(
      new BadRequestException("Invalid purpose")
    );
  });

  it("should throw error if record expired", async () => {
    const newEmail = "newEmail";
    const token = "token";
    const payload: IEmailTokenPayload = {
      sub: userGuid,
      purpose: EmailVerificationPurpose.userChangeEmail,
      newEmail,
    };
    const email = EmailVerification.create({
      email: newEmail,
      payload: token,
      purpose: EmailVerificationPurpose.userChangeEmail,
      expiresAt: subMinutes(new Date(), 10),
    });
    const userModel: UserModel = {
      guid: userGuid,
      password: "hashedPassword",
      phone: "111",
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
    (authService.verifyEmailToken as jest.Mock).mockReturnValue(payload);
    (emailService.findOne as jest.Mock).mockResolvedValue(email);
    await expect(useCase.execute(token)).rejects.toThrow(
      new UseCaseError({
        code: UseCaseErrorCode.VALIDATION_ERROR,
        message: UseCaseErrorMessage.expired_link,
      })
    );
  });

  it("should throw error if email exists", async () => {
    const newEmail = "newEmail";
    const token = "token";
    const payload: IEmailTokenPayload = {
      sub: userGuid,
      purpose: EmailVerificationPurpose.userChangeEmail,
      newEmail,
    };
    const email = EmailVerification.create({
      email: newEmail,
      payload: token,
      purpose: EmailVerificationPurpose.userChangeEmail,
      expiresAt: addMinutes(new Date(), 10),
    });
    const userGuid2 = "1524994a-58c6-4b12-a965-80693a7b9801";
    const userModel: UserModel = {
      guid: userGuid2,
      password: "hashedPassword",
      phone: "111",
      email: newEmail,
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
    (authService.verifyEmailToken as jest.Mock).mockReturnValue(payload);
    (emailService.findOne as jest.Mock).mockResolvedValue(email);
    await expect(useCase.execute(token)).rejects.toThrow(
      new UseCaseError({
        code: UseCaseErrorCode.VALIDATION_ERROR,
        message: UseCaseErrorMessage.email_already_in_use,
      })
    );
  });

  it("should process email change", async () => {
    const phone = "+99344333322";
    const token = "token";
    const newEmail = "userMail";
    const hashedPassword = "mocked_hashed_password";

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

    const email = EmailVerification.create({
      email: newEmail,
      payload: token,
      purpose: EmailVerificationPurpose.userChangeEmail,
      expiresAt: addMinutes(new Date(), 15),
    });

    const payload: IEmailTokenPayload = {
      sub: userGuid,
      purpose: EmailVerificationPurpose.userChangeEmail,
      newEmail,
    };

    (emailService.findOne as jest.Mock).mockResolvedValue(email);
    (authService.verifyEmailToken as jest.Mock).mockReturnValue(payload);

    const result = await useCase.execute(token);
    expect(userService.save).toHaveBeenCalledWith(user);
    expect(emailService.delete).toHaveBeenCalledWith(email.guid.toValue());
    expect(user.email).toEqual(newEmail);
    expect(result).toEqual({ message: "Email verified successfully" });
  });
});
