import { EmailVerificationPurpose } from "@/core/constants";
import { IEvent } from "@/core/events/IEvent";

export interface IEmailRequestedEventProps {
  purpose: EmailVerificationPurpose;
  email: string;
  payload: string;
}

export class EmailRequestedEvent implements IEvent {
  readonly dateTimeOccurred: Date;
  readonly purpose: EmailVerificationPurpose;
  readonly email: string;
  readonly payload: string;

  constructor({ purpose, email: phone, payload }: IEmailRequestedEventProps) {
    this.dateTimeOccurred = new Date();
    this.purpose = purpose;
    this.email = phone;
    this.payload = payload;
  }
}
