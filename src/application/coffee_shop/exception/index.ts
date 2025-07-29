export const UseCaseErrorMessage = {
  payload_required: "Create order payload is required",
  create_order_error: "Error creating order",
  productNotExist: (productGuid: string) =>
    `Product with ID ${productGuid} does not exist.`,
  product_not_found: "Product not found",
  order_not_found: "Order not found",
  shop_not_found: "Shop not found",
  payment_not_found: "Payment not found",
  user_not_found: "User not found",
  profile_update_error: "Profile update error",
  phone_change_error: "Phone change error",
  password_change_error: "Password change error",
  invalid_date: "Invalid date",
  wrong_password: "Password is wrong",
};
