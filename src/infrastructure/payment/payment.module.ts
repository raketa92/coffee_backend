import { Module } from "@nestjs/common";
import { BankServiceModule } from "./bankService/bankService.module";

@Module({
  imports: [BankServiceModule],
  exports: [BankServiceModule],
})
export class PaymentModule {}
