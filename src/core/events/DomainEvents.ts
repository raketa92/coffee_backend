import { AggregateRoot } from '../AggregateRoot';
import { UniqueEntityID } from '../UniqueEntityID';
import { IDomainEvent } from './IDomainEvent';

type ClassName = string;
type EventCallback = (event: IDomainEvent) => void;
type HandlersMap = Record<ClassName, EventCallback[]>;

export class DomainEvents {
  private static handlersMap: HandlersMap = {};
  private static markedAggregates: Array<AggregateRoot<any>> = [];

  /**
   * @method markAggregateForDispatch
   * @static
   * @desc Called by aggregate root objects that have created domain
   * events to eventually be dispatched when the infrastructure commits
   * the unit of work.
   */

  public static markAggregateForDispatch(aggregate: AggregateRoot<any>): void {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.guid);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>): void {
    aggregate.domainEvents.forEach((event: IDomainEvent) => {
      this.dispatch(event);
    });
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<any>,
  ): void {
    const index = this.markedAggregates.findIndex((e) => e.equals(aggregate));
    this.markedAggregates.splice(index, 1);
  }

  public static findMarkedAggregateByID(
    id: UniqueEntityID,
  ): AggregateRoot<any> | null {
    let found: AggregateRoot<any> | null = null;
    for (const aggregate of this.markedAggregates) {
      if (aggregate.guid.equals(id)) {
        found = aggregate;
      }
    }
    return found;
  }

  public static dispatchEventsForAggregate(id: UniqueEntityID): void {
    const aggregate = this.findMarkedAggregateByID(id);
    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  public static register(
    callback: EventCallback,
    eventClassName: ClassName,
  ): void {
    if (!this.handlersMap.hasOwnProperty(eventClassName)) {
      this.handlersMap[eventClassName] = [];
    }
    this.handlersMap[eventClassName].push(callback);
  }

  public static clearHandlers(): void {
    this.handlersMap = {};
  }

  public static clearMarkedAggregates(): void {
    this.markedAggregates = [];
  }

  private static dispatch(event: IDomainEvent): void {
    const eventClassName: ClassName = event.constructor.name;

    if (this.handlersMap.hasOwnProperty(eventClassName)) {
      const handlers: any[] = this.handlersMap[eventClassName];
      // NOTE: for async processes use await
      for (const handler of handlers) {
        handler(event);
      }
    }
  }
}
