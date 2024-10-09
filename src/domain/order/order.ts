import { OrderStatus, PaymentMethods } from "../../core/constants";
import { UniqueEntityID } from "../../core/UniqueEntityID";
import { AggregateRoot } from "../../core/AggregateRoot";
import { OrderItem } from "./orderItem";
import { Card } from "./card";

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
  private readonly _status: OrderStatus;
  private readonly _paymentGuid?: UniqueEntityID | null;
  private readonly _paymentMethod: PaymentMethods;
  private readonly _card?: Card | null;
  private readonly _orderItems: OrderItem[];
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

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
    this._orderItems = props.orderItems;
    this._createdAt = new Date();
    this._updatedAt = new Date();
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

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
