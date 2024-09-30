import { Entity } from "../../core/Entity";
import { UniqueEntityID } from "../../core/UniqueEntityID";

export interface IProductProps {
  name: string;
  price: number;
  categoryId: UniqueEntityID;
  shopId: UniqueEntityID;
  rating: number;
  ingredients: string[];
}

export class Product extends Entity<IProductProps> {
  private readonly _name: string;
  private readonly _price: number;
  private readonly _categoryId: UniqueEntityID;
  private readonly _shopId: UniqueEntityID;
  private readonly _rating: number;
  private readonly _ingredients: string[];
  constructor(props: IProductProps, guid?: UniqueEntityID) {
    super(guid);
    this._price = props.price;
    this._categoryId = props.categoryId;
    this._shopId = props.shopId;
    this._rating = props.rating;
    this._ingredients = props.ingredients;
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get name(): string {
    return this._name;
  }

  get price(): number {
    return this._price;
  }

  get categoryId(): UniqueEntityID {
    return this._categoryId;
  }

  get shopId(): UniqueEntityID {
    return this._shopId;
  }

  get rating(): number {
    return this._rating;
  }

  get ingredients(): string[] {
    return this._ingredients;
  }
}
