import { UniqueEntityID } from "../../core/UniqueEntityID";
import { Entity } from "../../core/Entity";
import { CardProvider } from "../../core/constants";

export interface ICardProps {
  readonly cardNumber: string;
  readonly month: number;
  readonly year: number;
  readonly name: string;
  readonly cvv: number;
  readonly cardProvider: CardProvider;
}

export class Card extends Entity<ICardProps> {
  private readonly _cardNumber: string;
  private readonly _month: number;
  private readonly _year: number;
  private readonly _name: string;
  private readonly _cvv: number;
  private readonly _cardProvider: CardProvider;
  constructor(props: ICardProps, guid?: UniqueEntityID) {
    super(guid);
    this._cardNumber = props.cardNumber;
    this._month = props.month;
    this._year = props.year;
    this._name = props.name;
    this._cvv = props.cvv;
    this._cardProvider = props.cardProvider;
  }

  get guid(): UniqueEntityID {
    return this._guid;
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
