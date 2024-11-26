import { OrderStatus, PaymentMethods } from "@core/constants";
import { UniqueEntityID } from "@core/UniqueEntityID";
import { AggregateRoot } from "@core/AggregateRoot";
import { OrderItem } from "@domain/order/orderItem";
import { Card } from "@domain/order/card";
import {
  DomainError,
  DomainErrorCode,
  DomainErrorMessage,
} from "@domain/exception";

export interface IOrderProps {
  orderNumber: string;
  userGuid?: UniqueEntityID | null;
  shopGuid: UniqueEntityID;
  phone: string;
  address: string;
  totalPrice: number;
  status: OrderStatus;
  paymentGuid?: UniqueEntityID | null;
  paymentMethod: PaymentMethods;
  card?: Card | null;
  orderItems: OrderItem[];
}

export class Order extends AggregateRoot<IOrderProps> {
  private readonly _orderNumber: string;
  private readonly _userGuid?: UniqueEntityID | null;
  private readonly _shopGuid: UniqueEntityID;
  private readonly _phone: string;
  private readonly _address: string;
  private readonly _totalPrice: number;
  private _status: OrderStatus;
  private _paymentGuid?: UniqueEntityID | null;
  private readonly _paymentMethod: PaymentMethods;
  private readonly _card?: Card | null;
  private readonly _orderItems: OrderItem[];
  private _isDirty: boolean = false;

  constructor(props: IOrderProps, guid?: UniqueEntityID) {
    super(guid);
    this._orderNumber = props.orderNumber;
    this._userGuid = props.userGuid;
    this._shopGuid = props.shopGuid;
    this._phone = props.phone;
    this._address = props.address;
    this._totalPrice = props.totalPrice;
    this._status = props.status;
    this._paymentGuid = props.paymentGuid;
    this._paymentMethod = props.paymentMethod;
    this._card = props.card || null;
    this._isDirty = false;
    this._orderItems = props.orderItems;

    if (this._totalPrice < 0) {
      throw new DomainError({
        code: DomainErrorCode.BAD_REQUEST,
        message: DomainErrorMessage.total_price_cant_be_negative,
      });
    }
  }

  private markDirty() {
    this._isDirty = true;
  }

  changeStatus(newStatus: OrderStatus) {
    if (this._status === OrderStatus.completed) {
      throw new Error("Order can't be changed after it's completed");
    }
    this._status = newStatus;
    this.markDirty();
  }

  assignPayment(paymentGuid: UniqueEntityID) {
    if (this._paymentMethod !== PaymentMethods.card) {
      throw new DomainError({
        code: DomainErrorCode.BAD_REQUEST,
        message: DomainErrorMessage.payment_method_must_be_card,
      });
    }
    if (this.card) {
      this._paymentGuid = paymentGuid;
      this.markDirty();
    }
  }

  toJSON() {
    return {
      guid: this._guid.toString(),
      orderNumber: this._orderNumber,
      userGuid: this._userGuid?.toString(),
      shopGuid: this._shopGuid.toString(),
      phone: this._phone,
      address: this._address,
      totalPrice: this._totalPrice,
      status: this._status,
      paymentGuid: this._paymentGuid?.toString(),
      paymentMethod: this._paymentMethod,
      card: this._card,
      orderItems: this._orderItems,
      isDirty: this._isDirty,
    };
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get orderNumber(): string {
    return this._orderNumber;
  }

  get userGuid(): UniqueEntityID | null {
    return this._userGuid || null;
  }

  get shopGuid(): UniqueEntityID {
    return this._shopGuid;
  }

  get phone(): string {
    return this._phone;
  }

  get address(): string {
    return this._address;
  }

  get totalPrice(): number {
    return this._totalPrice;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get paymentGuid(): UniqueEntityID | null {
    return this._paymentGuid || null;
  }

  get paymentMethod(): PaymentMethods {
    return this._paymentMethod;
  }

  get card(): Card | null {
    return this._card || null;
  }

  get orderItems(): OrderItem[] {
    return this._orderItems;
  }

  get isDirty(): boolean {
    return this._isDirty;
  }
}
