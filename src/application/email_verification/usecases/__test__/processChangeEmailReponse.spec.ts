import { Test, TestingModule } from "@nestjs/testing";
import { UserModel } from "@/infrastructure/persistence/kysely/models/user";
import { Roles } from "@/core/constants/roles";
import { UserMapper } from "@/infrastructure/dataMappers/userMapper";
import { EmailVerificationPurpose } from "@/core/constants";
import { IUserService } from "@/application/shared/ports/IUserService";
import { ProcessChangeEmailResponseUseCase } from "../processChangeEmailResponse";
import { IEmailVerificationService } from "@/application/shared/ports/IEmailService";
import { EmailVerification } from "@/domain/email_verification/email_verification";
import { addMinutes, subMinutes } from "date-fns";
import {
  UseCaseError,
  UseCaseErrorCode,
} from "@/application/shared/exception/useCaseError";
import { UseCaseErrorMessage } from "../exception";
import { OtpChangeEmailResponseDto } from "../dto";
import { right } from "@/core/Either";

describe("Process change email response use case", () => {
  let useCase: ProcessChangeEmailResponseUseCase;
  let userService: IUserService;
  let emailService: IEmailVerificationService;
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
          provide: IEmailVerificationService,
          useValue: {
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ProcessChangeEmailResponseUseCase>(
      ProcessChangeEmailResponseUseCase
    );
    userService = module.get<IUserService>(IUserService);
    emailService = module.get<IEmailVerificationService>(
      IEmailVerificationService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should return Left(NOT_FOUND) if user not found", async () => {
    const email = "testEmail";
    (userService.findOne as jest.Mock).mockResolvedValue(right(null));
    const dto: OtpChangeEmailResponseDto = {
      email,
      otp: "121212",
      userGuid,
    };
    const res = await useCase.execute(dto);
    expect(res._tag).toBe("Left");
    res.fold(
      (err) => {
        expect(err.code).toBe(UseCaseErrorCode.NOT_FOUND);
        expect(err.message).toBe(UseCaseErrorMessage.user_not_found);
      },
      () => fail("Expected Left(NOT_FOUND) but got right")
    );
  });

  it("should throw error if record expired", async () => {
    const newEmail = "newEmail";
    const otp = "112233";
    const dto: OtpChangeEmailResponseDto = {
      email: newEmail,
      otp,
      userGuid,
    };
    const email = EmailVerification.create({
      email: newEmail,
      otp,
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
    (userService.findOne as jest.Mock).mockResolvedValue(right(user));
    (emailService.findOne as jest.Mock).mockResolvedValue(email);
    await expect(useCase.execute(dto)).rejects.toThrow(
      new UseCaseError({
        code: UseCaseErrorCode.VALIDATION_ERROR,
        message: UseCaseErrorMessage.expired_link,
      })
    );
  });

  it("should throw error if email exists", async () => {
    const newEmail = "newEmail";
    const otp = "112233";
    const dto: OtpChangeEmailResponseDto = {
      email: newEmail,
      otp,
      userGuid,
    };
    const email = EmailVerification.create({
      email: newEmail,
      otp,
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
    (userService.findOne as jest.Mock).mockResolvedValue(right(user));
    (emailService.findOne as jest.Mock).mockResolvedValue(email);
    await expect(useCase.execute(dto)).rejects.toThrow(
      new UseCaseError({
        code: UseCaseErrorCode.VALIDATION_ERROR,
        message: UseCaseErrorMessage.email_already_in_use,
      })
    );
  });

  it("should process email change", async () => {
    const phone = "+99344333322";
    const newEmail = "userMail";
    const hashedPassword = "mocked_hashed_password";
    const otp = "112233";
    const dto: OtpChangeEmailResponseDto = {
      email: newEmail,
      otp,
      userGuid,
    };

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
    (userService.findOne as jest.Mock).mockResolvedValue(right(user));

    const email = EmailVerification.create({
      email: newEmail,
      otp,
      purpose: EmailVerificationPurpose.userChangeEmail,
      expiresAt: addMinutes(new Date(), 15),
    });

    (emailService.findOne as jest.Mock).mockResolvedValue(email);

    const result = await useCase.execute(dto);
    expect(userService.save).toHaveBeenCalledWith(user);
    expect(emailService.delete).toHaveBeenCalledWith(email.guid.toValue());
    expect(user.email).toEqual(newEmail);
    expect(result).toEqual(right({ message: "Email verified successfully" }));
  });
});
