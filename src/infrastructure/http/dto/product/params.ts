import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  categoryGuid?: string;
  @IsOptional()
  @IsString()
  shopGuid?: string;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === "true";
  })
  isNew?: boolean;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === "true";
  })
  isPopular?: boolean;
}
