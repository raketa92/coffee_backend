import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { EnvService } from "../env";
import {
  IEmailSender,
  ISendEmailPayload,
} from "@/application/shared/ports/IEmailSender";

@Injectable()
export class NodemailerEmailSender implements IEmailSender {
  private transporter: nodemailer.Transporter;

  constructor(private readonly env: EnvService) {
    this.transporter = nodemailer.createTransport({
      host: this.env.get("SMTP_HOST"),
      port: Number(this.env.get("SMTP_PORT") ?? 587),
      secure: this.env.get("SMTP_SECURE") === true,
      auth: {
        user: this.env.get("SMTP_USER"),
        pass: this.env.get("SMTP_PASS"),
      },
    });
  }

  async send(payload: ISendEmailPayload): Promise<void> {
    const from = "no-reply@example.com";
    const to = Array.isArray(payload.to) ? payload.to.join(",") : payload.to;

    await this.transporter.sendMail({
      from,
      to,
      subject: payload.content.subject,
      text: payload.content.text,
      html: payload.content.html,
    });
  }
}
