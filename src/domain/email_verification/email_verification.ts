import { EmailVerificationPurpose } from "@/core/constants";
import { Entity } from "@/core/Entity";
import { UniqueEntityID } from "@/core/UniqueEntityID";

export interface IEmailProps {
  otp: string;
  email: string;
  purpose: EmailVerificationPurpose;
  expiresAt?: Date;
}
export class EmailVerification extends Entity<IEmailProps> {
  private readonly _otp: string;
  private readonly _email: string;
  private readonly _purpose: EmailVerificationPurpose;
  private _expiresAt: Date;
  private _changedFields: Set<keyof IEmailProps> = new Set();

  private constructor(props: IEmailProps, guid?: UniqueEntityID) {
    super(guid);
    this._otp = props.otp;
    this._email = props.email;
    this._purpose = props.purpose;
    this._expiresAt = this.setExpireDate(props.expiresAt);
  }

  static create(props: IEmailProps, guid?: UniqueEntityID): EmailVerification {
    return new EmailVerification(props, guid);
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

  get email(): string {
    return this._email;
  }

  get purpose(): EmailVerificationPurpose {
    return this._purpose;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  addChangedFields(field: keyof IEmailProps) {
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
      email: this._email,
      expiresAt: this._expiresAt,
    };
  }
}
