import { OrderStatus } from "@core/constants";

type OrderItem = {
  quantity: number;
  Product?: {
    name?: string;
    image?: string;
    price?: number;
    rating?: number;
    ingredients?: string[];
  };
};

export type OrderResponseDto = {
  orderNumber: string;
  status: OrderStatus;
  OrderItems: OrderItem[];
};

export type CreateOrderResponseDto = Omit<OrderResponseDto, "OrderItems">;
