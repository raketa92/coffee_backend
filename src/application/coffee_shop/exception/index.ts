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
  order_not_found: "Order not found",
  shop_not_found: "Shop not found",
  payment_not_found: "Payment not found",
  register_user_error: "Error registering user",
  user_not_found: "User not found",
  wrong_password: "Password or phone is wrong",
  login_user_error: "Login user error",
  refresh_token_error: "Refresh token error",
  user_already_exists: "User already exists",
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
