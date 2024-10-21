import { UniqueEntityID } from "@core/UniqueEntityID";
import { Entity } from "@core/Entity";

export interface IOrderItemProps {
  quantity: number;
  productId: UniqueEntityID;
}

export class OrderItem extends Entity<IOrderItemProps> {
  private readonly _quantity: number;
  private readonly _productId: UniqueEntityID;
  constructor(props: IOrderItemProps, guid?: UniqueEntityID) {
    super(guid);
    if (props.quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }
    this._quantity = props.quantity;
    this._productId = props.productId;
  }

  toJSON() {
    return {
      guid: this._guid.toValue(),
      quantity: this.quantity,
      productId: this.productId.toValue(),
    };
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get quantity(): number {
    return this._quantity;
  }

  get productId(): UniqueEntityID {
    return this._productId;
  }
}
