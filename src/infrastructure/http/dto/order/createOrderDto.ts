import { z } from "zod";
import { IsNumber, IsString } from "class-validator";
import { CardProvider, PaymentMethods } from "@core/constants";

export class OrderItem {
  @IsNumber()
  readonly quantity!: number;
  @IsString()
  readonly productGuid!: string;
}

export const createOrderSchema = z.object({
  userGuid: z.string().uuid().optional().nullable(),
  shopGuid: z.string().uuid(),
  phone: z.string(),
  address: z.string(),
  paymentMethod: z.nativeEnum(PaymentMethods),
  card: z
    .object({
      cardNumber: z.string(),
      month: z.number().int().min(1).max(12),
      year: z.number().int(),
      name: z.string(),
      cvv: z.number().int(),
      cardProvider: z.nativeEnum(CardProvider),
    })
    .optional()
    .nullable(),
  totalPrice: z.number(),
  orderItems: z.array(
    z.object({
      quantity: z.number().int(),
      productGuid: z.string().uuid(),
    })
  ),
  deliveryDateTime: z.coerce.date(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
