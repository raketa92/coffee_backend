import { Optional } from "@nestjs/common";
import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CardProvider, PaymentMethods } from "src/core/constants";

class Card {
  readonly cardNumber: string;
  readonly month: number;
  readonly year: number;
  readonly name: string;
  readonly cvv: number;
  readonly cardProvider: CardProvider;
}

class OrderItem {
  @IsNumber()
  readonly quantity: number;
  @IsString()
  readonly productId: string;
}

export class CreateOrderDto {
  @IsString()
  @Optional()
  userId: string;
  @IsString()
  shopId: string;
  @IsString()
  phone: string;
  @IsString()
  address: string;
  @IsString()
  paymentMethod: PaymentMethods;
  @Type(() => Card)
  @ValidateNested()
  @IsOptional()
  card?: Card;
  @IsNumber()
  totalPrice: number;
  @Type(() => OrderItem)
  @ValidateNested()
  orderItems: OrderItem[];
}
