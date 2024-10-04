import { UniqueEntityID } from "src/core/UniqueEntityID";
import { Product } from "./product";
import { Entity } from "../../core/Entity";

export interface IOrderItemProps {
  orderGuid?: UniqueEntityID;
  quantity: number;
  product: Product;
}

export class OrderItem extends Entity<IOrderItemProps> {
  private readonly _orderGuid?: UniqueEntityID;
  private readonly _quantity: number;
  private readonly _product: Product;
  constructor(props: IOrderItemProps, guid?: UniqueEntityID) {
    super(guid);
    this._orderGuid = props.orderGuid;
    this._quantity = props.quantity;
    this._product = props.product;
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get orderGuid(): UniqueEntityID | null {
    return this._orderGuid || null;
  }

  get quantity(): number {
    return this._quantity;
  }

  get product(): Product {
    return this._product;
  }
}
