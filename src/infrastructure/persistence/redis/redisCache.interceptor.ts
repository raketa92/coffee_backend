import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { RedisService } from "./redis.service";
import { Observable, of, tap } from "rxjs";

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Promise<Observable<any>> {
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
        await this.redisService.set(cacheKey, value, 60 * 5);
      })
    );
  }
}
