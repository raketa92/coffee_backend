import { Entity } from "@core/Entity";
import { UniqueEntityID } from "@core/UniqueEntityID";
import {
  DomainError,
  DomainErrorCode,
  DomainErrorMessage,
} from "@domain/exception";

export interface IProductProps {
  name: string;
  image: string;
  price: number;
  categoryGuid: UniqueEntityID;
  shopGuid: UniqueEntityID;
  rating: number;
  ingredients: string[] | null;
}

export class Product extends Entity<IProductProps> {
  private readonly _name: string;
  private readonly _image: string;
  private readonly _price: number;
  private readonly _categoryGuid: UniqueEntityID;
  private readonly _shopGuid: UniqueEntityID;
  private readonly _rating: number;
  private readonly _ingredients: string[] | null;
  constructor(props: IProductProps, guid?: UniqueEntityID) {
    super(guid);
    this._name = props.name;
    this._image = props.image;
    this._price = props.price;
    this._categoryGuid = props.categoryGuid;
    this._shopGuid = props.shopGuid;
    this._rating = props.rating;
    this._ingredients = props.ingredients;

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

  get price(): number {
    return this._price;
  }

  get categoryGuid(): UniqueEntityID {
    return this._categoryGuid;
  }

  get shopGuid(): UniqueEntityID {
    return this._shopGuid;
  }

  get rating(): number {
    return this._rating;
  }

  get ingredients(): string[] | null {
    return this._ingredients;
  }
}
