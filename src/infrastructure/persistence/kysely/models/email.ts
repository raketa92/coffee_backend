import { EmailVerificationPurpose } from "@/core/constants";
import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface EmailVerificationTable {
  guid: string;
  email: string;
  payload?: string | null;
  purpose: EmailVerificationPurpose;
  expiresAt: Date;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type EmailVerificationModel = Selectable<EmailVerificationTable>;
export type EmailVerificationCreateModel = Insertable<EmailVerificationTable>;
export type EmailVerificationUpdateModel = Updateable<EmailVerificationTable>;
