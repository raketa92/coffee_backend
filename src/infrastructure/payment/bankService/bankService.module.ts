import { Module } from "@nestjs/common";
import { EnvModule } from "@infrastructure/env";
import { BankService } from "./bank.service";

@Module({
  imports: [EnvModule],
  providers: [BankService],
  exports: [BankService],
})
export class BankServiceModule {}
