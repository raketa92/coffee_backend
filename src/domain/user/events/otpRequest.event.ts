import { OtpPurpose } from "@/core/constants";
import { IEvent } from "@/core/events/IEvent";

export interface IOTPRequestedEventProps {
  purpose: OtpPurpose;
  phone: string;
  payload?: string;
}

export class OTPRequestedEvent implements IEvent {
  readonly dateTimeOccurred: Date;
  readonly purpose: OtpPurpose;
  readonly phone: string;
  readonly payload?: string;

  constructor({ purpose, phone, payload }: IOTPRequestedEventProps) {
    this.dateTimeOccurred = new Date();
    this.purpose = purpose;
    this.phone = phone;
    this.payload = payload;
  }
}
