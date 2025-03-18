import { OrderStatus } from "@core/constants";

type OrderItem = {
  quantity: number;
  Product?: {
    guid?: string;
    name?: string;
    image?: string;
    price?: number;
    rating?: number;
    ingredients?: string[];
  };
};

export type OrderResponseDto = {
  guid: string;
  orderNumber: string;
  status: OrderStatus;
  shopName: string;
  shopRating: number;
  totalPrice: number;
  date: Date;
  deliveryDateTime: Date;
  OrderItems: OrderItem[];
};

export type CreateOrderResponseDto = Omit<
  OrderResponseDto,
  "OrderItems" | "shopName" | "shopRating" | "date"
> & {
  formUrl?: string;
};

export type CheckOrderResponseDto = Pick<OrderResponseDto, "status">;
