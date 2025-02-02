export const UseCaseErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  NOT_FOUND: "NOT_FOUND",
} as const;

export type UseCaseErrorCode =
  (typeof UseCaseErrorCode)[keyof typeof UseCaseErrorCode];

export const UseCaseErrorMessage = {
  payload_required: "Create order payload is required",
  create_order_error: "Error creating order",
  productNotExist: (productGuid: string) =>
    `Product with ID ${productGuid} does not exist.`,
  product_not_found: "Product not found",
  shop_not_found: "Shop not found",
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
    super(params.message);

    this.code = params.code;
    this.message = params.message;
    this.info = params.info || undefined;
  }
}
