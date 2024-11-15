import { IsNumber, IsOptional, IsString } from "class-validator";

export class PaymentDto {
  @IsNumber()
  currency!: number;
  @IsString()
  language!: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsString()
  orderNumber!: string;
  @IsString()
  userName!: string;
  @IsString()
  password!: string;
  @IsNumber()
  amount!: number;
  @IsString()
  returnUrl!: string;
}
