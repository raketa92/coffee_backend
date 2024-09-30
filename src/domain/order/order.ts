import { OrderStatus, PaymentMethods } from "../../core/constants";
import { UniqueEntityID } from "../../core/UniqueEntityID";
import { AggregateRoot } from "../../core/AggregateRoot";
import { OrderProduct } from "./orderProduct";
import { Card } from "./card";

export interface IOrderProps {
  orderNumber: string;
  userId?: UniqueEntityID | null;
  shopId: UniqueEntityID;
  phone: string;
  address: string;
  totalPrice: number;
  status: OrderStatus;
  paymentId?: UniqueEntityID | null;
  paymentMethod: PaymentMethods;
  card?: Card | null;
  orderProducts: OrderProduct[];
}

export class Order extends AggregateRoot<IOrderProps> {
  private readonly _orderNumber: string;
  private readonly _userId?: UniqueEntityID | null;
  private readonly _shopId: UniqueEntityID;
  private readonly _phone: string;
  private readonly _address: string;
  private readonly _totalPrice: number;
  private readonly _status: OrderStatus;
  private readonly _paymentId?: UniqueEntityID | null;
  private readonly _paymentMethod: PaymentMethods;
  private readonly _card?: Card | null;
  private readonly _orderProducts: OrderProduct[];
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: IOrderProps, guid?: UniqueEntityID) {
    super(guid);
    this._orderNumber = props.orderNumber;
    this._userId = props.userId;
    this._shopId = props.shopId;
    this._phone = props.phone;
    this._address = props.address;
    this._totalPrice = props.totalPrice;
    this._status = props.status;
    this._paymentId = props.paymentId;
    this._paymentMethod = props.paymentMethod;
    this._card = props.card || null;
    this._orderProducts = props.orderProducts;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get orderNumber(): string {
    return this._orderNumber;
  }

  get userId(): UniqueEntityID | null {
    return this._userId || null;
  }

  get shopId(): UniqueEntityID {
    return this._shopId;
  }

  get totalPrice(): number {
    return this._totalPrice;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get paymentId(): UniqueEntityID | null {
    return this._paymentId || null;
  }

  get paymentMethod(): PaymentMethods {
    return this._paymentMethod;
  }

  get card(): Card | null {
    return this._card || null;
  }

  get orderProducts(): OrderProduct[] {
    return this._orderProducts;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
