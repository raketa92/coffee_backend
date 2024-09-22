import { shallowEqual } from 'shallow-equal-object';

type IValueObjectProps = Record<string, any>;

export abstract class ValueObject<T extends IValueObjectProps> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props); // need to close for modification
  }

  public isEqualTo(valueObject?: ValueObject<T>): boolean {
    if (valueObject?.props === undefined) {
      return false;
    }
    return shallowEqual(this.props, valueObject.props);
  }
}
