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
};
