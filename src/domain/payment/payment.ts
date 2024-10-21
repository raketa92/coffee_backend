import { UniqueEntityID } from "@core/UniqueEntityID";
import { CardProvider, PaytmentFor } from "@core/constants";
import { AggregateRoot } from "@core/AggregateRoot";

export interface IPaymentProps {
  paymentFor: PaytmentFor;
  cardProvider: CardProvider;
  status: string;
  orderGuid: UniqueEntityID;
  bankOrderId: string;
  amount: number;
  currency: number;
  description?: string;
}

export class Payment extends AggregateRoot<IPaymentProps> {
  private readonly _paymentFor: PaytmentFor;
  private readonly _cardProvider: CardProvider;
  private readonly _status: string;
  private readonly _orderGuid: UniqueEntityID;
  private readonly _bankOrderId: string;
  private readonly _amount: number;
  private readonly _currency: number;
  private readonly _description?: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  constructor(props: IPaymentProps, guid?: UniqueEntityID) {
    super(guid);
    this._paymentFor = props.paymentFor;
    this._cardProvider = props.cardProvider;
    this._status = props.status;
    this._orderGuid = props.orderGuid;
    this._bankOrderId = props.bankOrderId;
    this._amount = props.amount;
    this._currency = props.currency;
    this._description = props.description;
  }

  toJSON() {
    return {
      guid: this._guid.toString(),
      paymentFor: this._paymentFor,
      cardProvider: this._cardProvider,
      status: this._status,
      orderGuid: this._orderGuid.toString(),
      bankOrderId: this._bankOrderId,
      amount: this._amount,
      currency: this._currency,
      description: this._description,
    };
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get paymentFor(): PaytmentFor {
    return this._paymentFor;
  }

  get cardProvider(): CardProvider {
    return this._cardProvider;
  }

  get status(): string {
    return this._status;
  }

  get orderGuid(): UniqueEntityID {
    return this._orderGuid;
  }

  get bankOrderId(): string {
    return this._bankOrderId;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): number {
    return this._currency;
  }

  get description(): string | undefined {
    return this._description;
  }
}
