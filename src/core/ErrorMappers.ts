import { InfraError, InfraErrorCode } from "@/application/shared/exception/infraError";
import { UseCaseError, UseCaseErrorCode } from "@/application/shared/exception/useCaseError";

export function mapUseCaseCodeToHttp(code: UseCaseErrorCode): number {
  switch (code) {
    case UseCaseErrorCode.BAD_REQUEST:     return 400;
    case UseCaseErrorCode.UNAUTHORIZED:    return 401;
    case UseCaseErrorCode.FORBIDDEN:       return 403;
    case UseCaseErrorCode.NOT_FOUND:       return 404;
    case UseCaseErrorCode.CONFLICT:        return 409;
    case UseCaseErrorCode.RATE_LIMITED:    return 429;
    case UseCaseErrorCode.TIMEOUT:         return 504;
    case UseCaseErrorCode.UNAVAILABLE:     return 503;
    case UseCaseErrorCode.INTERNAL:
    default:                               return 500;
  }
}

export function mapInfraToUseCase(err: InfraError): UseCaseError {
  switch (err.code) {
    case InfraErrorCode.DUPLICATE_KEY:
      return new UseCaseError({
        code: UseCaseErrorCode.CONFLICT,
        message: "Resource already exists",
        info: err.meta,
      });
    case InfraErrorCode.TIMEOUT:
      return new UseCaseError({
        code: UseCaseErrorCode.TIMEOUT,
        message: "Operation timed out",
        info: err.meta,
      });
    case InfraErrorCode.BAD_REQUEST:
      return new UseCaseError({
        code: UseCaseErrorCode.BAD_REQUEST,
        message: "Invalid request to data store",
        info: err.meta,
      });
    default:
      return new UseCaseError({
        code: UseCaseErrorCode.INTERNAL,
        message: "Internal error",
        info: err.meta,
      });
  }
}
