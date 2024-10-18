import { IsNumber, IsString } from "class-validator";
import { CardProvider, PaytmentFor } from "@core/constants";

export class MakePaymentDto {
  @IsString()
  paymentFor: PaytmentFor;
  @IsString()
  cardProvider: CardProvider;
  @IsString()
  orderNumber: string;
  @IsNumber()
  amount: number;
  @IsNumber()
  currency: number;
  @IsString()
  description: string;
}
