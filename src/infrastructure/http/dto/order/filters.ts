import { Transform } from "class-transformer";
import { IsArray, IsOptional, IsString } from "class-validator";

export class OrderFilterDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(","))
  orderNumbers?: string;
}
