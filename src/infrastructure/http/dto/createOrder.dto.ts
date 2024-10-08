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
  readonly quantity: number;
  readonly product: Product;
}

class Product {
  readonly name: string;
  readonly price: number;
  readonly categoryId: string;
  readonly rating: number;
  readonly ingredients: string[];
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
