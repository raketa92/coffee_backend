import { Optional } from "@nestjs/common";
import { IsString } from "class-validator";

export class ApplySmsDto {
  @IsString()
  @Optional()
  userId: string;
  @IsString()
  orderId: string;
  @IsString()
  phone: string;
  @IsString()
  smsBody: string;
}
