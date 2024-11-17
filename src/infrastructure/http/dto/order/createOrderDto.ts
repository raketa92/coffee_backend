import { z } from "zod";
import { Optional } from "@nestjs/common";
import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { CardProvider, PaymentMethods } from "@core/constants";

class Card {
  readonly cardNumber!: string;
  readonly month!: number;
  readonly year!: number;
  readonly name!: string;
  readonly cvv!: number;
  readonly cardProvider!: CardProvider;
}

export class OrderItem {
  @IsNumber()
  readonly quantity!: number;
  @IsString()
  readonly productGuid!: string;
}

export class CreateOrderDto2 {
  @ValidateIf((dto) => {
    console.log(`✅  typeof dto.userGuid:`, typeof dto.userGuid);
    return typeof dto.userGuid !== "undefined";
  })
  @IsString()
  @Optional()
  userGuid?: string;
  @ValidateIf((dto) => {
    console.log(`✅  dto:`, dto);
    console.log(`✅  typeof dto.shopGuid:`, typeof dto.shopGuid);
    return typeof dto.shopGuid === "undefined";
  })
  @IsString()
  shopGuid!: string;
  @IsString()
  phone!: string;
  @IsString()
  address!: string;
  @IsString()
  paymentMethod!: PaymentMethods;
  @Type(() => Card)
  @ValidateNested()
  @IsOptional()
  card?: Card;
  @IsNumber()
  totalPrice!: number;
  @Type(() => OrderItem)
  @ValidateNested()
  orderItems!: OrderItem[];
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
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
