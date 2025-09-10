import { Controller, Get, Query } from "@nestjs/common";
import { ProcessChangeEmailResponseUseCase } from "@/application/email_verification/usecases/processChangeEmailResponse";

@Controller("email")
export class EmailController {
  constructor(
    private readonly processChangeEmailUseCase: ProcessChangeEmailResponseUseCase
  ) {}

  @Get("/verify")
  async handleChangeEmailResponse(@Query("token") token: string) {
    return await this.processChangeEmailUseCase.execute(token);
  }
}
