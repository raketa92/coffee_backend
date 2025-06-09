import { ProcessOtpResponseUseCase } from "@/application/otp/usecases/processOtpResponse";
import { IOtpService } from "@/application/shared/ports/IOtpService";
import { LoggerService } from "@/infrastructure/logger/logger";
import { RedisService } from "@/infrastructure/persistence/redis/redis.service";
import { TestingModule, Test } from "@nestjs/testing";
import { KafkaConsumer } from "../kafka.consumer";
import { OtpPurpose } from "@/core/constants";
import {
  ChangePhoneOtpRequestedEvent,
  OTPRequestedEvent,
} from "@/domain/user/events/otpRequest.event";
import { OtpRequestDto, OtpResponseDto } from "@/application/otp/usecases/dto";
import { RequestOtpUseCase } from "@/application/otp/usecases/requestOtp";

describe("Kafka consumer tests", () => {
  let kafkaConsumer: KafkaConsumer;
  let redisService: RedisService;
  let otpService: IOtpService;
  let processOtpResponseUseCase: ProcessOtpResponseUseCase;
  let requestOtpUseCase: RequestOtpUseCase;
  const userGuid = "8524994a-58c6-4b12-a965-80693a7b9803";
  const phone = "1234567890";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KafkaConsumer],
      providers: [
        {
          provide: LoggerService,
          useValue: { info: jest.fn() },
        },
        {
          provide: ProcessOtpResponseUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RequestOtpUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: IOtpService,
          useValue: { create: jest.fn() },
        },
        {
          provide: RedisService,
          useValue: {
            generateShortSmsCode: jest.fn().mockResolvedValue("12345"),
          },
        },
      ],
    }).compile();

    kafkaConsumer = module.get<KafkaConsumer>(KafkaConsumer);
    redisService = module.get(RedisService);
    otpService = module.get(IOtpService);
    processOtpResponseUseCase = module.get(ProcessOtpResponseUseCase);
    requestOtpUseCase = module.get(RequestOtpUseCase);
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
    const event = new ChangePhoneOtpRequestedEvent({
      phone: "9876543210",
      payload: {
        userGuid,
      },
    });

    await kafkaConsumer.handleChangePhoneOtpRequested(event);

    expect(redisService.generateShortSmsCode).toHaveBeenCalled();
    expect(otpService.create).toHaveBeenCalledWith({
      otp: "12345",
      phone: event.phone,
      purpose: OtpPurpose.userChangePhone,
    });
  });

  it("should handle OTP response", async () => {
    const dto: OtpResponseDto = {
      phone,
      otp: "12345",
    };

    const expectedResult = { message: "OTP verified successfully" };
    (processOtpResponseUseCase.execute as jest.Mock).mockResolvedValue(
      expectedResult
    );

    const result = await kafkaConsumer.handleOtpResponse(dto);

    expect(processOtpResponseUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });

  it("should handle OTP request", async () => {
    const dto: OtpRequestDto = {
      phone,
    };

    const expectedResult = {
      message: "OTP sent to your phone. Please verify your account.",
    };
    (requestOtpUseCase.execute as jest.Mock).mockResolvedValue(expectedResult);

    const result = await kafkaConsumer.otpRequest(dto);

    expect(requestOtpUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResult);
  });
});
