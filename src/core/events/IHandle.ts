/* eslint-disable @typescript-eslint/no-unused-vars */
import { IDomainEvent } from "@core/events/IDomainEvent";

export interface IHandle<IDomainEvent> {
  setupSubscription: () => void;
}
