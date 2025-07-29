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
  ChangePasswordDto,
  changePasswordSchema,
  ChangePhoneDto,
  changePhoneSchema,
  UpdateProfileDto,
  updateProfileSchema,
} from "@/application/coffee_shop/usecases/user/dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ChangePhoneUseCase } from "@/application/coffee_shop/usecases/user/changePhone";
import { ChangePasswordUseCase } from "@/application/coffee_shop/usecases/user/changePassword";

@Controller("/user")
export class UserController {
  constructor(
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePhoneUseCase: ChangePhoneUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

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

  @Put("/change-phone/:userGuid")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async changePhone(
    @Param("userGuid") userGuid: string,
    @Body() changePhoneDto: ChangePhoneDto
  ) {
    const body = changePhoneSchema.parse({ ...changePhoneDto, userGuid });
    const response = await this.changePhoneUseCase.execute(body);
    return response;
  }

  @Put("/change-password/:userGuid")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async changePassword(
    @Param("userGuid") userGuid: string,
    @Body() dto: ChangePasswordDto
  ) {
    const body = changePasswordSchema.parse({ ...dto, userGuid });
    const response = await this.changePasswordUseCase.execute(body);
    return response;
  }
}
