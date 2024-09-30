import { UniqueEntityID } from "./UniqueEntityID";

const isEntity = (v: any): v is Entity<any> => {
  return v instanceof Entity;
};

export abstract class Entity<TInitProps> {
  protected readonly _guid: UniqueEntityID;

  constructor(guid?: UniqueEntityID) {
    this._guid = guid || new UniqueEntityID();
  }

  public equals(object?: Entity<TInitProps>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._guid.equals(object._guid);
  }
}
