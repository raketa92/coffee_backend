import { Optional } from "@nestjs/common";
import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { CardProvider, PaymentMethods } from "@core/constants";

class Card {
  readonly cardNumber: string;
  readonly month: number;
  readonly year: number;
  readonly name: string;
  readonly cvv: number;
  readonly cardProvider: CardProvider;
}

export class OrderItem {
  @IsNumber()
  readonly quantity: number;
  @IsString()
  readonly productGuid: string;
}

export class CreateOrderDto {
  @IsString()
  @Optional()
  userGuid: string;
  @IsString()
  shopGuid: string;
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
