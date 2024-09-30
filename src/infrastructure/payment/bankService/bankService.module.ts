import { Module } from "@nestjs/common";
import { EnvModule } from "src/infrastructure/env";
import { BankService } from "./bankService";

@Module({
  imports: [EnvModule],
  providers: [BankService],
  exports: [BankService],
})
export class BankServiceModule {}
