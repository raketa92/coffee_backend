import { IEvent, Purpose } from "@/core/events/IEvent";

export class OTPRequestedEvent implements IEvent {
  constructor(
    public readonly props: {
      purpose: Purpose;
      phone: string;
      payload?: string;
    }
  ) {
    this.dateTimeOccurred = new Date();
    this.purpose = props.purpose;
    this.phone = props.phone;
    this.payload = props.payload;
  }
  public readonly dateTimeOccurred: Date;
  public readonly purpose: Purpose;
  public readonly phone: string;
  public readonly payload?: string;
}
