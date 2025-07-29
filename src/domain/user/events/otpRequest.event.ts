import { OtpPurpose } from "@/core/constants";
import { IEvent } from "@/core/events/IEvent";

export class OTPRequestedEvent implements IEvent {
  constructor(
    readonly props: {
      purpose: OtpPurpose;
      phone: string;
      payload?: string;
    }
  ) {
    this.dateTimeOccurred = new Date();
    this.purpose = props.purpose;
    this.phone = props.phone;
    this.payload = props.payload;
  }
  readonly dateTimeOccurred: Date;
  public readonly purpose: OtpPurpose;
  public readonly phone: string;
  public readonly payload?: string;
}
