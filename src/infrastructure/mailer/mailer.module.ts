import { Module } from "@nestjs/common";
import { EnvModule } from "../env";
import { IEmailSender } from "@/application/shared/ports/IEmailSender";
import { NodemailerEmailSender } from "./mailer.service";

@Module({
  imports: [EnvModule],
  providers: [{ provide: IEmailSender, useClass: NodemailerEmailSender }],
  exports: [IEmailSender],
})
export class MailerModule {}
