import { OtpPurpose } from "@/core/constants";
import { Entity } from "@/core/Entity";
import { UniqueEntityID } from "@/core/UniqueEntityID";

export interface IOtpProps {
  otp: string;
  phone: string;
  payload?: string | null;
  purpose: OtpPurpose;
  expiresAt?: Date;
}
export class OTP extends Entity<IOtpProps> {
  private readonly _otp: string;
  private readonly _phone: string;
  private readonly _payload?: string | null;
  private readonly _purpose: OtpPurpose;
  private _expiresAt: Date;
  private _changedFields: Set<keyof OTP> = new Set();

  private constructor(props: IOtpProps, guid?: UniqueEntityID) {
    super(guid);
    this._otp = props.otp;
    this._phone = props.phone;
    this._payload = props.payload;
    this._purpose = props.purpose;
    this._expiresAt = this.setExpireDate(props.expiresAt);
  }

  static create(props: IOtpProps, guid?: UniqueEntityID): OTP {
    return new OTP(props, guid);
  }

  setExpireDate(date?: Date): Date {
    const currentDate = new Date();
    const newDate = new Date().setMinutes(currentDate.getMinutes() + 10);
    return date || new Date(newDate);
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get otp(): string {
    return this._otp;
  }

  get purpose(): OtpPurpose {
    return this._purpose;
  }

  get phone(): string {
    return this._phone;
  }

  get payload(): string | undefined | null {
    return this._payload;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  addChangedFields(field: keyof IOtpProps) {
    this._changedFields.add(field);
  }

  clearChangedFields(): void {
    this._changedFields.clear();
  }

  get changedFields(): string[] {
    return Array.from(this._changedFields);
  }

  toJSON() {
    return {
      guid: this._guid.toString(),
      otp: this._otp,
      userGuid: this._phone,
      payload: this._payload,
      expiresAt: this._expiresAt,
    };
  }
}
