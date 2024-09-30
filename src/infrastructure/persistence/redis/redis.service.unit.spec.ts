import { RedisService } from "./redis.service";
import { Test, TestingModule } from "@nestjs/testing";
import Redis from "ioredis";

jest.mock("ioredis", () => ({
  default: jest.fn().mockImplementation(() => ({
    exists: jest.fn(),
    set: jest.fn(),
  })),
}));

describe("Redis service", () => {
  let service: RedisService;
  let redisClientMock: Redis;

  beforeEach(async () => {
    redisClientMock = new Redis() as jest.Mocked<Redis>;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: "REDIS_CLIENT",
          useValue: redisClientMock,
        },
      ],
    }).compile();
    service = module.get<RedisService>(RedisService);
  });

  it("should be defiend", () => {
    expect(service).toBeDefined();
  });

  it("should generate random number with following format: ddMMYYrandom", async () => {
    const mockExists = jest.fn().mockResolvedValue(false);
    const mockSet = jest.fn().mockResolvedValue("OK");
    redisClientMock.exists = mockExists;
    redisClientMock.set = mockSet;

    const orderNumber = await service.generateOrderNumber();
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const expectedDatePart = `${day}${month}${year}`;

    expect(orderNumber).toMatch(new RegExp(`^${expectedDatePart}\\d{6}$`));

    expect(mockExists).toHaveBeenCalledWith(orderNumber);
    expect(mockSet).toHaveBeenCalledWith(orderNumber, "1", "EX", 24 * 60 * 60);
  });

  it("should generate new unique order number from redis when first cycle exists in Redis", async () => {
    const mockExists = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const mockSet = jest.fn().mockResolvedValue("OK");
    redisClientMock.exists = mockExists;
    redisClientMock.set = mockSet;

    const orderNumber = await service.generateOrderNumber();
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const expectedDatePart = `${day}${month}${year}`;

    expect(orderNumber).toMatch(new RegExp(`^${expectedDatePart}\\d{6}$`));
    expect(redisClientMock.exists).toHaveBeenCalledTimes(2);
    expect(redisClientMock.set).toHaveBeenCalledWith(
      orderNumber,
      "1",
      "EX",
      24 * 60 * 60
    );
  });
});
