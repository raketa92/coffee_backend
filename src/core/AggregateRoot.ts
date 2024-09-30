import { Entity } from "./Entity";
import { DomainEvents } from "./events/DomainEvents";
import { IDomainEvent } from "./events/IDomainEvent";
import { UniqueEntityID } from "./UniqueEntityID";

export abstract class AggregateRoot<TInitProps> extends Entity<TInitProps> {
  private readonly _domainEvents: IDomainEvent[] = [];

  get guid(): UniqueEntityID {
    return this._guid;
  }

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: IDomainEvent): void {
    this._domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
    this.logDomainEventAdded(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }

  private logDomainEventAdded(domainEvent: IDomainEvent): void {
    const thisClass = Reflect.getPrototypeOf(this);
    const domainEventClass = Reflect.getPrototypeOf(domainEvent);
    if (!thisClass || !domainEventClass) {
      console.log(
        "[Domain Event Created]: ",
        thisClass,
        "==>",
        domainEventClass
      );
      return;
    }
    console.log(
      `[Domain Event Created]:`,
      thisClass.constructor.name,
      "==>",
      domainEventClass.constructor.name
    );
  }
}
