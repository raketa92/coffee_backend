import { UniqueEntityID } from "src/core/UniqueEntityID";
import { Product } from "./product";
import { Entity } from "../../core/Entity";

export interface IOrderProductProps {
  orderId?: UniqueEntityID;
  quantity: number;
  product: Product;
}

export class OrderProduct extends Entity<IOrderProductProps> {
  private readonly _orderId?: UniqueEntityID;
  private readonly _quantity: number;
  private readonly _product: Product;
  constructor(props: IOrderProductProps, guid?: UniqueEntityID) {
    super(guid);
    this._orderId = props.orderId;
    this._quantity = props.quantity;
    this._product = props.product;
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get orderId(): UniqueEntityID | null {
    return this._orderId || null;
  }

  get quantity(): number {
    return this._quantity;
  }

  get product(): Product {
    return this._product;
  }
}
