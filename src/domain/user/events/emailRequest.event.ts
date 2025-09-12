import { EmailVerificationPurpose } from "@/core/constants";
import { IEvent } from "@/core/events/IEvent";

export interface IEmailRequestedEventProps {
  purpose: EmailVerificationPurpose;
  email: string;
}

export class EmailVerificationRequestedEvent implements IEvent {
  readonly dateTimeOccurred: Date;
  readonly purpose: EmailVerificationPurpose;
  readonly email: string;

  constructor({ purpose, email: phone }: IEmailRequestedEventProps) {
    this.dateTimeOccurred = new Date();
    this.purpose = purpose;
    this.email = phone;
  }
}
