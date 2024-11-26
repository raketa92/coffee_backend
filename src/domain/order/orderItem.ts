import { UniqueEntityID } from "@core/UniqueEntityID";
import { Entity } from "@core/Entity";

export interface IOrderItemProps {
  quantity: number;
  productGuid: UniqueEntityID;
}

export class OrderItem extends Entity<IOrderItemProps> {
  private readonly _quantity: number;
  private readonly _productGuid: UniqueEntityID;
  constructor(props: IOrderItemProps, guid?: UniqueEntityID) {
    super(guid);
    if (props.quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }
    this._quantity = props.quantity;
    this._productGuid = props.productGuid;
  }

  toJSON() {
    return {
      guid: this._guid.toValue(),
      quantity: this.quantity,
      productGuid: this._productGuid.toValue(),
    };
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get quantity(): number {
    return this._quantity;
  }

  get productGuid(): UniqueEntityID {
    return this._productGuid;
  }
}
