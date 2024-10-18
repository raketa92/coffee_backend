import { Entity } from "@core/Entity";
import { UniqueEntityID } from "@core/UniqueEntityID";

export interface ICategoryProps {
  name: string;
  iconUrl: string;
}

export class Category extends Entity<ICategoryProps> {
  private readonly _name: string;
  private readonly _iconUrl: string;

  constructor(props: ICategoryProps, guid?: UniqueEntityID) {
    super(guid);
    this._name = props.name;
    this._iconUrl = props.iconUrl;
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
