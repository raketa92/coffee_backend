import { OtpPurpose } from "@/core/constants";
import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface OtpTable {
  guid: string;
  otp: string;
  phone: string;
  payload?: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type OtpModel = Selectable<OtpTable>;
export type OtpCreateModel = Insertable<OtpTable>;
export type OtpUpdateModel = Updateable<OtpTable>;
