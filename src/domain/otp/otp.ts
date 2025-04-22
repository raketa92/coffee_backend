import { OtpPurpose } from "@/core/constants";
import { Entity } from "@/core/Entity";
import { UniqueEntityID } from "@/core/UniqueEntityID";

export interface IOtpProps {
  otp: string;
  userGuid: UniqueEntityID;
  payload?: string;
  purpose: OtpPurpose;
  expiresAt?: Date;
}
export class OTP extends Entity<IOtpProps> {
  private readonly _otp: string;
  private readonly _userGuid: UniqueEntityID;
  private readonly _payload?: string;
  private readonly _purpose: OtpPurpose;
  private _expiresAt: Date;
  private _changedFields: Set<keyof OTP> = new Set();

  private constructor(props: IOtpProps, guid?: UniqueEntityID) {
    super(guid);
    this._otp = props.otp;
    this._userGuid = props.userGuid;
    this._payload = props.payload;
    this._purpose = props.purpose;
    this._expiresAt = this.setExpireDate(props.expiresAt);
  }

  static create(props: IOtpProps, guid?: UniqueEntityID): OTP {
    return new OTP(props, guid);
  }

  setExpireDate(date?: Date): Date {
    const currentDate = new Date();
    const newDate = new Date().setDate(currentDate.getDate() + 1);
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

  get userGuid(): UniqueEntityID {
    return this._userGuid;
  }

  get payload(): string | undefined {
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
      userGuid: this._userGuid,
      payload: this._payload,
      expiresAt: this._expiresAt,
    };
  }
}
