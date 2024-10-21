import { Entity } from "@core/Entity";
import { UniqueEntityID } from "@core/UniqueEntityID";

export interface ICategoryProps {
  name: string;
  iconUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Category extends Entity<ICategoryProps> {
  private readonly _name: string;
  private readonly _iconUrl: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: ICategoryProps, guid?: UniqueEntityID) {
    super(guid);
    this._name = props.name;
    this._iconUrl = props.iconUrl;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get name(): string {
    return this._name;
  }

  get iconUrl(): string {
    return this._iconUrl;
  }
}
