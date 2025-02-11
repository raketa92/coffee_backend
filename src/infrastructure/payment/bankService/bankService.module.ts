import { Module } from "@nestjs/common";
import { EnvModule } from "@infrastructure/env";
import { BankServiceImpl } from "./bank.service";

@Module({
  imports: [EnvModule],
  providers: [BankServiceImpl],
  exports: [BankServiceImpl],
})
export class BankServiceModule {}
