import { Entity } from "@core/Entity";
import { UniqueEntityID } from "@core/UniqueEntityID";
import {
  DomainError,
  DomainErrorCode,
  DomainErrorMessage,
} from "@domain/exception";

export interface IShopProps {
  name: string;
  image: string;
  rating: number;
}

export class Shop extends Entity<IShopProps> {
  private readonly _name: string;
  private readonly _image: string;
  private readonly _rating: number;

  constructor(props: IShopProps, guid?: UniqueEntityID) {
    super(guid);
    this._name = props.name;
    this._image = props.image;
    this._rating = props.rating;
    if (this._rating < 0) {
      throw new DomainError({
        code: DomainErrorCode.BAD_REQUEST,
        message: DomainErrorMessage.rating_be_negative,
      });
    }
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get name(): string {
    return this._name;
  }

  get image(): string {
    return this._image;
  }

  get rating(): number {
    return this._rating;
  }
}
