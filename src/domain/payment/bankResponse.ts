import { UniqueEntityID } from "../../core/UniqueEntityID";
import { Entity } from "../../core/Entity";

export interface IBankResponseProps {
  paymentId: UniqueEntityID;
  errorCode: string | null;
  errorMessage: string | null;
  orderNumber: string;
  orderStatus: number;
  actionCode: number | null;
  amount: number;
  currency: string;
  date: string;
  ip: string | null;
  orderDescription: string | null;
  merchantOrderParams: string[] | null;
  attributes: string[] | null;
  cardAuthInfo: object | null;
  authDateTime: string | null;
  terminalId: string | null;
  authRefNum: string | null;
  paymentAmountInfo: object | null;
  bankInfo: object | null;
  createdAt: Date;
  updatedAt: Date;
}

export class BankResponse extends Entity<IBankResponseProps> {
  private readonly _paymentId: UniqueEntityID;
  private readonly _errorCode: string | null;
  private readonly _errorMessage: string | null;
  private readonly _orderNumber: string;
  private readonly _orderStatus: number;
  private readonly _actionCode: number | null;
  private readonly _amount: number;
  private readonly _currency: string;
  private readonly _date: string;
  private readonly _ip: string | null;
  private readonly _orderDescription: string | null;
  private readonly _merchantOrderParams: string[] | null;
  private readonly _attributes: string[] | null;
  private readonly _cardAuthInfo: object | null;
  private readonly _authDateTime: string | null;
  private readonly _terminalId: string | null;
  private readonly _authRefNum: string | null;
  private readonly _paymentAmountInfo: object | null;
  private readonly _bankInfo: object | null;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  constructor(props: IBankResponseProps, guid?: UniqueEntityID) {
    super(guid);
    this._paymentId = props.paymentId;
    this._errorCode = props.errorCode;
    this._errorMessage = props.errorMessage;
    this._orderNumber = props.orderNumber;
    this._orderStatus = props.orderStatus;
    this._actionCode = props.actionCode;
    this._amount = props.amount;
    this._currency = props.currency;
    this._date = props.date;
    this._ip = props.ip;
    this._orderDescription = props.orderDescription;
    this._merchantOrderParams = props.merchantOrderParams;
    this._attributes = props.attributes;
    this._cardAuthInfo = props.cardAuthInfo;
    this._authDateTime = props.authDateTime;
    this._terminalId = props.terminalId;
    this._authRefNum = props.authRefNum;
    this._paymentAmountInfo = props.paymentAmountInfo;
    this._bankInfo = props.bankInfo;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get paymentId(): UniqueEntityID {
    return this._paymentId;
  }
  get errorCode(): string | null {
    return this._errorCode;
  }
  get errorMessage(): string | null {
    return this._errorMessage;
  }
  get orderNumber(): string {
    return this._orderNumber;
  }
  get orderStatus(): number {
    return this._orderStatus;
  }
  get actionCode(): number | null {
    return this._actionCode;
  }
  get amount(): number {
    return this._amount;
  }
  get currency(): string {
    return this._currency;
  }
  get date(): string {
    return this._date;
  }
  get ip(): string | null {
    return this._ip;
  }
  get orderDescription(): string | null {
    return this._orderDescription;
  }
  get merchantOrderParams(): string[] | null {
    return this._merchantOrderParams;
  }
  get attributes(): string[] | null {
    return this._attributes;
  }
  get cardAuthInfo(): object | null {
    return this._cardAuthInfo;
  }
  get authDateTime(): string | null {
    return this._authDateTime;
  }
  get terminalId(): string | null {
    return this._terminalId;
  }
  get authRefNum(): string | null {
    return this._authRefNum;
  }
  get paymentAmountInfo(): object | null {
    return this._paymentAmountInfo;
  }
  get bankInfo(): object | null {
    return this._bankInfo;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
