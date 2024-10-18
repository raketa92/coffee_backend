import { CardProvider } from "@core/constants";
import { ValueObject } from "@core/ValueObject";

export interface ICardProps {
  readonly cardNumber: string;
  readonly month: number;
  readonly year: number;
  readonly name: string;
  readonly cvv: number;
  readonly cardProvider: CardProvider;
}

export class Card extends ValueObject<ICardProps> {
  private readonly _cardNumber: string;
  private readonly _month: number;
  private readonly _year: number;
  private readonly _name: string;
  private readonly _cvv: number;
  private readonly _cardProvider: CardProvider;
  constructor(props: ICardProps) {
    super(props);
    this._cardNumber = props.cardNumber;
    this._month = props.month;
    this._year = props.year;
    this._name = props.name;
    this._cvv = props.cvv;
    this._cardProvider = props.cardProvider;
  }

  toJSON() {
    return {
      cardNumber: this._cardNumber,
      month: this._month,
      year: this._year,
      name: this._name,
      cvv: this._cvv,
      cardProvider: this._cardProvider,
    };
  }

  get cardNumber(): string {
    return this._cardNumber;
  }

  get month(): number {
    return this._month;
  }

  get year(): number {
    return this._year;
  }

  get name(): string {
    return this._name;
  }

  get cvv(): number {
    return this._cvv;
  }

  get cardProvider(): CardProvider {
    return this._cardProvider;
  }
}
