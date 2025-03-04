import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { catchError, map, Observable, throwError } from "rxjs";
import { LoggerService } from "@infrastructure/logger/logger";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    this.logger.info(`Incoming Request: ${request.method} ${request.url}`);
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context)),
      catchError((err: any) =>
        throwError(() => this.errorHandler(err, context))
      )
    );
  }
  responseHandler(res: unknown, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const statusCode = response.statusCode;

    return {
      status: true,
      path: request.url,
      statusCode,
      result: res,
    };
  }

  errorHandler(exception: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.logger.error(`Error: ${request.method} ${request.url}`, exception);

    let status = exception.code || HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    }

    let zodErrorMessages: string[] = [];
    if (exception.hasOwnProperty("issues")) {
      zodErrorMessages = exception.issues.map(
        (item: { message: string }) => item.message
      );
      status = 403;
    }
    response.status(status).json({
      status: false,
      statusCode: status,
      path: request.url,
      message: zodErrorMessages.length
        ? zodErrorMessages
        : exception?.response?.message || exception.message,
      result: null,
    });
    return exception;
  }
}
