import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { RedisService } from "./redis.service";
import { Observable, of, tap } from "rxjs";
import { EnvService } from "@/infrastructure/env";

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  private cacheEnabled: boolean;
  private ttl: number;
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: EnvService
  ) {
    this.cacheEnabled = this.configService.get("CACHE_ENABLED");
    this.ttl = this.configService.get("CACHE_TTL");
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Promise<Observable<any>> {
    if (!this.cacheEnabled) {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    const { url, method } = request;

    if (method !== "GET") {
      return next.handle();
    }

    const cacheKey = url;
    const cachedResponse = await this.redisService.get(cacheKey);
    if (cachedResponse) {
      return of(JSON.parse(cachedResponse));
    }

    return next.handle().pipe(
      tap(async (response) => {
        const value = JSON.stringify(response);
        await this.redisService.set(cacheKey, value, this.ttl);
      })
    );
  }
}
