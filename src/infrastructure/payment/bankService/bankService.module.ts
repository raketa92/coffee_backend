import { Module } from "@nestjs/common";
import { EnvModule } from "@infrastructure/env";
import { BankServiceImpl } from "./bank.service";
import { IBankService } from "@/application/shared/ports/IBankService";

@Module({
  imports: [EnvModule],
  providers: [
    BankServiceImpl,
    {
      provide: IBankService,
      useExisting: BankServiceImpl,
    },
  ],
  exports: [BankServiceImpl, IBankService],
})
export class BankServiceModule {}
