import { IOtpService } from "@/application/shared/ports/IOtpService";
import { LoggerService } from "@/infrastructure/logger/logger";
import { RedisService } from "@/infrastructure/persistence/redis/redis.service";
import { TestingModule, Test } from "@nestjs/testing";
import { KafkaConsumer } from "../kafka.consumer";
import { EmailVerificationPurpose, OtpPurpose } from "@/core/constants";
import { OTPRequestedEvent } from "@/domain/user/events/otpRequest.event";
import { OtpEventHandler } from "@/domain/otp/events/otp.eventHandler";
import { EmailVerificationEventHandler } from "@/domain/email_verification/events/email_verification.eventHandler";
import { IEmailVerificationService } from "@/application/shared/ports/IEmailService";
import { EmailVerificationRequestedEvent } from "@/domain/user/events/emailRequest.event";
import { IEmailSender } from "@/application/shared/ports/IEmailSender";

describe("Kafka consumer tests", () => {
  let kafkaConsumer: KafkaConsumer;
  let redisService: RedisService;
  let otpService: IOtpService;
  let emailService: IEmailVerificationService;
  let emailSender: IEmailSender;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KafkaConsumer],
      providers: [
        {
          provide: LoggerService,
          useValue: { info: jest.fn() },
        },
        {
          provide: IOtpService,
          useValue: { create: jest.fn() },
        },
        {
          provide: IEmailVerificationService,
          useValue: { create: jest.fn() },
        },
        {
          provide: RedisService,
          useValue: {
            generateShortSmsCode: jest.fn().mockResolvedValue("12345"),
            generateEmailCode: jest.fn().mockResolvedValue("112233"),
          },
        },
        {
          provide: IEmailSender,
          useValue: { send: jest.fn() },
        },
        OtpEventHandler,
        EmailVerificationEventHandler,
      ],
    }).compile();

    kafkaConsumer = module.get<KafkaConsumer>(KafkaConsumer);
    redisService = module.get(RedisService);
    otpService = module.get(IOtpService);
    emailService = module.get(IEmailVerificationService);
    emailSender = module.get(IEmailSender);
  });

  it("should handle OTP requested event", async () => {
    const event = new OTPRequestedEvent({
      phone: "1234567890",
      purpose: OtpPurpose.userRegister,
    });

    await kafkaConsumer.handleOtpRequested(event);

    expect(redisService.generateShortSmsCode).toHaveBeenCalled();
    expect(otpService.create).toHaveBeenCalledWith({
      otp: "12345",
      phone: event.phone,
      purpose: event.purpose,
      payload: event.payload,
    });
  });

  it("should handle change phone OTP requested event", async () => {
    const phone = "9876543210";
    const event = new OTPRequestedEvent({
      phone,
      payload: phone,
      purpose: OtpPurpose.userChangePhone,
    });

    await kafkaConsumer.handleOtpRequested(event);

    expect(redisService.generateShortSmsCode).toHaveBeenCalled();
    expect(otpService.create).toHaveBeenCalledWith({
      otp: "12345",
      phone: event.phone,
      purpose: OtpPurpose.userChangePhone,
      payload: phone,
    });
  });

  it("should handle change email requested event", async () => {
    const email = "testemail";
    const event = new EmailVerificationRequestedEvent({
      email,
      purpose: EmailVerificationPurpose.userChangeEmail,
    });

    await kafkaConsumer.handleEmailRequested(event);
    const code = "112233";
    expect(emailSender.send).toHaveBeenCalledWith({
      to: event.email,
      content: {
        subject: "Confirm your new email",
        html: `
          <p>We received a request to change your email.</p>
          <p>Please confirm by entering code below:</p>
          <p>Code: ${code}</p>
          <p>If you didn’t request this, you can ignore this email.</p>
        `,
        text: `Confirm your new email`,
      },
    });

    expect(emailService.create).toHaveBeenCalledWith({
      email,
      purpose: EmailVerificationPurpose.userChangeEmail,
      otp: code,
    });
  });
});
