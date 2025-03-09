import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { UpdateProfileUseCase } from "@/application/coffee_shop/usecases/user/updateProfile";
import {
  UpdateProfileDto,
  updateProfileSchema,
} from "@/application/coffee_shop/usecases/user/dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("/user")
export class UserController {
  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {}

  @Put("/profile/:userGuid")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async register(
    @Param("userGuid") userGuid: string,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const body = updateProfileSchema.parse({ ...updateProfileDto, userGuid });
    const response = await this.updateProfileUseCase.execute(body);
    return response;
  }
}
