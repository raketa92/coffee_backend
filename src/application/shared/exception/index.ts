export const UseCaseErrorCode = {
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
} as const;

export type UseCaseErrorCode =
  (typeof UseCaseErrorCode)[keyof typeof UseCaseErrorCode];

interface UseCaseErrorParams {
  info?: { [key: string]: unknown };
  code: UseCaseErrorCode;
  message: string;
}

export class UseCaseError extends Error {
  info?: { [key: string]: unknown } | null;
  code: UseCaseErrorCode;
  message: string;
  constructor(params: UseCaseErrorParams) {
    super(params.message);

    this.code = params.code;
    this.message = params.message;
    this.info = params.info || undefined;
  }
}

export const UseCaseCommonErrorMessage = {
  user_not_found: "User not found",
};
