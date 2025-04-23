import { Injectable, Inject } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisService {
  constructor(@Inject("REDIS_CLIENT") private readonly redisClient: Redis) {}

  async generateOrderNumber(): Promise<string> {
    const client = this.redisClient;

    const now = new Date();
    const datePart = this.formatDate(now);

    let randomPart: string;

    let orderNumber: string;
    do {
      randomPart = Math.floor(100000 + Math.random() * 900000).toString();
      orderNumber = `${datePart}${randomPart}`;
    } while (await client.exists(orderNumber));

    await client.set(orderNumber, "1", "EX", 24 * 60 * 60);

    return orderNumber;
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}${month}${year}`;
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.redisClient.set(key, value, "EX", ttl);
  }

  async generateShortSmsCode(): Promise<string> {
    const client = this.redisClient;

    let randomPart: string;
    let smsCode: string;
    do {
      randomPart = Math.floor(1000 + Math.random() * 9000).toString();
      smsCode = randomPart;
    } while (await client.exists(smsCode));

    await client.set(smsCode, "1", "EX", 5 * 60);

    return smsCode;
  }
}
