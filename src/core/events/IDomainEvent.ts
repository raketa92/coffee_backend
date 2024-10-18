import { UniqueEntityID } from "@core/UniqueEntityID";

export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId: () => UniqueEntityID;
}
