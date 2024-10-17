export const UseCaseErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type UseCaseErrorCode =
  (typeof UseCaseErrorCode)[keyof typeof UseCaseErrorCode];

export const UseCaseErrorMessage = {
  payload_required: "Create order payload is required",
  create_order_error: "Error creating order",
};

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
    super();

    this.code = params.code;
    this.message = params.message;
    this.info = params.info || null;
  }
}
