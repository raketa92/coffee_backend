import { AggregateRoot } from "@/core/AggregateRoot";
import { UniqueEntityID } from "@/core/UniqueEntityID";

export interface IUserProps {
  password: string;
  email?: string | null;
  phone: string;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  roles: string[];
  isVerified: boolean;
  isActive: boolean;
  lastLogin: Date;
}

export class User extends AggregateRoot<IUserProps> {
  private _password: string;
  private _email?: string | null;
  private _phone: string;
  private _userName?: string | null;
  private _firstName?: string | null;
  private _lastName?: string | null;
  private _gender?: string | null;
  private _roles: string[];
  private _isVerified: boolean;
  private _isActive: boolean;
  private _lastLogin: Date;
  private _refreshToken?: string | null;
  private _changedFields: Set<keyof User> = new Set();

  constructor(props: IUserProps, guid?: UniqueEntityID) {
    super(guid);
    this._password = props.password;
    this._email = props.email;
    this._phone = props.phone;
    this._userName = props.userName;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._gender = props.gender;
    this._roles = props.roles;
    this._isVerified = props.isVerified;
    this._isActive = props.isActive;
    this._lastLogin = props.lastLogin;
  }

  private addChangedFields(field: keyof User) {
    this._changedFields.add(field);
  }

  clearChangedFields(): void {
    this._changedFields.clear();
  }

  setRefreshToken(token: string) {
    this._refreshToken = token;
  }

  setLastLogin(payload: Date): void {
    this._lastLogin = payload;
  }

  removeRefreshToken() {
    this._refreshToken = null;
  }

  toJSON() {
    return {
      guid: this._guid.toString(),
      password: this._password,
      email: this._email,
      phone: this._phone,
      refreshToken: this._refreshToken,
      userName: this._userName,
      firstName: this._firstName,
      lastName: this._lastName,
      gender: this._gender,
      roles: this._roles,
      isVerified: this._isVerified,
      isActive: this._isActive,
      lastLogin: this._lastLogin,
    };
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get refreshToken(): string | null {
    return this._refreshToken || null;
  }

  get password(): string {
    return this._password;
  }

  get email(): string | null {
    return this._email || null;
  }

  get phone(): string {
    return this._phone;
  }

  get userName(): string | null {
    return this._userName || null;
  }

  get firstName(): string | null {
    return this._firstName || null;
  }

  get lastName(): string | null {
    return this._lastName || null;
  }

  get gender(): string | null {
    return this._gender || null;
  }

  get roles(): string[] {
    return this._roles;
  }

  get isVerified(): boolean {
    return this._isVerified;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLogin(): Date {
    return this._lastLogin;
  }

  get changedFields(): string[] {
    return Array.from(this._changedFields);
  }
}
